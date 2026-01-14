import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { MachineIssue } from '@/types';

export async function GET() {
  try {
    const issues = db.prepare('SELECT * FROM machine_issues ORDER BY timestamp DESC').all() as any[];
    return NextResponse.json(issues.map(i => ({
      ...i,
      resolved: Boolean(i.resolved)
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const issue = await request.json() as MachineIssue;
    db.prepare(`
      INSERT INTO machine_issues (id, machineId, type, timestamp, resolved, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      issue.id,
      issue.machineId,
      issue.type,
      issue.timestamp,
      issue.resolved ? 1 : 0,
      issue.notes || null
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to report issue' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, resolved } = await request.json();
    db.prepare('UPDATE machine_issues SET resolved = ? WHERE id = ?').run(resolved ? 1 : 0, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    db.prepare('DELETE FROM machine_issues WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
  }
}
