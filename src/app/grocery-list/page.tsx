'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Check,
  Trash2,
  ChefHat,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { Recipe, GroceryItem } from '@/types';
import { aggregateIngredients, groupByCategory } from '@/lib/groceryAggregator';
import { formatAmount } from '@/lib/servingCalculator';

export default function GroceryListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes?limit=50');
      const data = await res.json();
      if (data.recipes) {
        setRecipes(data.recipes);
        // Auto-select bookmarked recipes
        const bookmarked = new Set<string>(
          data.recipes.filter((r: Recipe) => r.isBookmarked).map((r: Recipe) => r._id!)
        );
        setSelectedIds(bookmarked);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipe = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const generateList = () => {
    const selected = recipes.filter((r) => selectedIds.has(r._id!));
    const items = aggregateIngredients(
      selected.map((r) => ({
        title: r.title,
        ingredients: r.ingredients,
      }))
    );
    setGroceryItems(items);
    setCheckedItems(new Set());
  };

  const toggleItem = (key: string) => {
    const next = new Set(checkedItems);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setCheckedItems(next);
  };

  const exportList = () => {
    const grouped = groupByCategory(groceryItems);
    let text = '🛒 Grocery List\n\n';
    for (const [cat, items] of Object.entries(grouped)) {
      text += `📦 ${cat}\n`;
      for (const item of items) {
        const check = checkedItems.has(`${item.name}-${item.unit}`) ? '☑' : '☐';
        text += `  ${check} ${formatAmount(item.amount)} ${item.unit} ${item.name}\n`;
      }
      text += '\n';
    }
    navigator.clipboard.writeText(text);
  };

  const grouped = groupByCategory(groceryItems);
  const completedCount = checkedItems.size;
  const totalCount = groceryItems.length;

  const categoryEmojis: Record<string, string> = {
    Produce: '🥬',
    Dairy: '🧀',
    Meat: '🥩',
    Seafood: '🐟',
    Grains: '🌾',
    Spices: '🧂',
    Oils: '🫒',
    Baking: '🧁',
    Canned: '🥫',
    Frozen: '❄️',
    Beverages: '🥤',
    Other: '📦',
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1>
          <ShoppingCart size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Smart Grocery List
        </h1>
        <p>Select recipes to auto-generate a combined shopping list</p>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '48px', marginBottom: '8px', borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : groceryItems.length === 0 ? (
        <>
          {/* Recipe Selector */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
              Select recipes to include
            </h3>
            {recipes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' }}>
                {recipes.map((recipe) => (
                  <label
                    key={recipe._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      background: selectedIds.has(recipe._id!) ? 'rgba(255, 107, 53, 0.06)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedIds.has(recipe._id!) ? 'rgba(255, 107, 53, 0.2)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(recipe._id!)}
                      onChange={() => toggleRecipe(recipe._id!)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <ChefHat size={16} color="var(--text-tertiary)" />
                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{recipe.title}</span>
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                      {recipe.ingredients.length} items
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px' }}>
                <p>No recipes saved yet.</p>
                <Link href="/add-recipe" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                  Add Recipe
                </Link>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={generateList}
            disabled={selectedIds.size === 0}
            style={{ width: '100%' }}
          >
            <ShoppingCart size={18} /> Generate Grocery List ({selectedIds.size} recipes)
          </button>
        </>
      ) : (
        <>
          {/* Progress */}
          <div
            className="glass-card"
            style={{ marginBottom: '24px', padding: '16px 20px' }}
          >
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {completedCount} of {totalCount} items checked
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={exportList}>
                  <Download size={14} /> Copy List
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setGroceryItems([]); setCheckedItems(new Set()); }}>
                  <Trash2 size={14} /> Clear
                </button>
              </div>
            </div>
            <div
              style={{
                height: '6px',
                background: 'var(--bg-tertiary)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent-green))',
                  borderRadius: '3px',
                  transition: 'width 300ms ease',
                }}
              />
            </div>
          </div>

          {/* Grocery Items by Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {categoryEmojis[cat] || '📦'} {cat}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {items.map((item) => {
                    const key = `${item.name}-${item.unit}`;
                    const isChecked = checkedItems.has(key);
                    return (
                      <div
                        key={key}
                        onClick={() => toggleItem(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          background: isChecked ? 'rgba(74, 222, 128, 0.05)' : 'var(--bg-secondary)',
                          border: `1px solid ${isChecked ? 'rgba(74, 222, 128, 0.15)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          opacity: isChecked ? 0.55 : 1,
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: `2px solid ${isChecked ? 'var(--color-accent-green)' : 'var(--border-default)'}`,
                            background: isChecked ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && <Check size={14} color="var(--color-accent-green)" />}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)', minWidth: '70px', fontSize: '0.85rem' }}>
                          {formatAmount(item.amount)} {item.unit}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: '0.875rem',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            color: isChecked ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          }}
                        >
                          {item.name}
                        </span>
                        {item.fromRecipes.length > 1 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {item.fromRecipes.length} recipes
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
