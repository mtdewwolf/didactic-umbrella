import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

export async function POST(request: NextRequest) {
  try {
    const { order_id, items } = await request.json();

    if (!order_id || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Verify the order exists
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Add items to the order
    const addItemStmt = db.prepare(`
      INSERT INTO inventory_items (
        id, sku, name, category, location, qty, reorder, cost, 
        supplier_id, order_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateItemStmt = db.prepare(`
      UPDATE inventory_items 
      SET order_id = ?, updated_at = ? 
      WHERE sku = ?
    `);

    const transaction = db.transaction(() => {
      for (const item of items) {
        const now = new Date().toISOString();
        
        // Check if item already exists
        const existingItem = db.prepare('SELECT * FROM inventory_items WHERE sku = ?').get(item.sku);
        
        if (existingItem) {
          // Update existing item to link to this order
          updateItemStmt.run(order_id, now, item.sku);
        } else {
          // Create new item linked to this order
          addItemStmt.run(
            item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            item.sku,
            item.name,
            item.category || 'Uncategorized',
            item.location || 'Unknown',
            item.qty || 0,
            item.reorder || 0,
            item.cost || 0,
            order.supplier_id,
            order_id,
            now,
            now
          );
        }
      }
    });

    transaction();

    return NextResponse.json({ success: true, message: 'Items added to order successfully' });
  } catch (error) {
    console.error('Error adding items to order:', error);
    return NextResponse.json({ error: 'Failed to add items to order' }, { status: 500 });
  }
} 