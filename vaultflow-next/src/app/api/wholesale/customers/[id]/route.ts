import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { email, name, company, phone, address, discount, status } = body;
    
    const now = new Date().toISOString();
    
    const updateStmt = db.prepare(`
      UPDATE wholesale_customers 
      SET email = ?, name = ?, company = ?, phone = ?, address = ?, discount = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
    
    updateStmt.run(email, name, company, phone, address, discount, status, now, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update wholesale customer:', error);
    return NextResponse.json(
      { error: 'Failed to update wholesale customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Delete customer pricing first
    const deletePricingStmt = db.prepare(`
      DELETE FROM customer_pricing WHERE customer_id = ?
    `);
    deletePricingStmt.run(id);
    
    // Delete customer
    const deleteCustomerStmt = db.prepare(`
      DELETE FROM wholesale_customers WHERE id = ?
    `);
    deleteCustomerStmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete wholesale customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete wholesale customer' },
      { status: 500 }
    );
  }
} 