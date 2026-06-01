/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Unit = 'kg' | 'g' | 'l' | 'ml' | 'un';

export interface Ingredient {
  id: string;
  name: string;
  currentQuantity: number;
  unit: Unit;
  price: number; // Price per purchase unit/package
  purchaseUnit: Unit;
  purchaseQuantity: number; // How many base units are in one purchase unit (e.g., 1000g in 1kg, 30 units in 1 tray)
  threshold: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: number; // Amount in the ingredient's base unit
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  yield: number; // How many units/portions this recipe produces
}

export interface InventoryLog {
  id: string;
  date: string;
  type: 'purchase' | 'consumption' | 'adjustment';
  ingredientId: string;
  amount: number;
  recipeId?: string;
  note?: string;
}
