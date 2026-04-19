'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import RecipeInput from '@/components/RecipeInput';
import { ParsedRecipeResponse } from '@/types';
import { useState } from 'react';

export default function AddRecipePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleRecipeParsed = async (parsed: ParsedRecipeResponse) => {
    setSaving(true);
    try {
      // First get nutrition data
      const ingredientStrings = parsed.ingredients.map(
        (i) => `${i.amount} ${i.unit} ${i.name}`
      );

      let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
      try {
        const nutritionRes = await fetch('/api/nutrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients: ingredientStrings }),
        });
        const nutritionData = await nutritionRes.json();
        if (nutritionData.nutrition) {
          nutrition = nutritionData.nutrition;
        }
      } catch {
        console.warn('Nutrition fetch failed, using defaults');
      }

      // Save recipe to database
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed,
          nutrition,
          imageUrl: '',
          isBookmarked: false,
          source: 'text',
        }),
      });

      const data = await res.json();
      if (data.recipe?._id) {
        setToast('Recipe saved successfully!');
        setTimeout(() => {
          router.push(`/recipe/${data.recipe._id}`);
        }, 800);
      }
    } catch (error) {
      console.error('Failed to save recipe:', error);
      setToast('Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>
          <Sparkles size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Add Recipe
        </h1>
        <p>Paste text, upload an image, or enter a URL — AI will parse it for you</p>
      </div>

      <RecipeInput onRecipeParsed={handleRecipeParsed} />

      {saving && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
            <p>Saving recipe & fetching nutrition data...</p>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" onAnimationEnd={() => setTimeout(() => setToast(null), 2000)}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
