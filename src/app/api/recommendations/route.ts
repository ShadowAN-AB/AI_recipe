import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, diet, allergies, maxCalories } = body;

    const recommendations = await generateRecommendations({
      goal: goal || 'general',
      diet: diet || 'none',
      allergies: allergies || [],
      maxCalories,
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
