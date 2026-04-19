import { NextRequest, NextResponse } from 'next/server';
import { aggregateIngredients } from '@/lib/groceryAggregator';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeIds, servingMultipliers } = body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return NextResponse.json(
        { error: 'Please provide recipe IDs' },
        { status: 400 }
      );
    }

    await dbConnect();

    const recipes = await Recipe.find({ _id: { $in: recipeIds } }).lean();

    const recipeData = recipes.map((recipe, index) => ({
      title: recipe.title,
      ingredients: recipe.ingredients,
      servingMultiplier: servingMultipliers?.[index] || 1,
    }));

    const groceryItems = aggregateIngredients(recipeData);

    return NextResponse.json({
      groceryList: {
        items: groceryItems,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Grocery list error:', error);
    return NextResponse.json(
      { error: 'Failed to generate grocery list' },
      { status: 500 }
    );
  }
}
