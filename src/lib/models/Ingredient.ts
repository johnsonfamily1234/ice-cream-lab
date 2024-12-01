import mongoose from 'mongoose';

export const IngredientTypes = ['dry', 'wet', 'stabilizer', 'ice'] as const;
export type IngredientType = typeof IngredientTypes[number];

const UniqueIngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: IngredientTypes },
  lastUsed: { type: Date, default: Date.now },
  useCount: { type: Number, default: 1 },
});

// Compound index to ensure uniqueness of name + type combination
UniqueIngredientSchema.index({ name: 1, type: 1 }, { unique: true });

export const UniqueIngredient = mongoose.models.UniqueIngredient || 
  mongoose.model('UniqueIngredient', UniqueIngredientSchema); 