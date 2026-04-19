import { NextRequest, NextResponse } from 'next/server';
import { analyzeNutrition } from '@/lib/spoonacular';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of ingredient strings' },
        { status: 400 }
      );
    }

    const nutrition = await analyzeNutrition(ingredients);

    return NextResponse.json({ nutrition });
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze nutrition' },
      { status: 500 }
    );
  }
}
