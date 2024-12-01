import connectDB from '@/lib/db/mongodb';
import { Url } from '@/lib/models/Url';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const urls = await Url.find({}).sort({ createdAt: -1 });
    return NextResponse.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URLs' },
      { status: 500 }
    );
  }
} 