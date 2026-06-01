/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp,
  addDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Ingredient, Recipe, InventoryLog } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const subscribeToIngredients = (callback: (ingredients: Ingredient[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const q = query(collection(db, 'ingredients'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const ingredients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
    callback(ingredients);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'ingredients');
  });
};

export const subscribeToRecipes = (callback: (recipes: Recipe[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const q = query(collection(db, 'recipes'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    callback(recipes);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'recipes');
  });
};

export const saveIngredient = async (ingredient: Omit<Ingredient, 'id'> & { id?: string }) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const { id, ...data } = ingredient;

  try {
    if (id) {
      const docRef = doc(db, 'ingredients', id);
      await updateDoc(docRef, { ...data, userId });
    } else {
      const colRef = collection(db, 'ingredients');
      await addDoc(colRef, { ...data, userId });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'ingredients');
  }
};

export const deleteIngredient = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ingredients', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `ingredients/${id}`);
  }
};

export const saveRecipe = async (recipe: Omit<Recipe, 'id'> & { id?: string }) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const { id, ...data } = recipe;

  try {
    if (id) {
      const docRef = doc(db, 'recipes', id);
      await updateDoc(docRef, { ...data, userId });
    } else {
      const colRef = collection(db, 'recipes');
      await addDoc(colRef, { ...data, userId });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'recipes');
  }
};

export const deleteRecipe = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'recipes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `recipes/${id}`);
  }
};

export const cookRecipe = async (recipe: Recipe, unitsProduced: number, ingredients: Ingredient[]) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  try {
    const ratio = unitsProduced / recipe.yield;
    
    // Update each ingredient quantity atomically using increment
    for (const recipeIng of recipe.ingredients) {
      const ingredient = ingredients.find(i => i.id === recipeIng.ingredientId);
      if (ingredient) {
        const amountToSubtract = recipeIng.amount * ratio;
        const docRef = doc(db, 'ingredients', ingredient.id);
        // Use increment with a negative value for atomic subtraction
        await updateDoc(docRef, {
          currentQuantity: increment(-amountToSubtract)
        });
      }
    }

    // Log the production
    await addDoc(collection(db, 'logs'), {
      userId,
      date: Timestamp.now(),
      type: 'consumption',
      recipeId: recipe.id,
      recipeName: recipe.name,
      unitsProduced,
      note: `Producción de ${unitsProduced} unidades de ${recipe.name}`
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'production_log');
  }
};
