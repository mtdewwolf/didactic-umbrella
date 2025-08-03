import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

// Helper function to generate unique IDs
function generateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function POST() {
  try {
    const now = new Date().toISOString();
    
    // Clear all inventory items
    db.prepare('DELETE FROM inventory_items').run();
    
    // Add activity log
    const activityStmt = db.prepare(`
      INSERT INTO activity_logs (id, type, at)
      VALUES (?, ?, ?)
    `);
    activityStmt.run(generateId(), 'clear', now);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear inventory:', error);
    return NextResponse.json(
      { error: 'Failed to clear inventory' },
      { status: 500 }
    );
  }
} 