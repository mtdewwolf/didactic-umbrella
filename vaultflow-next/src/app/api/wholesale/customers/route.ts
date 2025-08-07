import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

// Create wholesale customers table
db.exec(`
  CREATE TABLE IF NOT EXISTS wholesale_customers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    discount REAL DEFAULT 0.0,
    status TEXT DEFAULT 'active',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customer_pricing (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    custom_price REAL NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES wholesale_customers(id),
    UNIQUE(customer_id, sku)
  );

  CREATE INDEX IF NOT EXISTS idx_wholesale_customers_email ON wholesale_customers(email);
  CREATE INDEX IF NOT EXISTS idx_wholesale_customers_status ON wholesale_customers(status);
  CREATE INDEX IF NOT EXISTS idx_customer_pricing_customer ON customer_pricing(customer_id);
  CREATE INDEX IF NOT EXISTS idx_customer_pricing_sku ON customer_pricing(sku);
`);

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
    const customers = db.prepare(`
      SELECT * FROM wholesale_customers 
      ORDER BY created_at DESC
    `).all();

    // Get custom pricing for each customer
    const customersWithPricing = customers.map(customer => {
      const pricing = db.prepare(`
        SELECT sku, custom_price FROM customer_pricing 
        WHERE customer_id = ?
      `).all(customer.id);

      const customPricing: Record<string, number> = {};
      pricing.forEach(p => {
        customPricing[p.sku] = p.custom_price;
      });

      return {
        ...customer,
        customPricing,
      };
    });

    return NextResponse.json({ customers: customersWithPricing });
  } catch (error) {
    console.error('Failed to get wholesale customers:', error);
    return NextResponse.json(
      { error: 'Failed to get wholesale customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company, phone, address, discount, status } = body;
    
    const now = new Date().toISOString();
    const id = generateId();
    
    const insertStmt = db.prepare(`
      INSERT INTO wholesale_customers (id, email, name, company, phone, address, discount, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(id, email, name, company, phone, address, discount, status, now, now);
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to add wholesale customer:', error);
    return NextResponse.json(
      { error: 'Failed to add wholesale customer' },
      { status: 500 }
    );
  }
} 