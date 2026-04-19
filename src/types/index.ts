// ==============================
// AI Recipe Personalizer - Type Definitions
// ==============================

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category?: string;
  originalText?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface Recipe {
  _id?: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  imageUrl: string;
  nutrition: NutritionInfo;
  category: RecipeCategory;
  isBookmarked: boolean;
  tags: string[];
  source: 'text' | 'image' | 'url';
  createdAt?: string;
  updatedAt?: string;
}

export type RecipeCategory =
  | 'Healthy'
  | 'Desserts'
  | 'Quick Meals'
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snacks'
  | 'Vegetarian'
  | 'Uncategorized';

export interface ParsedRecipeResponse {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  tags: string[];
  category: RecipeCategory;
}

export interface GroceryItem {
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
  fromRecipes: string[];
}

export interface GroceryList {
  items: GroceryItem[];
  generatedAt: string;
}

export interface UserPreferences {
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general';
  diet: 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'gluten_free';
  allergies: string[];
  maxCalories?: number;
}

export interface RecommendedRecipe {
  title: string;
  description: string;
  estimatedCalories: number;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
}
