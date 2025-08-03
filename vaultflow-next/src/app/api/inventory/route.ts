import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    qty INTEGER NOT NULL DEFAULT 0,
    reorder INTEGER NOT NULL DEFAULT 10,
    cost REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    sku TEXT,
    delta INTEGER,
    count INTEGER,
    at DATETIME NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
  CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
  CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory_items(location);
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
      SELECT * FROM inventory_items 
      ORDER BY created_at DESC
    `);
    const items = stmt.all();
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to get inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to get inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, name, category, location, qty, reorder, cost } = body;
    
    const now = new Date().toISOString();
    const id = generateId();
    
    // Insert item
    const insertStmt = db.prepare(`
      INSERT INTO inventory_items (id, sku, name, category, location, qty, reorder, cost, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, sku, name, category, location, qty, reorder, cost, now, now);
    
    // Add activity log
    const activityStmt = db.prepare(`
      INSERT INTO activity_logs (id, type, sku, at)
      VALUES (?, ?, ?, ?)
    `);
    activityStmt.run(generateId(), 'add', sku, now);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to add inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, updates } = body;
    
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
    if (updates.location !== undefined) { fields.push('location = ?'); values.push(updates.location); }
    if (updates.qty !== undefined) { fields.push('qty = ?'); values.push(updates.qty); }
    if (updates.reorder !== undefined) { fields.push('reorder = ?'); values.push(updates.reorder); }
    if (updates.cost !== undefined) { fields.push('cost = ?'); values.push(updates.cost); }
    
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(sku);

    const stmt = db.prepare(`
      UPDATE inventory_items 
      SET ${fields.join(', ')}
      WHERE sku = ?
    `);
    stmt.run(...values);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    
    if (!sku) {
      return NextResponse.json(
        { error: 'SKU parameter is required' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare(`
      DELETE FROM inventory_items 
      WHERE sku = ?
    `);
    stmt.run(sku);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
} 