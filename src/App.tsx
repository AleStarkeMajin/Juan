/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Utensils, ShoppingCart, Settings, LogOut, LogIn, ChefHat } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import { auth, signIn, signOut } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  subscribeToIngredients, 
  subscribeToRecipes, 
  saveIngredient, 
  deleteIngredient, 
  saveRecipe, 
  deleteRecipe, 
  cookRecipe 
} from './services/dataService';

import { Ingredient, Recipe } from './types';
import { InventoryTable } from './components/InventoryTable';
import { RecipeList } from './components/RecipeList';
import { IngredientDialog } from './components/IngredientDialog';
import { RecipeDialog } from './components/RecipeDialog';
import { CookDialog } from './components/CookDialog';
import { calculateIngredientCost } from './lib/calculations';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Dialog states
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  const [isCookDialogOpen, setIsCookDialogOpen] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubIng = subscribeToIngredients(setIngredients);
      const unsubRec = subscribeToRecipes(setRecipes);
      return () => {
        unsubIng();
        unsubRec();
      };
    } else {
      setIngredients([]);
      setRecipes([]);
    }
  }, [user]);

  const replenishmentCost = useMemo(() => {
    return ingredients.reduce((total, ing) => {
      if (ing.currentQuantity < ing.threshold) {
        return total + ing.price;
      }
      return total;
    }, 0);
  }, [ingredients]);

  const handleSaveIngredient = async (data: Omit<Ingredient, 'id'> & { id?: string }) => {
    try {
      await saveIngredient(data);
      toast.success(data.id ? 'Ingrediente actualizado' : 'Ingrediente añadido');
    } catch (error) {
      toast.error('Error al guardar ingrediente');
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este ingrediente?')) {
      try {
        await deleteIngredient(id);
        toast.success('Ingrediente eliminado');
      } catch (error) {
        toast.error('Error al eliminar ingrediente');
      }
    }
  };

  const handleSaveRecipe = async (data: Omit<Recipe, 'id'> & { id?: string }) => {
    try {
      await saveRecipe(data);
      toast.success(data.id ? 'Receta actualizada' : 'Receta añadida');
    } catch (error) {
      toast.error('Error al guardar receta');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta receta?')) {
      try {
        await deleteRecipe(id);
        toast.success('Receta eliminada');
      } catch (error) {
        toast.error('Error al eliminar receta');
      }
    }
  };

  const handleConfirmProduction = async (recipe: Recipe, units: number) => {
    try {
      await cookRecipe(recipe, units, ingredients);
      toast.success(`Producción de ${units} unidades de ${recipe.name} registrada`);
    } catch (error) {
      toast.error('Error al registrar producción');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <ChefHat className="w-12 h-12 text-zinc-900 animate-bounce" />
          <p className="text-zinc-500 font-medium">Cargando Sabor & Stock...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <Card className="w-full max-w-md border-zinc-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight">Sabor & Stock</CardTitle>
              <CardDescription className="text-zinc-500">Inicia sesión para gestionar tu inventario</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={signIn} 
              className="w-full py-6 bg-zinc-900 text-white hover:bg-zinc-800 flex items-center justify-center gap-3 text-lg font-semibold"
            >
              <LogIn className="w-5 h-5" />
              Entrar con Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Sabor & Stock</h1>
              <p className="text-zinc-500 mt-1">Hola, {user.displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Card className="bg-white shadow-sm border-zinc-200 hidden sm:block">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reposición estimada</p>
                  <p className="text-xl font-black text-zinc-900">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(replenishmentCost)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-400 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-zinc-200 p-1 h-auto self-start shadow-sm">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white px-6 py-2.5 flex items-center gap-2 transition-all">
              <Package className="w-4 h-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="recipes" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white px-6 py-2.5 flex items-center gap-2 transition-all">
              <Utensils className="w-4 h-4" />
              Recetas
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white px-6 py-2.5 flex items-center gap-2 transition-all">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4 outline-none">
            <Card className="border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-zinc-100">
                <CardTitle className="text-2xl font-bold">Ingredientes</CardTitle>
                <CardDescription>Controla tus existencias y precios del mercado</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <InventoryTable 
                  ingredients={ingredients}
                  onAdd={() => {
                    setEditingIngredient(null);
                    setIsIngredientDialogOpen(true);
                  }}
                  onEdit={(ing) => {
                    setEditingIngredient(ing);
                    setIsIngredientDialogOpen(true);
                  }}
                  onDelete={handleDeleteIngredient}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4 outline-none">
            <Card className="border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-zinc-100">
                <CardTitle className="text-2xl font-bold">Recetario</CardTitle>
                <CardDescription>Gestiona tus preparaciones y calcula rentabilidad</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RecipeList 
                  recipes={recipes}
                  ingredients={ingredients}
                  onAdd={() => {
                    setEditingRecipe(null);
                    setIsRecipeDialogOpen(true);
                  }}
                  onEdit={(recipe) => {
                    setEditingRecipe(recipe);
                    setIsRecipeDialogOpen(true);
                  }}
                  onCook={(recipe) => {
                    setCookingRecipe(recipe);
                    setIsCookDialogOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
             <Card className="border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>Ajustes de la aplicación y perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="font-medium text-zinc-900">Usuario: {user.displayName}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
                <p className="text-zinc-400 text-sm italic">Más opciones de personalización próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <IngredientDialog 
        open={isIngredientDialogOpen}
        onOpenChange={setIsIngredientDialogOpen}
        ingredient={editingIngredient}
        onSave={handleSaveIngredient}
      />

      <RecipeDialog 
        open={isRecipeDialogOpen}
        onOpenChange={setIsRecipeDialogOpen}
        recipe={editingRecipe}
        ingredients={ingredients}
        onSave={handleSaveRecipe}
      />

      <CookDialog 
        open={isCookDialogOpen}
        onOpenChange={setIsCookDialogOpen}
        recipe={cookingRecipe}
        ingredients={ingredients}
        onConfirm={handleConfirmProduction}
      />

      <Toaster position="top-right" richColors />
    </div>
  );
}
