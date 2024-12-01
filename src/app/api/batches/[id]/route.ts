import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Batch } from '@/lib/models/Batch';

function validateIngredients(ingredients: Array<{
  name: string;
  grams: number;
  cups: number;
  liters: number;
}>) {
  return ingredients
    .filter(ing => ing.name.trim() !== '')
    .map(ing => ({
      name: ing.name.trim(),
      grams: Number(ing.grams) || 0,
      cups: Number(ing.cups) || 0,
      liters: Number(ing.liters) || 0,
    }));
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    await connectDB();
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    return NextResponse.json(batch);
  } catch (error: unknown) {
    console.error('Failed to fetch batch:', error);
    return NextResponse.json({ error: 'Failed to fetch batch' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = await params.id;
    const data = await request.json();

    const existingBatch = await Batch.findById(id);
    if (!existingBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const updateData = {
      name: data.name || 'Untitled Batch',
      dryIngredients: validateIngredients(data.dryIngredients || []),
      wetIngredients: validateIngredients(data.wetIngredients || []),
      stabilizers: validateIngredients(data.stabilizers || []),
      ice: validateIngredients(data.ice || []),
      notes: (data.notes || []).map((note: { content: string }) => ({
        content: note.content,
        createdAt: new Date()
      })),
      grade: data.grade
    };

    const batch = await Batch.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!batch) {
      return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error('Failed to update batch:', error);
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const batch = await Batch.findByIdAndDelete(params.id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Batch deleted successfully' });
  } catch (error: unknown) {
    console.error('Failed to delete batch:', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
} 