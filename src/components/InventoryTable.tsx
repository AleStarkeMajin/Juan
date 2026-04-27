/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Ingredient } from '@/src/types';
import { formatCurrency } from '@/src/lib/calculations';

interface InventoryTableProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function InventoryTable({ ingredients, onEdit, onDelete, onAdd }: InventoryTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="bg-zinc-900 text-white hover:bg-zinc-800">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ingrediente
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="font-semibold">Ingrediente</TableHead>
              <TableHead className="font-semibold">Cantidad Actual</TableHead>
              <TableHead className="font-semibold">Umbral</TableHead>
              <TableHead className="font-semibold">Precio / Paquete</TableHead>
              <TableHead className="font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  No hay ingredientes registrados.
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ingredient) => {
                const isLow = ingredient.currentQuantity < ingredient.threshold;
                return (
                  <TableRow key={ingredient.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {ingredient.name}
                        {isLow && (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Bajo Stock
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={isLow ? 'text-red-600 font-bold' : 'text-zinc-700'}>
                        {ingredient.currentQuantity} {ingredient.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500">
                      {ingredient.threshold} {ingredient.unit}
                    </TableCell>
                    <TableCell className="text-zinc-700">
                      <div className="flex flex-col">
                        <span>{formatCurrency(ingredient.price)}</span>
                        <span className="text-[10px] text-zinc-400">por {ingredient.purchaseQuantity} {ingredient.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(ingredient)} className="text-zinc-500 hover:text-zinc-900">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(ingredient.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
