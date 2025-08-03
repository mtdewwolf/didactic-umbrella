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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, delta } = body;
    
    const now = new Date().toISOString();
    
    // Update quantity
    const updateStmt = db.prepare(`
      UPDATE inventory_items 
      SET qty = qty + ?, updated_at = ?
      WHERE sku = ?
    `);
    updateStmt.run(delta, now, sku);
    
    // Add activity log
    const activityStmt = db.prepare(`
      INSERT INTO activity_logs (id, type, sku, delta, at)
      VALUES (?, ?, ?, ?, ?)
    `);
    activityStmt.run(generateId(), 'adjust', sku, delta, now);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to adjust quantity:', error);
    return NextResponse.json(
      { error: 'Failed to adjust quantity' },
      { status: 500 }
    );
  }
} 