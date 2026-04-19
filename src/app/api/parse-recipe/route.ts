import { NextRequest, NextResponse } from 'next/server';
import { parseRecipeFromText, parseRecipeFromImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageBase64, imageMimeType, url } = body;

    let parsed;

    if (imageBase64) {
      // Parse from uploaded image
      parsed = await parseRecipeFromImage(
        imageBase64,
        imageMimeType || 'image/jpeg'
      );
    } else if (text) {
      // Parse from pasted text
      parsed = await parseRecipeFromText(text);
    } else if (url) {
      // Fetch URL content and parse
      try {
        const res = await fetch(url);
        const html = await res.text();
        // Extract visible text (simple approach)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 5000); // Limit context
        parsed = await parseRecipeFromText(textContent);
      } catch {
        return NextResponse.json(
          { error: 'Failed to fetch recipe from URL' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Please provide recipe text, an image, or a URL' },
        { status: 400 }
      );
    }

    return NextResponse.json({ recipe: parsed });
  } catch (error: unknown) {
    console.error('Recipe parsing error:', error);

    const errMsg = error instanceof Error ? error.message : String(error);

    // Detect rate limiting
    if (errMsg.includes('429') || errMsg.includes('rate-limit') || errMsg.includes('quota')) {
      return NextResponse.json(
        { error: 'Gemini API rate limit reached. Please wait 30 seconds and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to parse recipe. Please try again.' },
      { status: 500 }
    );
  }
}
