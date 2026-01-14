import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { User } from '@/types';

export async function GET() {
  try {
    const users = db.prepare('SELECT * FROM users').all() as any[];
    return NextResponse.json(users.map(u => ({
      ...u,
      active: Boolean(u.active)
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await request.json() as User;
    db.prepare(`
      INSERT INTO users (id, name, pin, role, active)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.name,
      user.pin,
      user.role,
      user.active ? 1 : 0
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    const keys = Object.keys(updates);
    if (keys.length === 0) return NextResponse.json({ success: true });
    
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => k === 'active' ? (updates[k] ? 1 : 0) : updates[k]);
    
    db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
