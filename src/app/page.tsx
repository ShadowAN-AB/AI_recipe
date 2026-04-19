'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Bookmark,
  ChefHat,
  TrendingUp,
  Sparkles,
  Clock,
  Flame,
  ArrowRight,
  Utensils,
  ShoppingCart,
} from 'lucide-react';
import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/types';

export default function Dashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, bookmarked: 0, totalCalories: 0 });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes?limit=6');
      const data = await res.json();
      if (data.recipes) {
        setRecipes(data.recipes);
        const bookmarked = data.recipes.filter((r: Recipe) => r.isBookmarked).length;
        const totalCal = data.recipes.reduce(
          (sum: number, r: Recipe) => sum + (r.nutrition?.calories || 0),
          0
        );
        setStats({ total: data.total, bookmarked, totalCalories: totalCal });
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div
        style={{
          position: 'relative',
          padding: '48px 40px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(96, 165, 250, 0.08) 50%, rgba(167, 139, 250, 0.06) 100%)',
          border: '1px solid rgba(255, 107, 53, 0.15)',
          marginBottom: '32px',
          overflow: 'hidden',
        }}
      >
        {/* Floating decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-20px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '30%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI-Powered
            </span>
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '12px',
            }}
          >
            Your Smart Kitchen{' '}
            <span className="text-gradient">Assistant</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '24px' }}>
            Transform any recipe with AI. Parse text or photos, adjust servings, track nutrition, and generate smart grocery lists.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/add-recipe" className="btn btn-primary btn-lg">
              <PlusCircle size={18} /> Add Recipe
            </Link>
            <Link href="/explore" className="btn btn-secondary btn-lg">
              <Sparkles size={18} /> Get Recommendations
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
        className="stagger-children"
      >
        {[
          { icon: <Utensils size={22} />, value: stats.total, label: 'Total Recipes', color: 'var(--color-primary)' },
          { icon: <Bookmark size={22} />, value: stats.bookmarked, label: 'Bookmarked', color: 'var(--color-accent-blue)' },
          { icon: <Flame size={22} />, value: stats.totalCalories.toLocaleString(), label: 'Total Calories Tracked', color: 'var(--color-accent-yellow)' },
          { icon: <TrendingUp size={22} />, value: recipes.length, label: 'Recent Recipes', color: 'var(--color-accent-green)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card stat-card"
            style={{ textAlign: 'center' }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        <Link
          href="/add-recipe"
          className="glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textDecoration: 'none',
            padding: '20px 24px',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 107, 53, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
          >
            <ChefHat size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              Parse a Recipe
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Paste text, upload an image, or enter a URL
            </p>
          </div>
          <ArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </Link>

        <Link
          href="/grocery-list"
          className="glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textDecoration: 'none',
            padding: '20px 24px',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(74, 222, 128, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-green)',
              flexShrink: 0,
            }}
          >
            <ShoppingCart size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              Grocery List
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Generate a smart shopping list from your recipes
            </p>
          </div>
          <ArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </Link>
      </div>

      {/* Recent Recipes */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              <Clock size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Recent Recipes
            </h2>
          </div>
          {recipes.length > 0 && (
            <Link href="/bookmarks" className="btn btn-ghost">
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="recipe-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ height: '300px' }}>
                <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-md)' }} />
                <div style={{ padding: '16px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="recipe-grid stagger-children">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onClick={(r) => {
                  window.location.href = `/recipe/${r._id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <div className="empty-state-icon">
              <ChefHat size={36} />
            </div>
            <h3>No recipes yet</h3>
            <p>Add your first recipe to get started! Paste text, upload a photo, or enter a URL.</p>
            <Link href="/add-recipe" className="btn btn-primary">
              <PlusCircle size={16} /> Add Your First Recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
