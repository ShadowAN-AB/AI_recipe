import { Ingredient, GroceryItem } from '@/types';

/**
 * Aggregate ingredients from multiple recipes into a unified grocery list.
 * Merges duplicate ingredients, normalizes names, and categorizes by aisle.
 */
export function aggregateIngredients(
  recipes: { title: string; ingredients: Ingredient[]; servingMultiplier?: number }[]
): GroceryItem[] {
  const ingredientMap = new Map<string, GroceryItem>();

  for (const recipe of recipes) {
    const multiplier = recipe.servingMultiplier || 1;

    for (const ing of recipe.ingredients) {
      const normalizedName = normalizeName(ing.name);
      const key = `${normalizedName}-${ing.unit.toLowerCase()}`;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.amount += ing.amount * multiplier;
        existing.amount = Math.round(existing.amount * 100) / 100;
        if (!existing.fromRecipes.includes(recipe.title)) {
          existing.fromRecipes.push(recipe.title);
        }
      } else {
        ingredientMap.set(key, {
          name: normalizedName,
          amount: ing.amount * multiplier,
          unit: ing.unit,
          category: ing.category || categorizeIngredient(normalizedName),
          checked: false,
          fromRecipes: [recipe.title],
        });
      }
    }
  }

  // Sort by category then name
  return Array.from(ingredientMap.values()).sort((a, b) => {
    const catCompare = a.category.localeCompare(b.category);
    if (catCompare !== 0) return catCompare;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Normalize ingredient names for comparison
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Singularize common patterns
    .replace(/ies$/, 'y')
    .replace(/oes$/, 'o')
    .replace(/ses$/, 's')
    .replace(/s$/, '')
    // Capitalize first letter
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Auto-categorize ingredients by aisle/type
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Produce: [
    'onion', 'garlic', 'tomato', 'lettuce', 'pepper', 'carrot', 'celery',
    'potato', 'mushroom', 'spinach', 'broccoli', 'lemon', 'lime', 'avocado',
    'cucumber', 'zucchini', 'corn', 'bean', 'pea', 'ginger', 'herb',
    'basil', 'cilantro', 'parsley', 'mint', 'kale', 'apple', 'banana',
    'berry', 'orange', 'cabbage', 'eggplant', 'squash',
  ],
  Dairy: [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream',
    'parmesan', 'mozzarella', 'cheddar', 'egg', 'whipped',
  ],
  Meat: [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'bacon', 'sausage',
    'ham', 'steak', 'ground', 'mince',
  ],
  Seafood: [
    'salmon', 'shrimp', 'fish', 'tuna', 'cod', 'crab', 'lobster',
    'tilapia', 'prawn', 'scallop',
  ],
  Grains: [
    'rice', 'pasta', 'bread', 'flour', 'noodle', 'oat', 'tortilla',
    'cereal', 'quinoa', 'couscous', 'cracker',
  ],
  Spices: [
    'salt', 'pepper', 'cumin', 'paprika', 'cinnamon', 'oregano',
    'thyme', 'rosemary', 'turmeric', 'chili', 'cayenne', 'nutmeg',
    'clove', 'coriander', 'bay leaf', 'seasoning',
  ],
  Oils: [
    'oil', 'olive', 'vegetable', 'coconut oil', 'sesame', 'vinegar',
    'soy sauce', 'sauce', 'dressing', 'mayo', 'mustard', 'ketchup',
  ],
  Baking: [
    'sugar', 'baking', 'vanilla', 'cocoa', 'chocolate', 'honey',
    'syrup', 'yeast', 'cornstarch', 'gelatin', 'extract',
  ],
  Canned: [
    'canned', 'broth', 'stock', 'tomato sauce', 'paste', 'soup',
    'condensed', 'coconut milk',
  ],
};

function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
}

/**
 * Group grocery items by category for display
 */
export function groupByCategory(
  items: GroceryItem[]
): Record<string, GroceryItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);
}
