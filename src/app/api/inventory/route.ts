import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const items = db.prepare('SELECT * FROM inventory').all();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partNumber, name, category, quantity, minQuantity, location, pdfPage } = body;
    
    const id = uuidv4();
    const insert = db.prepare(`
      INSERT INTO inventory (id, partNumber, name, category, quantity, minQuantity, location, pdfPage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(id, partNumber, name, category, quantity || 0, minQuantity || 5, location || null, pdfPage || null);
    
    const newItem = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, quantity, change, reason, technicianName } = body;
    
    if (change !== undefined) {
      // Adjustment mode
      db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE id = ?').run(change, id);
      
      // Log the change
      const logId = uuidv4();
      db.prepare(`
        INSERT INTO inventory_logs (id, itemId, change, reason, technicianName, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(logId, id, change, reason || 'Manual adjustment', technicianName || 'Unknown', new Date().toISOString());
    } else if (quantity !== undefined) {
      // Direct set mode
      db.prepare('UPDATE inventory SET quantity = ? WHERE id = ?').run(quantity, id);
    } else {
      // Full update
      const { partNumber, name, category, minQuantity, location, pdfPage } = body;
      db.prepare(`
        UPDATE inventory 
        SET partNumber = ?, name = ?, category = ?, minQuantity = ?, location = ?, pdfPage = ?
        WHERE id = ?
      `).run(partNumber, name, category, minQuantity, location, pdfPage, id);
    }
    
    const updatedItem = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Inventory PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
