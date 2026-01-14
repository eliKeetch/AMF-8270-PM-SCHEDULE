import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { MaintenanceRecord } from '@/types';

export async function GET() {
  try {
    const records = db.prepare('SELECT * FROM maintenance_records').all() as MaintenanceRecord[];
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json() as MaintenanceRecord;
    
    // Toggle logic: if exists, delete; otherwise, insert.
    const existing = db.prepare(`
      SELECT id FROM maintenance_records 
      WHERE machineId = ? AND taskId = ? AND month = ? AND year = ?
    `).get(record.machineId, record.taskId, record.month, record.year);
    
    if (existing) {
      db.prepare('DELETE FROM maintenance_records WHERE id = ?').run((existing as any).id);
      return NextResponse.json({ success: true, action: 'deleted' });
    } else {
      db.prepare(`
        INSERT INTO maintenance_records (id, machineId, taskId, month, year, completedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(record.id, record.machineId, record.taskId, record.month, record.year, record.completedAt);
      return NextResponse.json({ success: true, action: 'inserted' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle maintenance record' }, { status: 500 });
  }
}
