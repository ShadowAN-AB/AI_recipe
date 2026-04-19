import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Model fallback chain: try newer models first (separate quotas)
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

function getClient() {
  if (!GEMINI_API_KEY) {
    throw new Error('Please define GEMINI_API_KEY in .env.local');
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

// Retry with exponential backoff + model fallback
async function generateWithRetry(
  client: GoogleGenAI,
  options: { contents: string | object[]; config: object },
  maxRetries = 3
) {
  let lastError: unknown = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Trying ${model} (attempt ${attempt + 1}/${maxRetries})...`);
        const response = await client.models.generateContent({
          model,
          ...options,
        });
        console.log(`✅ Success with ${model}`);
        return response;
      } catch (error: unknown) {
        lastError = error;
        const apiError = error as { status?: number; message?: string };
        const isRateLimit = apiError.status === 429;
        const isServerError = apiError.status && apiError.status >= 500;

        if (isRateLimit && attempt < maxRetries - 1) {
          // Longer waits: 10s, 20s, 40s
          const waitTime = 10000 * Math.pow(2, attempt);
          console.log(`Rate limited on ${model}, retrying in ${waitTime / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (isRateLimit) {
          console.log(`Rate limited on ${model} after ${maxRetries} attempts, trying next model...`);
          break;
        }

        if (isServerError && attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // Non-retryable error (not rate limit, not server error)
        throw error;
      }
    }
  }

  // If all models are rate-limited, throw a descriptive error
  const errMsg = lastError instanceof Error ? lastError.message : '';
  if (errMsg.includes('429') || errMsg.includes('quota')) {
    throw new Error('RATE_LIMITED: Gemini API daily quota exhausted. Please wait a few minutes or upgrade your API plan.');
  }
  throw lastError || new Error('All Gemini models failed.');
}

const RECIPE_PARSE_PROMPT = `You are an expert culinary assistant. Parse the following recipe and extract structured data.

Return a JSON object with these exact fields:
{
  "title": "Recipe title",
  "description": "Brief 1-2 sentence description",
  "ingredients": [
    { "name": "ingredient name", "amount": 1.0, "unit": "cup", "category": "Produce" }
  ],
  "instructions": ["Step 1...", "Step 2..."],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "tags": ["tag1", "tag2"],
  "category": "Dinner"
}

Rules:
- For "amount", always use a decimal number (e.g., 0.5 instead of "1/2")
- For "unit", standardize to: "cup", "tbsp", "tsp", "oz", "lb", "g", "kg", "ml", "l", "piece", "clove", "pinch", "whole", "slice", or "to taste"
- For "category" in ingredients, use: "Produce", "Dairy", "Meat", "Seafood", "Grains", "Spices", "Oils", "Baking", "Canned", "Frozen", "Beverages", "Other"
- For recipe "category", use one of: "Healthy", "Desserts", "Quick Meals", "Breakfast", "Lunch", "Dinner", "Snacks", "Vegetarian", "Uncategorized"
- "prepTime" and "cookTime" should be in minutes
- Generate relevant tags like "gluten-free", "high-protein", "comfort-food", etc.
- Return ONLY the JSON object, no markdown, no explanation`;

export async function parseRecipeFromText(text: string) {
  const client = getClient();
  const response = await generateWithRetry(client, {
    contents: `${RECIPE_PARSE_PROMPT}\n\nRecipe text:\n${text}`,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const jsonText = response.text || '{}';
  return JSON.parse(jsonText);
}

export async function parseRecipeFromImage(base64Image: string, mimeType: string = 'image/jpeg') {
  const client = getClient();
  const response = await generateWithRetry(client, {
    contents: [
      {
        role: 'user',
        parts: [
          { text: RECIPE_PARSE_PROMPT + '\n\nExtract the recipe from this image:' },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const jsonText = response.text || '{}';
  return JSON.parse(jsonText);
}

export async function generateRecommendations(preferences: {
  goal: string;
  diet: string;
  allergies: string[];
  maxCalories?: number;
}) {
  const client = getClient();
  const prompt = `You are a nutrition-aware chef. Generate 6 recipe suggestions based on these user preferences:

Goal: ${preferences.goal}
Diet: ${preferences.diet}
Allergies to avoid: ${preferences.allergies.join(', ') || 'None'}
${preferences.maxCalories ? `Max calories per serving: ${preferences.maxCalories}` : ''}

Return a JSON array of recipe objects:
[
  {
    "title": "Recipe Name",
    "description": "Brief description",
    "estimatedCalories": 350,
    "tags": ["high-protein", "quick"],
    "difficulty": "Easy",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["Step 1", "Step 2"]
  }
]

Rules:
- Make recipes realistic, delicious, and achievable
- Ensure nutritional alignment with the user's goal
- Vary the meal types (breakfast, lunch, dinner, snack)
- Difficulty should be "Easy", "Medium", or "Hard"
- Return ONLY the JSON array`;

  const response = await generateWithRetry(client, {
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.8,
    },
  });

  const jsonText = response.text || '[]';
  return JSON.parse(jsonText);
}
