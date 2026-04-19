import { Ingredient } from '@/types';

/**
 * Scale ingredient quantities based on serving size change.
 */
export function scaleIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  targetServings: number
): Ingredient[] {
  if (originalServings <= 0 || targetServings <= 0) return ingredients;

  const ratio = targetServings / originalServings;

  return ingredients.map((ing) => ({
    ...ing,
    amount: Math.round(ing.amount * ratio * 100) / 100,
  }));
}

/**
 * Format an ingredient amount for display (e.g., 0.5 → "1/2", 0.25 → "1/4")
 */
export function formatAmount(amount: number): string {
  if (amount === 0) return '';

  const whole = Math.floor(amount);
  const fraction = amount - whole;

  // Common fraction mappings
  const fractions: Record<string, string> = {
    '0.125': '⅛',
    '0.25': '¼',
    '0.333': '⅓',
    '0.5': '½',
    '0.667': '⅔',
    '0.75': '¾',
  };

  const fractionKey = fraction.toFixed(3);
  const fractionStr = fractions[fractionKey];

  if (whole === 0 && fractionStr) return fractionStr;
  if (whole > 0 && fractionStr) return `${whole} ${fractionStr}`;
  if (fraction === 0) return whole.toString();

  // For non-standard fractions, show decimal
  return amount % 1 === 0 ? amount.toString() : amount.toFixed(1);
}

/**
 * Convert between common cooking units
 */
const unitConversions: Record<string, Record<string, number>> = {
  // Volume
  tsp: { tbsp: 1 / 3, cup: 1 / 48, ml: 4.929, l: 0.004929 },
  tbsp: { tsp: 3, cup: 1 / 16, ml: 14.787, l: 0.014787 },
  cup: { tsp: 48, tbsp: 16, ml: 236.588, l: 0.236588 },
  ml: { tsp: 0.2029, tbsp: 0.0676, cup: 0.00423, l: 0.001 },
  l: { tsp: 202.884, tbsp: 67.628, cup: 4.227, ml: 1000 },

  // Weight
  g: { kg: 0.001, oz: 0.03527, lb: 0.002205 },
  kg: { g: 1000, oz: 35.274, lb: 2.205 },
  oz: { g: 28.3495, kg: 0.02835, lb: 0.0625 },
  lb: { g: 453.592, kg: 0.4536, oz: 16 },
};

export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string
): number | null {
  if (fromUnit === toUnit) return amount;

  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (unitConversions[from]?.[to]) {
    return Math.round(amount * unitConversions[from][to] * 100) / 100;
  }

  return null; // Cannot convert between incompatible units
}

/**
 * Smart unit simplification (e.g., 48 tsp → 1 cup)
 */
export function simplifyUnit(amount: number, unit: string): { amount: number; unit: string } {
  const u = unit.toLowerCase();

  // Simplify teaspoons
  if (u === 'tsp' && amount >= 3) {
    if (amount >= 48) return { amount: Math.round(amount / 48 * 100) / 100, unit: 'cup' };
    return { amount: Math.round(amount / 3 * 100) / 100, unit: 'tbsp' };
  }

  // Simplify tablespoons
  if (u === 'tbsp' && amount >= 16) {
    return { amount: Math.round(amount / 16 * 100) / 100, unit: 'cup' };
  }

  // Simplify grams
  if (u === 'g' && amount >= 1000) {
    return { amount: Math.round(amount / 1000 * 100) / 100, unit: 'kg' };
  }

  // Simplify milliliters
  if (u === 'ml' && amount >= 1000) {
    return { amount: Math.round(amount / 1000 * 100) / 100, unit: 'l' };
  }

  // Simplify ounces
  if (u === 'oz' && amount >= 16) {
    return { amount: Math.round(amount / 16 * 100) / 100, unit: 'lb' };
  }

  return { amount, unit };
}
