import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

// Create activity_logs table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    sku TEXT,
    delta INTEGER,
    count INTEGER,
    at DATETIME NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(type);
  CREATE INDEX IF NOT EXISTS idx_activity_at ON activity_logs(at);
`);

// Helper function to generate unique IDs
function generateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT * FROM activity_logs 
      ORDER BY at DESC 
      LIMIT 50
    `);
    const activity = stmt.all();
    
    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to get activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sku, delta, count } = body;
    
    const stmt = db.prepare(`
      INSERT INTO activity_logs (id, type, sku, delta, count, at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const id = generateId();
    stmt.run(id, type, sku, delta, count, new Date().toISOString());
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add activity log:', error);
    return NextResponse.json(
      { error: 'Failed to add activity log' },
      { status: 500 }
    );
  }
} 