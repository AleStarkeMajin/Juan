/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { Recipe, Ingredient, RecipeIngredient } from '@/src/types';

interface RecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe?: Recipe | null;
  ingredients: Ingredient[];
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
}

interface RecipeIngredientWithKey extends RecipeIngredient {
  key: string;
}

export function RecipeDialog({ open, onOpenChange, recipe, ingredients, onSave }: RecipeDialogProps) {
  const [name, setName] = useState('');
  const [yieldAmount, setYieldAmount] = useState(1);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientWithKey[]>([]);

  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setYieldAmount(recipe.yield);
      setRecipeIngredients(recipe.ingredients.map(ri => ({ ...ri, key: Math.random().toString(36).substr(2, 9) })));
    } else {
      setName('');
      setYieldAmount(1);
      setRecipeIngredients([]);
    }
  }, [recipe, open]);

  const addIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { ingredientId: '', amount: 0, key: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeIngredient = (key: string) => {
    setRecipeIngredients(recipeIngredients.filter((ri) => ri.key !== key));
  };

  const updateIngredient = (key: string, field: keyof RecipeIngredient, value: string | number) => {
    setRecipeIngredients(prev => prev.map(ri => 
      ri.key === key ? { ...ri, [field]: value } : ri
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      yield: yieldAmount,
      ingredients: recipeIngredients
        .filter(ri => ri.ingredientId && ri.amount > 0)
        .map(({ key, ...rest }) => rest),
      id: recipe?.id
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{recipe ? 'Editar Receta' : 'Nueva Receta'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="recipe-name">Nombre de la Receta</Label>
                <Input
                  id="recipe-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Pastel de Chocolate"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="yield">Rendimiento (Unidades)</Label>
                <Input
                  id="yield"
                  type="number"
                  value={isNaN(yieldAmount) ? '' : yieldAmount}
                  onChange={(e) => setYieldAmount(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Ingredientes Necesarios</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir
                </Button>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-4">
                  {recipeIngredients.map((ri) => {
                    return (
                      <div key={ri.key} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Ingrediente</Label>
                          <Select
                            value={ri.ingredientId}
                            onValueChange={(value) => updateIngredient(ri.key, 'ingredientId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ingredients.map((ing) => (
                                <SelectItem key={ing.id} value={ing.id}>
                                  {ing.name} ({ing.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24 space-y-2">
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={isNaN(ri.amount) ? '' : ri.amount}
                            onChange={(e) => updateIngredient(ri.key, 'amount', parseFloat(e.target.value))}
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => removeIngredient(ri.key)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {recipeIngredients.length === 0 && (
                    <p className="text-center text-zinc-500 py-8">No has añadido ingredientes.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">
              Guardar Receta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
