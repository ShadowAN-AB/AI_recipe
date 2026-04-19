import mongoose, { Schema, Document } from 'mongoose';
import { Recipe as RecipeType } from '@/types';

export interface RecipeDocument extends Omit<RecipeType, '_id'>, Document {}

const IngredientSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true, default: 'piece' },
    category: { type: String, default: 'Other' },
    originalText: { type: String },
  },
  { _id: false }
);

const NutritionSchema = new Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
  },
  { _id: false }
);

const RecipeSchema = new Schema<RecipeDocument>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    ingredients: { type: [IngredientSchema], required: true },
    instructions: { type: [String], required: true },
    servings: { type: Number, required: true, default: 4 },
    prepTime: { type: Number, default: 0 },
    cookTime: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    nutrition: { type: NutritionSchema, default: () => ({}) },
    category: {
      type: String,
      default: 'Uncategorized',
      enum: [
        'Healthy',
        'Desserts',
        'Quick Meals',
        'Breakfast',
        'Lunch',
        'Dinner',
        'Snacks',
        'Vegetarian',
        'Uncategorized',
      ],
    },
    isBookmarked: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    source: {
      type: String,
      default: 'text',
      enum: ['text', 'image', 'url'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
RecipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Prevent model recompilation in development
export default mongoose.models.Recipe ||
  mongoose.model<RecipeDocument>('Recipe', RecipeSchema);
