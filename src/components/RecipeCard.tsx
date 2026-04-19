'use client';

import { Bookmark, Clock, Users, Flame, ChefHat } from 'lucide-react';
import { Recipe } from '@/types';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
  onBookmarkToggle?: (id: string, isBookmarked: boolean) => void;
  onClick?: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onBookmarkToggle, onClick }: RecipeCardProps) {
  return (
    <div className="recipe-card" onClick={() => onClick?.(recipe)}>
      <div className="recipe-card-image">
        {recipe.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={recipe.imageUrl} alt={recipe.title} />
        ) : (
          <div className="recipe-card-placeholder">
            <ChefHat size={32} />
            <span>{recipe.category}</span>
          </div>
        )}
        <button
          className={`recipe-card-bookmark ${recipe.isBookmarked ? 'bookmarked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle?.(recipe._id!, !recipe.isBookmarked);
          }}
          aria-label={recipe.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Bookmark size={16} fill={recipe.isBookmarked ? 'currentColor' : 'none'} />
        </button>
        <span className="recipe-card-category badge badge-primary">
          {recipe.category}
        </span>
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        {recipe.description && (
          <p className="recipe-card-description">{recipe.description}</p>
        )}

        <div className="recipe-card-stats">
          <span className="recipe-card-stat">
            <Users size={14} /> {recipe.servings} servings
          </span>
          <span className="recipe-card-stat">
            <Clock size={14} /> {recipe.prepTime + recipe.cookTime}m
          </span>
          {recipe.nutrition?.calories > 0 && (
            <span className="recipe-card-stat">
              <Flame size={14} /> {recipe.nutrition.calories} cal
            </span>
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="recipe-card-tag">{tag}</span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="recipe-card-tag">+{recipe.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
