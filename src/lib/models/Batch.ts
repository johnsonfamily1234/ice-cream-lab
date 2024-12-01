import mongoose from 'mongoose';

// Force clear the model if it exists
if (mongoose.models.Batch) {
  delete mongoose.models.Batch;
}

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grams: { type: Number, required: true },
  cups: { type: Number, required: true },
  liters: { type: Number, required: true },
});

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GradeSchema = new mongoose.Schema({
  flavor: { type: Number, min: 0, max: 10 },
  texture: { type: Number, min: 0, max: 10 },
  overall: { type: Number, min: 0, max: 10 },
  notes: String
}, { _id: false });

const BatchSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    default: 'Untitled Batch',
    set: function(v: string) {
      return v || 'Untitled Batch';
    }
  },
  createdAt: { type: Date, default: Date.now },
  dryIngredients: [IngredientSchema],
  wetIngredients: [IngredientSchema],
  stabilizers: [IngredientSchema],
  ice: [IngredientSchema],
  notes: [NoteSchema],
  finalServedWeight: { type: Number },
  numberOfServings: { type: Number },
  rating: { type: Number, min: 1, max: 10 },
  referenceUrls: [{ type: String }],
  isAiGenerated: { type: Boolean, default: false },
  parentBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  grade: GradeSchema
});

export const Batch = mongoose.model('Batch', BatchSchema); 