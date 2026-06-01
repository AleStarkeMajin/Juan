/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Firebase-backed implementation
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  runTransaction,
  getDoc
} from 'firebase/firestore';
import { db, auth, ensureSignedIn } from '../lib/firebase';
import { Ingredient, Recipe, InventoryLog } from '../types';

const ensureUserId = () => (auth && (auth as any).currentUser ? (auth as any).currentUser.uid : 'anonymous');

export const subscribeToIngredients = (callback: (ingredients: Ingredient[]) => void) => {
  let unsub: (() => void) | null = null;
  const start = () => {
    const userId = ensureUserId();
    const q = query(collection(db, 'ingredients'), where('userId', '==', userId));
    unsub = onSnapshot(q, (snap) => {
      const items: Ingredient[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      callback(items || []);
    }, (err) => {
      console.error('Ingredients snapshot error', err);
      callback([]);
    });
  };

  if (auth && (auth as any).currentUser) {
    start();
  } else {
    ensureSignedIn().then(() => start()).catch((err) => {
      console.debug('Could not sign in before subscribing to ingredients', err);
      callback([]);
    });
  }

  return () => { if (unsub) unsub(); };
};

export const subscribeToRecipes = (callback: (recipes: Recipe[]) => void) => {
  let unsub: (() => void) | null = null;
  const start = () => {
    const userId = ensureUserId();
    const q = query(collection(db, 'recipes'), where('userId', '==', userId));
    unsub = onSnapshot(q, (snap) => {
      const items: Recipe[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      callback(items || []);
    }, (err) => {
      console.error('Recipes snapshot error', err);
      callback([]);
    });
  };

  if (auth && (auth as any).currentUser) {
    start();
  } else {
    ensureSignedIn().then(() => start()).catch((err) => {
      console.debug('Could not sign in before subscribing to recipes', err);
      callback([]);
    });
  }

  return () => { if (unsub) unsub(); };
};

export const saveIngredient = async (ingredient: Omit<Ingredient, 'id'> & { id?: string }) => {
  const { id, ...data } = ingredient;
  const userId = ensureUserId();
  try {
    if (id) {
      const ref = doc(db, 'ingredients', id);
      await setDoc(ref, { ...data, userId, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'ingredients'), { ...data, userId, createdAt: serverTimestamp() });
      return ref.id;
    }
  } catch (err) {
    console.error('Error saving ingredient to Firestore', err);
    throw err;
  }
};

export const deleteIngredient = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ingredients', id));
  } catch (err) {
    console.error('Error deleting ingredient', err);
    throw err;
  }
};

export const saveRecipe = async (recipe: Omit<Recipe, 'id'> & { id?: string }) => {
  const { id, ...data } = recipe;
  const userId = ensureUserId();
  try {
    if (id) {
      const ref = doc(db, 'recipes', id);
      await setDoc(ref, { ...data, userId, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'recipes'), { ...data, userId, createdAt: serverTimestamp() });
      return ref.id;
    }
  } catch (err) {
    console.error('Error saving recipe', err);
    throw err;
  }
};

export const deleteRecipe = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'recipes', id));
  } catch (err) {
    console.error('Error deleting recipe', err);
    throw err;
  }
};

export const cookRecipe = async (recipe: Recipe, unitsProduced: number, ingredients: Ingredient[]) => {
  const ratio = unitsProduced / recipe.yield;
  try {
    await runTransaction(db, async (tx) => {
      // Update ingredients quantities
      for (const recipeIng of recipe.ingredients) {
        const ingRef = doc(db, 'ingredients', recipeIng.ingredientId);
        const ingSnap = await tx.get(ingRef);
        if (!ingSnap.exists()) continue;
        const ingData = ingSnap.data() as any;
        const newQty = (ingData.currentQuantity || 0) - (recipeIng.amount * ratio);
        tx.update(ingRef, { currentQuantity: newQty, updatedAt: serverTimestamp() });
      }

      // Add log entry
      const logsRef = collection(db, 'logs');
      tx.set(doc(logsRef), {
        userId: ensureUserId(),
        date: serverTimestamp(),
        type: 'consumption',
        recipeId: recipe.id,
        recipeName: recipe.name,
        unitsProduced,
        note: `Producción de ${unitsProduced} unidades de ${recipe.name}`
      } as any);
    });
  } catch (err) {
    console.error('Error during cook transaction', err);
    throw err;
  }
};
