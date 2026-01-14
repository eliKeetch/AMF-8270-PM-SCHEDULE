import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = db.prepare("SELECT * FROM settings").get() as any;
    
    if (!settings) return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    
    // Parse JSON strings back to objects
    const response = {
      ...settings,
      closedDays: typeof settings.closedDays === 'string' ? JSON.parse(settings.closedDays) : (settings.closedDays || []),
      dayCapacities: typeof settings.dayCapacities === 'string' ? JSON.parse(settings.dayCapacities) : (settings.dayCapacities || {}),
      preferredDays: typeof settings.preferredDays === 'string' ? JSON.parse(settings.preferredDays) : (settings.preferredDays || []),
      issueThresholds: typeof settings.issueThresholds === 'string' ? JSON.parse(settings.issueThresholds) : (settings.issueThresholds || {}),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Settings GET error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch settings', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { closedDays, dayCapacities, preferredDays, spreadMethod, issueThresholds } = body;
    
    const stmt = db.prepare(`
      UPDATE settings 
      SET closedDays = ?, dayCapacities = ?, preferredDays = ?, spreadMethod = ?, issueThresholds = ?
      WHERE id = 'current'
    `);
    
    stmt.run(
      JSON.stringify(closedDays),
      JSON.stringify(dayCapacities),
      JSON.stringify(preferredDays),
      spreadMethod,
      JSON.stringify(issueThresholds)
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
