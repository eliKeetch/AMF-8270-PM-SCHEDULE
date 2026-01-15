import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const parts = db.prepare(`
      SELECT * FROM parts_catalogue 
      WHERE name LIKE ? OR partNumber LIKE ? 
      LIMIT 20
    `).all(`%${query}%`, `%${query}%`);

    return NextResponse.json(parts);
  } catch (error) {
    console.error('Catalogue search error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 });
  }
}
