import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { FrameLog } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = db.prepare('SELECT * FROM frame_logs ORDER BY date DESC').all() as FrameLog[];
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch frame logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const log = await request.json() as FrameLog;
    
    // Check if entry for this date already exists
    const existing = db.prepare('SELECT id FROM frame_logs WHERE date = ?').get(log.date) as { id: string } | undefined;
    
    if (existing) {
      db.prepare(`
        UPDATE frame_logs 
        SET frameCount = ?, notes = ?
        WHERE date = ?
      `).run(
        log.frameCount,
        log.notes || null,
        log.date
      );
    } else {
      db.prepare(`
        INSERT INTO frame_logs (id, date, frameCount, notes)
        VALUES (?, ?, ?, ?)
      `).run(
        log.id,
        log.date,
        log.frameCount,
        log.notes || null
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Frames POST error:', error);
    return NextResponse.json({ error: 'Failed to log frames' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    db.prepare('DELETE FROM frame_logs WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 });
  }
}
