import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Batch } from '@/lib/models/Batch';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    await connectDB();
    const currentBatch = await Batch.findById(id);
    if (!currentBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const [previousBatch, nextBatch] = await Promise.all([
      // Find the newest batch that's older than current
      Batch.findOne({
        createdAt: { $lt: currentBatch.createdAt }
      }).sort({ createdAt: -1 }),
      // Find the oldest batch that's newer than current
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