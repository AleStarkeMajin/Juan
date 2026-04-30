/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Plus, Calculator, ChefHat, Trash2, FileText } from 'lucide-react';
import { Recipe, Ingredient } from '@/src/types';
import { calculateIngredientCost, formatCurrency } from '@/src/lib/calculations';

interface RecipeListProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onCook: (recipe: Recipe) => void;
  onAdd: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeList({ recipes, ingredients, onCook, onAdd, onEdit, onDelete }: RecipeListProps) {
  const getRecipeCost = (recipe: Recipe) => {
    return recipe.ingredients.reduce((total, recipeIng) => {
      const ingredient = ingredients.find(i => i.id === recipeIng.ingredientId);
      if (!ingredient) return total;
      return total + calculateIngredientCost(ingredient, recipeIng.amount, ingredient.unit);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="bg-zinc-900 text-white hover:bg-zinc-800">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Receta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed rounded-xl">
            No hay recetas registradas.
          </div>
        ) : (
          recipes.map((recipe) => {
            const totalCost = getRecipeCost(recipe);
            const costPerUnit = totalCost / recipe.yield;
            const suggestedPrice = costPerUnit * 3;

            return (
              <Card key={recipe.id} className="group hover:shadow-md transition-shadow border-zinc-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold">{recipe.name}</CardTitle>
                      {recipe.description && (
                        <p className="text-xs text-zinc-500 italic line-clamp-1">
                          {recipe.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      Rinde: {recipe.yield} unidades
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onDelete(recipe.id)} className="text-zinc-400 hover:text-red-600 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChefHat className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recipe.description && (
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 border-dashed">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3 h-3 text-zinc-400" />
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Preparación</span>
                      </div>
                      <p className="text-xs text-zinc-600 line-clamp-3 whitespace-pre-wrap">{recipe.description}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Desglose de Costos</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                        <p className="text-[10px] text-zinc-500 uppercase">Costo Total</p>
                        <p className="text-lg font-bold text-zinc-900">{formatCurrency(totalCost)}</p>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                        <p className="text-[10px] text-zinc-500 uppercase">Costo p/u</p>
                        <p className="text-lg font-bold text-zinc-900">{formatCurrency(costPerUnit)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-orange-600 uppercase font-bold">Precio Sugerido (x3)</p>
                        <p className="text-xl font-black text-orange-700">{formatCurrency(suggestedPrice)}</p>
                      </div>
                      <Calculator className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-0">
                  <Button onClick={() => onCook(recipe)} className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">
                    <Utensils className="w-4 h-4 mr-2" />
                    Preparar
                  </Button>
                  <Button variant="outline" onClick={() => onEdit(recipe)} className="border-zinc-200 hover:bg-zinc-50">
                    Editar
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
