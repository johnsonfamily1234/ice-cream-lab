import connectDB from '@/lib/db/mongodb';
import { UniqueIngredient } from '@/lib/models/Ingredient';
import { NextResponse } from 'next/server';
import type { IngredientType } from '@/lib/models/Ingredient';

interface IngredientQuery {
  type: IngredientType;
  name?: {
    $regex: string;
    $options: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as IngredientType;
  const search = searchParams.get('search');

  try {
    await connectDB();
    
    const query: IngredientQuery = { type };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const ingredients = await UniqueIngredient.find(query)
      .sort({ useCount: -1, lastUsed: -1 })
      .limit(10);

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    );
  }
} 