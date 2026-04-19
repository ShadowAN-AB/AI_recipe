'use client';

import { useState, useRef, DragEvent } from 'react';
import { Type, Image, Link2, Upload, Sparkles, Check, Clock, Users } from 'lucide-react';
import { ParsedRecipeResponse } from '@/types';
import { formatAmount } from '@/lib/servingCalculator';
import './RecipeInput.css';

type InputMode = 'text' | 'image' | 'url';

interface RecipeInputProps {
  onRecipeParsed: (recipe: ParsedRecipeResponse) => void;
}

export default function RecipeInput({ onRecipeParsed }: RecipeInputProps) {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      // Extract base64 data (remove data:image/xxx;base64, prefix)
      setImageBase64(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: DragEvent) => {
    handleDrag(e);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    handleDrag(e);
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    handleDrag(e);
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleImageUpload(files[0]);
  };

  const handleParse = async () => {
    setIsParsing(true);
    setError(null);
    setParsedRecipe(null);

    try {
      const body: Record<string, string> = {};
      if (mode === 'text') body.text = text;
      else if (mode === 'image' && imageBase64) {
        body.imageBase64 = imageBase64;
        body.imageMimeType = imageMimeType;
      } else if (mode === 'url') body.url = url;

      const response = await fetch('/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse recipe');
      }

      setParsedRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = () => {
    if (parsedRecipe) {
      onRecipeParsed(parsedRecipe);
    }
  };

  const canParse =
    (mode === 'text' && text.trim().length > 10) ||
    (mode === 'image' && imageBase64) ||
    (mode === 'url' && url.trim().length > 5);

  return (
    <div className="recipe-input-container">
      {/* Mode Tabs */}
      <div className="input-tabs">
        <button
          className={`input-tab ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          <Type size={16} /> Paste Text
        </button>
        <button
          className={`input-tab ${mode === 'image' ? 'active' : ''}`}
          onClick={() => setMode('image')}
        >
          <Image size={16} /> Upload Image
        </button>
        <button
          className={`input-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => setMode('url')}
        >
          <Link2 size={16} /> From URL
        </button>
      </div>

      {/* Input Panels */}
      {!isParsing && !parsedRecipe && (
        <div className="input-panel">
          {mode === 'text' && (
            <div className="input-group">
              <label htmlFor="recipe-text">Paste your recipe text below</label>
              <textarea
                id="recipe-text"
                className="textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Paste a full recipe here. For example:\n\nClassic Pancakes\nIngredients:\n- 1 cup all-purpose flour\n- 2 tbsp sugar\n- 1 egg\n- 1 cup milk\n- 2 tbsp melted butter\n\nInstructions:\n1. Mix dry ingredients together...\n2. Whisk wet ingredients...`}
                rows={12}
              />
            </div>
          )}

          {mode === 'image' && (
            <div
              className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                style={{ display: 'none' }}
              />
              <div className="drop-zone-icon">
                <Upload size={28} />
              </div>
              <h3>Drop an image here or click to browse</h3>
              <p>Supports JPG, PNG, WebP — photos of recipes, cookbook pages, or handwritten notes</p>
              {imagePreview && (
                <div className="image-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Recipe preview" />
                </div>
              )}
            </div>
          )}

          {mode === 'url' && (
            <div className="input-group">
              <label htmlFor="recipe-url">Enter recipe URL</label>
              <div className="url-input-row">
                <input
                  id="recipe-url"
                  className="input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.example.com/recipes/chocolate-cake"
                />
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: 'var(--color-accent-red)', marginTop: 'var(--space-md)', fontSize: 'var(--font-sm)' }}>
              {error}
            </div>
          )}

          <div className="parse-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleParse}
              disabled={!canParse || isParsing}
            >
              <Sparkles size={18} />
              Parse with AI
            </button>
          </div>
        </div>
      )}

      {/* Parsing State */}
      {isParsing && (
        <div className="glass-card parsing-overlay">
          <div className="spinner spinner-lg" />
          <h3>Analyzing Recipe with AI...</h3>
          <p>Extracting ingredients, instructions, and nutritional estimates</p>
        </div>
      )}

      {/* Parsed Preview */}
      {parsedRecipe && !isParsing && (
        <div className="parsed-preview">
          <div className="parsed-preview-header">
            <h2>
              <Check size={22} className="check-icon" />
              {parsedRecipe.title}
            </h2>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button className="btn btn-secondary" onClick={() => setParsedRecipe(null)}>
                Try Again
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                <Check size={16} /> Save Recipe
              </button>
            </div>
          </div>

          {parsedRecipe.description && (
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              {parsedRecipe.description}
            </p>
          )}

          <div className="parsed-meta">
            <div className="meta-item">
              <div className="value">{parsedRecipe.servings}</div>
              <div className="label"><Users size={12} style={{ display: 'inline' }} /> Servings</div>
            </div>
            <div className="meta-item">
              <div className="value">{parsedRecipe.prepTime}m</div>
              <div className="label"><Clock size={12} style={{ display: 'inline' }} /> Prep Time</div>
            </div>
            <div className="meta-item">
              <div className="value">{parsedRecipe.cookTime}m</div>
              <div className="label"><Clock size={12} style={{ display: 'inline' }} /> Cook Time</div>
            </div>
            <div className="meta-item">
              <div className="value">{parsedRecipe.ingredients.length}</div>
              <div className="label">Ingredients</div>
            </div>
          </div>

          <div className="parsed-section">
            <h3>Ingredients</h3>
            <div className="ingredient-grid">
              {parsedRecipe.ingredients.map((ing, i) => (
                <div key={i} className="ingredient-item">
                  <span className="ingredient-amount">
                    {formatAmount(ing.amount)} {ing.unit}
                  </span>
                  <span className="ingredient-name">{ing.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="parsed-section">
            <h3>Instructions</h3>
            <div className="instruction-list">
              {parsedRecipe.instructions.map((step, i) => (
                <div key={i} className="instruction-step">
                  <span className="step-number">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {parsedRecipe.tags && parsedRecipe.tags.length > 0 && (
            <div className="parsed-section">
              <h3>Tags</h3>
              <div className="tags-row">
                {parsedRecipe.tags.map((tag, i) => (
                  <span key={i} className="badge badge-primary">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
