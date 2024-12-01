import connectDB from '@/lib/db/mongodb';
import { Url } from '@/lib/models/Url';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const url = await Url.findByIdAndUpdate(
      params.id,
      { 
        $set: { 
          hasContent: true,
          lastIndexed: new Date()
        } 
      },
      { new: true }
    );

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(url);
  } catch (error) {
    console.error('Error indexing URL:', error);
    return NextResponse.json(
      { error: 'Failed to index URL' },
      { status: 500 }
    );
  }
} 