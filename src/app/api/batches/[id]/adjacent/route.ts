import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Batch } from '@/lib/models/Batch';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();
    const { id } = await params;
    const currentBatch = await Batch.findById(id);
    if (!currentBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const [previousBatch, nextBatch] = await Promise.all([
      Batch.findOne({
        createdAt: { $lt: currentBatch.createdAt }
      }).sort({ createdAt: -1 }),
      Batch.findOne({
        createdAt: { $gt: currentBatch.createdAt }
      }).sort({ createdAt: 1 })
    ]);

    return NextResponse.json({
      previousId: previousBatch?._id || null,
      nextId: nextBatch?._id || null
    });
  } catch (error: unknown) {
    console.error('Failed to fetch adjacent batches:', error);
    return NextResponse.json({ error: 'Failed to fetch adjacent batches' }, { status: 500 });
  }
} 