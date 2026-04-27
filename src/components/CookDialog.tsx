/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Recipe, Ingredient } from '@/src/types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe | null;
  ingredients: Ingredient[];
  onConfirm: (recipe: Recipe, unitsProduced: number) => void;
}

export function CookDialog({ open, onOpenChange, recipe, ingredients, onConfirm }: CookDialogProps) {
  const [units, setUnits] = useState(1);

  if (!recipe) return null;

  const getIngredientUsage = () => {
    return recipe.ingredients.map(ri => {
      const ingredient = ingredients.find(i => i.id === ri.ingredientId);
      const totalNeeded = ri.amount * (units / recipe.yield);
      const hasEnough = ingredient ? ingredient.currentQuantity >= totalNeeded : false;
      
      return {
        name: ingredient?.name || 'Desconocido',
        needed: totalNeeded,
        unit: ingredient?.unit || '',
        current: ingredient?.currentQuantity || 0,
        hasEnough
      };
    });
  };

  const usage = getIngredientUsage();
  const canCook = usage.every(u => u.hasEnough);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canCook) {
      onConfirm(recipe, units);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Preparar {recipe.name}</DialogTitle>
            <DialogDescription>
              Indica cuántas unidades vas a producir para descontar los ingredientes del inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="units-to-make">Unidades a producir</Label>
              <Input
                id="units-to-make"
                type="number"
                min="1"
                value={isNaN(units) ? '' : units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Resumen de Ingredientes</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {usage.map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded-md bg-zinc-50 border border-zinc-100">
                    <div>
                      <p className="font-medium text-zinc-900">{u.name}</p>
                      <p className="text-xs text-zinc-500">Necesario: {u.needed.toFixed(2)} {u.unit}</p>
                    </div>
                    <div className="text-right">
                      {u.hasEnough ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                      ) : (
                        <div className="flex items-center text-red-600 gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-[10px] font-bold">Falta stock</span>
                        </div>
                      )}
                      <p className="text-[10px] text-zinc-400">Stock: {u.current.toFixed(2)} {u.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!canCook && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  No tienes suficientes ingredientes para producir esta cantidad. Por favor, ajusta las unidades o repón tu inventario.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!canCook || units <= 0}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              Confirmar Producción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
