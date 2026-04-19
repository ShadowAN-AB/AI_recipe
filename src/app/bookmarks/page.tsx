'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark, ChefHat, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import RecipeCard from '@/components/RecipeCard';
import SearchBar from '@/components/SearchBar';
import { Recipe, RecipeCategory } from '@/types';

const CATEGORIES: (RecipeCategory | 'All')[] = [
  'All',
  'Healthy',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Quick Meals',
  'Snacks',
  'Vegetarian',
  'Uncategorized',
];

export default function BookmarksPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (search) params.set('search', search);

      const res = await fetch(`/api/recipes?${params.toString()}`);
      const data = await res.json();
      if (data.recipes) setRecipes(data.recipes);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchRecipes, 300);
    return () => clearTimeout(debounce);
  }, [fetchRecipes]);

  const handleBookmarkToggle = async (id: string, isBookmarked: boolean) => {
    try {
      await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBookmarked }),
      });
      setRecipes((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isBookmarked } : r))
      );
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>
          <Bookmark size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          My Recipes
        </h1>
        <p>All your saved and bookmarked recipes in one place</p>
      </div>

      {/* Search + Filters */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <SearchBar value={search} onChange={setSearch} />
        <Link href="/add-recipe" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
          <PlusCircle size={14} /> Add Recipe
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="tab-group" style={{ marginBottom: '24px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="recipe-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card" style={{ height: '320px' }}>
              <div className="skeleton" style={{ height: '180px' }} />
              <div style={{ padding: '16px' }}>
                <div className="skeleton" style={{ height: '18px', width: '75%', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', width: '55%' }} />
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
              onBookmarkToggle={handleBookmarkToggle}
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
          <h3>No recipes found</h3>
          <p>
            {search || category !== 'All'
              ? 'Try changing your search or filter criteria.'
              : 'Start by adding your first recipe!'}
          </p>
          <Link href="/add-recipe" className="btn btn-primary">
            <PlusCircle size={16} /> Add Recipe
          </Link>
        </div>
      )}
    </div>
  );
}
