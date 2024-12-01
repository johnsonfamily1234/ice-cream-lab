import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Batch } from '@/lib/models/Batch';

interface Ingredient {
  name: string;
  grams: number;
  cups: number;
  liters: number;
}

export async function GET() {
  try {
    await connectDB();
    const batches = await Batch.find({}).sort({ createdAt: -1 });
    return NextResponse.json(batches);
  } catch (error: unknown) {
    console.error('Failed to fetch batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    console.log('Raw request data:', data);

    // Validate ingredients
    const validateIngredients = (ingredients: Ingredient[]) => {
      return ingredients
        .filter(ing => ing.name.trim() !== '')
        .map(ing => ({
          name: ing.name.trim(),
          grams: Number(ing.grams) || 0,
          cups: Number(ing.cups) || 0,
          liters: Number(ing.liters) || 0,
        }));
    };

    // Clean and validate the data
    const batchData = {
      name: data.name || 'Untitled Batch',
      dryIngredients: validateIngredients(data.dryIngredients || []),
      wetIngredients: validateIngredients(data.wetIngredients || []),
      stabilizers: validateIngredients(data.stabilizers || []),
      ice: validateIngredients(data.ice || []),
      notes: (data.notes || []).map((note: { content: string }) => ({
        content: note.content,
        createdAt: new Date()
      })),
      createdAt: new Date(),
    };

    console.log('Cleaned batch data:', batchData);

    // Try direct MongoDB insert first
    const result = await Batch.collection.insertOne(batchData);
    console.log('Raw MongoDB result:', result);

    const batch = await Batch.findById(result.insertedId);
    console.log('Retrieved batch:', batch);

    return NextResponse.json(batch);
  } catch (error: unknown) {
    console.error('Failed to create batch:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
} 