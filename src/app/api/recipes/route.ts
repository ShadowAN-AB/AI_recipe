import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

// GET /api/recipes — List all recipes
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const bookmarked = searchParams.get('bookmarked');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (bookmarked === 'true') {
      query.isBookmarked = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(query),
    ]);

    return NextResponse.json({
      recipes: recipes.map((r) => ({
        ...r,
        _id: r._id.toString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes — Save a new recipe
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const recipe = await Recipe.create(body);

    return NextResponse.json(
      {
        recipe: {
          ...recipe.toObject(),
          _id: recipe._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    );
  }
}
