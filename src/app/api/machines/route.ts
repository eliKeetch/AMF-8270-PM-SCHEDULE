import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Machine } from '@/types';

export async function GET() {
  try {
    const machines = db.prepare('SELECT * FROM machines ORDER BY number ASC').all() as Machine[];
    return NextResponse.json(machines);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;
    
    if (status !== undefined) {
      db.prepare('UPDATE machines SET status = ? WHERE id = ?').run(status, id);
    }
    
    if (notes !== undefined) {
      db.prepare('UPDATE machines SET notes = ? WHERE id = ?').run(notes, id);
    }
    
    const updatedMachine = db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
    return NextResponse.json(updatedMachine);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update machine' }, { status: 500 });
  }
}
