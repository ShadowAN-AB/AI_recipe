'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Users,
  Flame,
  ShoppingCart,
  Share2,
  ChefHat,
  Trash2,
} from 'lucide-react';
import { Recipe } from '@/types';
import { scaleIngredients } from '@/lib/servingCalculator';
import NutritionChart from '@/components/NutritionChart';
import IngredientList from '@/components/IngredientList';
import ServingSlider from '@/components/ServingSlider';

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(4);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipe();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecipe = async () => {
    try {
      const res = await fetch(`/api/recipes/${id}`);
      const data = await res.json();
      if (data.recipe) {
        setRecipe(data.recipe);
        setServings(data.recipe.servings);
      }
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!recipe) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBookmarked: !recipe.isBookmarked }),
      });
      const data = await res.json();
      if (data.recipe) {
        setRecipe(data.recipe);
        setToast(data.recipe.isBookmarked ? 'Recipe bookmarked!' : 'Bookmark removed');
        setTimeout(() => setToast(null), 2000);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const deleteRecipe = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      window.location.href = '/bookmarks';
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const scaledIngredients = recipe
    ? scaleIngredients(recipe.ingredients, recipe.servings, servings)
    : [];

  // Scale nutrition proportionally
  const scaledNutrition = recipe?.nutrition
    ? {
        calories: Math.round((recipe.nutrition.calories / recipe.servings) * servings),
        protein: Math.round(((recipe.nutrition.protein / recipe.servings) * servings) * 10) / 10,
        carbs: Math.round(((recipe.nutrition.carbs / recipe.servings) * servings) * 10) / 10,
        fat: Math.round(((recipe.nutrition.fat / recipe.servings) * servings) * 10) / 10,
        fiber: Math.round(((recipe.nutrition.fiber / recipe.servings) * servings) * 10) / 10,
        sugar: Math.round(((recipe.nutrition.sugar / recipe.servings) * servings) * 10) / 10,
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: '250px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '16px', width: '40%' }} />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <ChefHat size={36} />
        </div>
        <h3>Recipe not found</h3>
        <p>This recipe may have been deleted or doesn&apos;t exist.</p>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Back nav */}
      <Link
        href="/bookmarks"
        className="btn btn-ghost"
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to Recipes
      </Link>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-primary">{recipe.category}</span>
            <span className="badge badge-blue">{recipe.source} upload</span>
          </div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            {recipe.title}
          </h1>
          {recipe.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px' }}>
              {recipe.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-icon" onClick={toggleBookmark} aria-label="Bookmark">
            <Bookmark size={18} fill={recipe.isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="btn btn-secondary btn-icon" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => { setToast('Link copied!'); setTimeout(() => setToast(null), 2000); })} aria-label="Share">
            <Share2 size={18} />
          </button>
          <button className="btn btn-secondary btn-icon" onClick={deleteRecipe} aria-label="Delete" style={{ color: 'var(--color-accent-red)' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { icon: <Users size={16} />, label: `${recipe.servings} servings` },
          { icon: <Clock size={16} />, label: `${recipe.prepTime}m prep` },
          { icon: <Clock size={16} />, label: `${recipe.cookTime}m cook` },
          { icon: <Flame size={16} />, label: `${scaledNutrition.calories} cal` },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            {s.icon} {s.label}
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        {/* Left: Ingredients + Instructions */}
        <div>
          {/* Serving Slider */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
              Adjust Servings
            </h2>
            <ServingSlider value={servings} onChange={setServings} />
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: '32px' }}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                Ingredients ({scaledIngredients.length})
              </h2>
              <Link
                href="/grocery-list"
                className="btn btn-ghost btn-sm"
              >
                <ShoppingCart size={14} /> Add to Grocery List
              </Link>
            </div>
            <IngredientList ingredients={scaledIngredients} checkable />
          </div>

          {/* Instructions */}
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
              Instructions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recipe.instructions.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '14px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Nutrition */}
        <div
          className="glass-card"
          style={{ position: 'sticky', top: '24px', padding: '24px' }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
            Nutrition
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 400 }}>
              per {servings} {servings === 1 ? 'serving' : 'servings'}
            </span>
          </h2>
          <NutritionChart nutrition={scaledNutrition} size={200} />
        </div>
      </div>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Tags
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {recipe.tags.map((tag, i) => (
              <span key={i} className="badge badge-primary">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
