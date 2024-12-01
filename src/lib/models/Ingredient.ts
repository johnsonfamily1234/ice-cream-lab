import mongoose from 'mongoose';

export const IngredientTypes = ['dry', 'wet', 'stabilizers', 'ice'] as const;
export type IngredientType = typeof IngredientTypes[number];

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: IngredientTypes },
  useCount: { type: Number, default: 0 },
  lastUsed: Date
});

export const UniqueIngredient = mongoose.models.UniqueIngredient || 
  mongoose.model('UniqueIngredient', ingredientSchema); 