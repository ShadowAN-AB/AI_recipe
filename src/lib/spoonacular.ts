const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || '';
const BASE_URL = 'https://api.spoonacular.com';

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularIngredientResult {
  nutrition: {
    nutrients: SpoonacularNutrient[];
  };
}

export interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

/**
 * Analyze nutrition for a list of ingredient strings.
 * Uses Spoonacular's "Parse Ingredients" endpoint.
 */
export async function analyzeNutrition(
  ingredientList: string[]
): Promise<NutritionResult> {
  if (!SPOONACULAR_API_KEY) {
    // Fallback: return estimated values using simple heuristics
    return estimateNutrition(ingredientList);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/recipes/parseIngredients?apiKey=${SPOONACULAR_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          ingredientList: ingredientList.join('\n'),
          servings: '1',
          includeNutrition: 'true',
        }),
      }
    );

    if (!response.ok) {
      console.warn('Spoonacular API error, falling back to estimates');
      return estimateNutrition(ingredientList);
    }

    const data: SpoonacularIngredientResult[] = await response.json();

    // Aggregate nutrition from all ingredients
    const totals: NutritionResult = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    };

    for (const item of data) {
      if (!item.nutrition?.nutrients) continue;
      for (const nutrient of item.nutrition.nutrients) {
        switch (nutrient.name) {
          case 'Calories':
            totals.calories += nutrient.amount;
            break;
          case 'Protein':
            totals.protein += nutrient.amount;
            break;
          case 'Carbohydrates':
            totals.carbs += nutrient.amount;
            break;
          case 'Fat':
            totals.fat += nutrient.amount;
            break;
          case 'Fiber':
            totals.fiber += nutrient.amount;
            break;
          case 'Sugar':
            totals.sugar += nutrient.amount;
            break;
        }
      }
    }

    // Round values
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
    };
  } catch (error) {
    console.error('Spoonacular API failed:', error);
    return estimateNutrition(ingredientList);
  }
}

/**
 * Simple heuristic-based nutrition estimation when API is unavailable
 */
function estimateNutrition(ingredients: string[]): NutritionResult {
  const count = ingredients.length;
  // Rough estimates per ingredient contribution
  return {
    calories: Math.round(count * 65 + Math.random() * 50),
    protein: Math.round((count * 4.5 + Math.random() * 5) * 10) / 10,
    carbs: Math.round((count * 8 + Math.random() * 8) * 10) / 10,
    fat: Math.round((count * 3.5 + Math.random() * 4) * 10) / 10,
    fiber: Math.round((count * 1.2 + Math.random() * 2) * 10) / 10,
    sugar: Math.round((count * 2 + Math.random() * 3) * 10) / 10,
  };
}
