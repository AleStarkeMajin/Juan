/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Unit, Ingredient } from '../types';

export const convertUnits = (amount: number, from: Unit, to: Unit): number => {
  if (from === to) return amount;

  // Weight
  if (from === 'kg' && to === 'g') return amount * 1000;
  if (from === 'g' && to === 'kg') return amount / 1000;

  // Volume
  if (from === 'l' && to === 'ml') return amount * 1000;
  if (from === 'ml' && to === 'l') return amount / 1000;

  return amount;
};

export const calculateIngredientCost = (ingredient: Ingredient, amountUsed: number, unitUsed: Unit): number => {
  // First convert the amount used to the ingredient's base unit
  const amountInBaseUnit = convertUnits(amountUsed, unitUsed, ingredient.unit);
  
  // Then calculate cost based on how many purchase units that represents
  // cost = (amount / quantity_per_package) * price_per_package
  return (amountInBaseUnit / ingredient.purchaseQuantity) * ingredient.price;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD', // Or any other currency
  }).format(value);
};
