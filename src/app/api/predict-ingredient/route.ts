import { NextRequest, NextResponse } from 'next/server';

const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:5050';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { image, top_k = 5 } = data;

    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Forward the base64 image to the ML prediction server
    const response = await fetch(`${ML_SERVER_URL}/predict-base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, top_k }),
    });

    if (!response.ok) {
      // If ML server is not available, return a helpful error
      return NextResponse.json(
        {
          error: 'ML prediction server is not available',
          hint: 'Start the server with: python3 ml/predict_server.py',
        },
        { status: 503 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ingredient prediction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to predict ingredient',
        hint: 'Make sure the ML server is running: python3 ml/predict_server.py',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Proxy the /classes endpoint
    const response = await fetch(`${ML_SERVER_URL}/classes`);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'ML server unavailable' },
        { status: 503 }
      );
    }
    const result = await response.json();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: 'ML server not running',
        hint: 'Start with: python3 ml/predict_server.py',
      },
      { status: 503 }
    );
  }
}
