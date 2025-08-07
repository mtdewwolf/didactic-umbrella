import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

// Create suppliers table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    contact_person TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
  CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
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
      SELECT * FROM suppliers 
      ORDER BY name ASC
    `);
    const suppliers = stmt.all();
    
    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Failed to get suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to get suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, contact_person } = body;
    
    const now = new Date().toISOString();
    const id = generateId();
    
    // Check if supplier already exists
    const existingStmt = db.prepare(`
      SELECT id FROM suppliers WHERE name = ?
    `);
    const existing = existingStmt.get(name);
    
    if (existing) {
      return NextResponse.json(
        { error: 'Supplier already exists', supplier: existing },
        { status: 409 }
      );
    }
    
    // Insert supplier
    const insertStmt = db.prepare(`
      INSERT INTO suppliers (id, name, email, phone, address, contact_person, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, name, email, phone, address, contact_person, now, now);
    
    return NextResponse.json({ 
      success: true, 
      supplier: { id, name, email, phone, address, contact_person }
    });
  } catch (error) {
    console.error('Failed to add supplier:', error);
    return NextResponse.json(
      { error: 'Failed to add supplier' },
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
    
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email); }
    if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
    if (updates.address !== undefined) { fields.push('address = ?'); values.push(updates.address); }
    if (updates.contact_person !== undefined) { fields.push('contact_person = ?'); values.push(updates.contact_person); }
    
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE suppliers 
      SET ${fields.join(', ')}
      WHERE id = ?
    `);
    stmt.run(...values);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
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
        { error: 'Supplier ID parameter is required' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare(`
      DELETE FROM suppliers 
      WHERE id = ?
    `);
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
} 