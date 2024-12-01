import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  hasContent: { type: Boolean, default: false },
  lastIndexed: Date,
  content: String
});

export const Url = mongoose.models.Url || mongoose.model('Url', urlSchema); 