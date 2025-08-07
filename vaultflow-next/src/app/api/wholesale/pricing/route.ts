import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

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
    const pricing = db.prepare(`
      SELECT cp.*, wc.name as customer_name, wc.company as customer_company
      FROM customer_pricing cp
      JOIN wholesale_customers wc ON cp.customer_id = wc.id
      ORDER BY cp.created_at DESC
    `).all();

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error('Failed to get customer pricing:', error);
    return NextResponse.json(
      { error: 'Failed to get customer pricing' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, sku, custom_price } = body;
    
    const now = new Date().toISOString();
    const id = generateId();
    
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO customer_pricing (id, customer_id, sku, custom_price, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(id, customer_id, sku, custom_price, now, now);
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to add customer pricing:', error);
    return NextResponse.json(
      { error: 'Failed to add customer pricing' },
      { status: 500 }
    );
  }
} 