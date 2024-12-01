export interface Note {
  content: string;
  createdAt: Date;
}

export interface Ingredient {
  name: string;
  grams: number;
  cups: number;
  liters: number;
}

export interface Batch {
  _id: string;
  name: string;
  createdAt: Date;
  dryIngredients: Ingredient[];
  wetIngredients: Ingredient[];
  stabilizers: Ingredient[];
  ice: Ingredient[];
  notes: Note[];
  finalServedWeight?: number;
  numberOfServings?: number;
  rating?: number;
  referenceUrls?: string[];
  isAiGenerated: boolean;
  parentBatchId?: string;
} 