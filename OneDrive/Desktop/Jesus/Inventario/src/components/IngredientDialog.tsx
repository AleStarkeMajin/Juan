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
import { Ingredient, Unit } from '@/src/types';

interface IngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient | null;
  onSave: (ingredient: Omit<Ingredient, 'id'> & { id?: string }) => void;
}

const UNITS: Unit[] = ['kg', 'g', 'l', 'ml', 'un'];

export function IngredientDialog({ open, onOpenChange, ingredient, onSave }: IngredientDialogProps) {
  const [formData, setFormData] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    currentQuantity: 0,
    unit: 'kg',
    price: 0,
    purchaseUnit: 'kg',
    purchaseQuantity: 1,
    threshold: 0,
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        currentQuantity: ingredient.currentQuantity,
        unit: ingredient.unit,
        price: ingredient.price,
        purchaseUnit: ingredient.purchaseUnit,
        purchaseQuantity: ingredient.purchaseQuantity || 1,
        threshold: ingredient.threshold,
      });
    } else {
      setFormData({
        name: '',
        currentQuantity: 0,
        unit: 'kg',
        price: 0,
        purchaseUnit: 'kg',
        purchaseQuantity: 1,
        threshold: 0,
      });
    }
  }, [ingredient, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: ingredient?.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{ingredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Harina de Trigo"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Cantidad Actual</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={isNaN(formData.currentQuantity) ? '' : formData.currentQuantity}
                  onChange={(e) => setFormData({ ...formData, currentQuantity: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unidad Base</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: Unit) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">Umbral de Alerta (Mínimo)</Label>
              <Input
                id="threshold"
                type="number"
                step="0.01"
                value={isNaN(formData.threshold) ? '' : formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                required
              />
            </div>
            
            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-semibold mb-4">Información de Compra</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio p/ Paquete</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={isNaN(formData.price) ? '' : formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchaseQuantity">Cant. p/ Paquete</Label>
                  <Input
                    id="purchaseQuantity"
                    type="number"
                    step="0.01"
                    value={isNaN(formData.purchaseQuantity) ? '' : formData.purchaseQuantity}
                    onChange={(e) => setFormData({ ...formData, purchaseQuantity: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">
                Ej: Si compras un cartón de 30 huevos, pon Precio: $5 y Cantidad: 30.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
