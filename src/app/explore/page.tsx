'use client';

import { useState } from 'react';
import {
  Compass,
  Sparkles,
  Target,
  Leaf,
  AlertTriangle,
  Flame,
  Clock,
  ChefHat,
} from 'lucide-react';
import { RecommendedRecipe } from '@/types';

const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '🔥', desc: 'Low-cal, high-protein' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪', desc: 'High-protein meals' },
  { value: 'maintenance', label: 'Maintenance', icon: '⚖️', desc: 'Balanced nutrition' },
  { value: 'general', label: 'General', icon: '🍽️', desc: 'No specific goal' },
];

const DIETS = [
  { value: 'none', label: 'No Restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'gluten_free', label: 'Gluten-Free' },
];

const COMMON_ALLERGIES = ['Dairy', 'Eggs', 'Nuts', 'Shellfish', 'Soy', 'Wheat', 'Fish'];

export default function ExplorePage() {
  const [goal, setGoal] = useState('general');
  const [diet, setDiet] = useState('none');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [maxCalories, setMaxCalories] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          diet,
          allergies,
          maxCalories: maxCalories ? parseInt(maxCalories) : undefined,
        }),
      });

      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveRecommendation = async (rec: RecommendedRecipe) => {
    try {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rec.title,
          description: rec.description,
          ingredients: rec.ingredients.map((ing) => ({
            name: ing,
            amount: 1,
            unit: 'piece',
          })),
          instructions: rec.instructions,
          servings: 2,
          prepTime: 15,
          cookTime: 30,
          nutrition: {
            calories: rec.estimatedCalories,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
          },
          tags: rec.tags,
          category: 'Uncategorized',
          source: 'text',
          isBookmarked: true,
        }),
      });
      alert('Recipe saved to your bookmarks!');
    } catch {
      alert('Failed to save recipe');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1>
          <Compass size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Explore Recipes
        </h1>
        <p>Get AI-powered recipe suggestions tailored to your preferences</p>
      </div>

      {recommendations.length === 0 && !loading && (
        <>
          {/* Goal Selection */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={16} color="var(--color-primary)" /> Your Goal
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  style={{
                    padding: '16px',
                    background: goal === g.value ? 'rgba(255, 107, 53, 0.1)' : 'var(--bg-secondary)',
                    border: `2px solid ${goal === g.value ? 'var(--color-primary)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: 'var(--font-family)',
                    transition: 'all 150ms ease',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{g.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={16} color="var(--color-accent-green)" /> Dietary Preference
            </h3>
            <div className="tab-group" style={{ width: 'fit-content' }}>
              {DIETS.map((d) => (
                <button
                  key={d.value}
                  className={`tab ${diet === d.value ? 'active' : ''}`}
                  onClick={() => setDiet(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="var(--color-accent-yellow)" /> Allergies
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COMMON_ALLERGIES.map((a) => (
                <button
                  key={a}
                  className={`badge ${allergies.includes(a) ? 'badge-primary' : ''}`}
                  onClick={() => toggleAllergy(a)}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 14px',
                    border: allergies.includes(a) ? undefined : '1px solid var(--border-default)',
                    background: allergies.includes(a) ? undefined : 'var(--bg-secondary)',
                    color: allergies.includes(a) ? undefined : 'var(--text-secondary)',
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.8rem',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Max Calories */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color="var(--color-accent-red)" /> Max Calories (optional)
            </h3>
            <input
              className="input"
              type="number"
              value={maxCalories}
              onChange={(e) => setMaxCalories(e.target.value)}
              placeholder="e.g., 500"
              style={{ maxWidth: '200px' }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--color-accent-red)', marginBottom: '16px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={generateRecommendations}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <Sparkles size={18} /> Generate Personalized Recipes
          </button>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Crafting Recipes...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            AI is generating personalized recipes based on your preferences
          </p>
        </div>
      )}

      {/* Results */}
      {recommendations.length > 0 && !loading && (
        <>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              <Sparkles size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Your Personalized Recipes
            </h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setRecommendations([])}
            >
              Try Again
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {recommendations.map((rec, i) => (
              <div key={i} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '20px',
                    background: `linear-gradient(135deg, rgba(255,107,53,${0.05 + i * 0.02}) 0%, rgba(96,165,250,0.03) 100%)`,
                    borderBottom: '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-primary">{rec.difficulty}</span>
                    <span className="badge badge-blue">
                      <Flame size={10} /> {rec.estimatedCalories} cal
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
                    {rec.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {rec.description}
                  </p>
                </div>

                <div style={{ padding: '16px 20px' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <ChefHat size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Key Ingredients
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {rec.ingredients.slice(0, 6).map((ing, j) => (
                      <span key={j} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                        {ing}
                      </span>
                    ))}
                  </div>

                  {rec.instructions && rec.instructions.length > 0 && (
                    <>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Quick Steps
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {rec.instructions.slice(0, 3).map((step, j) => (
                          <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{j + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                        {rec.instructions.length > 3 && (
                          <span style={{ color: 'var(--text-muted)' }}>+{rec.instructions.length - 3} more steps</span>
                        )}
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {rec.tags.map((tag, j) => (
                      <span key={j} className="badge badge-green" style={{ fontSize: '10px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => saveRecommendation(rec)}
                  >
                    Save to My Recipes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
