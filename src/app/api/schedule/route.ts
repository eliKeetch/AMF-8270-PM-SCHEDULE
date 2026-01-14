import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { ScheduledTask } from '@/types';

export async function GET() {
  try {
    const tasks = db.prepare('SELECT * FROM scheduled_tasks').all() as ScheduledTask[];
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tasks = await request.json() as ScheduledTask[];
    
    const insertTask = db.prepare(`
      INSERT OR REPLACE INTO scheduled_tasks (id, machineId, taskId, date, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((tasksToInsert) => {
      for (const task of tasksToInsert) {
        insertTask.run(task.id, task.machineId, task.taskId, task.date, task.status);
      }
    });
    
    transaction(tasks);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    // Handle bulk updates if array is provided
    if (Array.isArray(body)) {
      const updateStmt = db.prepare('UPDATE scheduled_tasks SET status = ? WHERE id = ?');
      const transaction = db.transaction((updates) => {
        for (const update of updates) {
          updateStmt.run(update.status, update.id);
        }
      });
      transaction(body);
      return NextResponse.json({ success: true, count: body.length });
    }

    const { id, status, date } = body;
    
    if (status) {
      db.prepare('UPDATE scheduled_tasks SET status = ? WHERE id = ?').run(status, id);
    }
    if (date) {
      db.prepare('UPDATE scheduled_tasks SET date = ? WHERE id = ?').run(date, id);
    }
    
    const updated = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Schedule PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update task(s)' }, { status: 500 });
  }
}
