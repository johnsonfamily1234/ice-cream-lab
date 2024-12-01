import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Url } from '@/lib/models/Url';

export async function GET() {
  try {
    await connectDB();
    const urls = await Url.find({}).sort({ createdAt: -1 });
    return NextResponse.json(urls);
  } catch (error: unknown) {
    console.error('Failed to fetch URLs:', error);
    return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { url } = await request.json();
    const urlRecord = await Url.create({ url });
    return NextResponse.json(urlRecord);
  } catch (error: unknown) {
    console.error('Failed to create URL:', error);
    return NextResponse.json({ error: 'Failed to create URL' }, { status: 500 });
  }
} 