import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const assembly = searchParams.get('assembly');
    
    // If just requesting unique assemblies
    if (searchParams.has('assemblies')) {
      const assemblies = db.prepare('SELECT DISTINCT assemblyTitle FROM parts_catalogue ORDER BY assemblyTitle ASC').all();
      return NextResponse.json(assemblies.map((a: any) => a.assemblyTitle));
    }

    let parts;
    if (assembly && !query) {
      // Browse by assembly
      parts = db.prepare(`
        SELECT * FROM parts_catalogue 
        WHERE assemblyTitle = ? 
        ORDER BY cast(pdfPage as integer) ASC
      `).all(assembly);
    } else if (query) {
      // Search (optionally within assembly)
      const searchQuery = `%${query}%`;
      if (assembly) {
        parts = db.prepare(`
          SELECT * FROM parts_catalogue 
          WHERE assemblyTitle = ? AND (name LIKE ? OR partNumber LIKE ?) 
          LIMIT 50
        `).all(assembly, searchQuery, searchQuery);
      } else {
        parts = db.prepare(`
          SELECT * FROM parts_catalogue 
          WHERE name LIKE ? OR partNumber LIKE ? 
          LIMIT 50
        `).all(searchQuery, searchQuery);
      }
    } else {
      // Default: show first few items or random
      parts = db.prepare('SELECT * FROM parts_catalogue LIMIT 20').all();
    }

    return NextResponse.json(parts);
  } catch (error) {
    console.error('Catalogue fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 });
  }
}
