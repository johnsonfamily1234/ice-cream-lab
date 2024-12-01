import mongoose from 'mongoose';

const UrlSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  content: { type: String },
  lastIndexed: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const Url = mongoose.models.Url || mongoose.model('Url', UrlSchema); 