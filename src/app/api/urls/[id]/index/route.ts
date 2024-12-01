import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Url } from '@/lib/models/Url';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const url = await Url.findById(params.id);
    if (!url) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    // Fetch and parse the URL content
    const response = await fetch(url.url);
    const html = await response.text();
    
    // Basic text extraction (you might want to use a proper HTML parser)
    const text = html.replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

    // Update the URL record
    url.content = text;
    url.lastIndexed = new Date();
    await url.save();

    return NextResponse.json(url);
  } catch (error: unknown) {
    console.error('Failed to index URL:', error);
    return NextResponse.json({ error: 'Failed to index URL' }, { status: 500 });
  }
} 