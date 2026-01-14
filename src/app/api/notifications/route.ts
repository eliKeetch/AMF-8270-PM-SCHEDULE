import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { AppNotification } from '@/types';

export async function GET() {
  try {
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all() as any[];
    return NextResponse.json(notifications.map(n => ({
      ...n,
      read: Boolean(n.read),
      data: n.data ? JSON.parse(n.data) : undefined
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const notification = await request.json() as AppNotification;
    db.prepare(`
      INSERT INTO notifications (id, type, title, message, timestamp, read, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      notification.id,
      notification.type,
      notification.title,
      notification.message,
      notification.timestamp,
      notification.read ? 1 : 0,
      notification.data ? JSON.stringify(notification.data) : null
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, read } = await request.json();
    db.prepare('UPDATE notifications SET read = ? WHERE id = ?').run(read ? 1 : 0, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    db.prepare('DELETE FROM notifications').run();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
  }
}
