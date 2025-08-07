import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

// Create orders table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    supplier_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    order_date DATETIME NOT NULL,
    expected_delivery DATETIME,
    notes TEXT,
    total_amount REAL DEFAULT 0.0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
  CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
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

// Helper function to generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PO-${year}${month}${day}-${random}`;
}

export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT o.*, s.name as supplier_name
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      ORDER BY o.created_at DESC
    `);
    const orders = stmt.all();
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to get orders:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplier_id, order_number, expected_delivery, notes } = body;
    
    const now = new Date().toISOString();
    const id = generateId();
    const finalOrderNumber = order_number || generateOrderNumber();
    
    // Insert order
    const insertStmt = db.prepare(`
      INSERT INTO orders (id, order_number, supplier_id, status, order_date, expected_delivery, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, finalOrderNumber, supplier_id, 'pending', now, expected_delivery, notes, now, now);
    
    return NextResponse.json({ 
      success: true, 
      order: { 
        id, 
        order_number: finalOrderNumber, 
        supplier_id, 
        status: 'pending',
        order_date: now,
        expected_delivery,
        notes
      }
    });
  } catch (error) {
    console.error('Failed to add order:', error);
    return NextResponse.json(
      { error: 'Failed to add order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;
    
    const fields = [];
    const values = [];
    
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.expected_delivery !== undefined) { fields.push('expected_delivery = ?'); values.push(updates.expected_delivery); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    if (updates.total_amount !== undefined) { fields.push('total_amount = ?'); values.push(updates.total_amount); }
    
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE orders 
      SET ${fields.join(', ')}
      WHERE id = ?
    `);
    stmt.run(...values);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID parameter is required' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare(`
      DELETE FROM orders 
      WHERE id = ?
    `);
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
} 