import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'goldmine_distro.db');
const db = new Database(dbPath);

export async function POST(request: NextRequest) {
  try {
    const { order_id, received_by } = await request.json();

    if (!order_id || !received_by) {
      return NextResponse.json({ error: 'Order ID and receiver name are required' }, { status: 400 });
    }

    // Get the order and its items
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get items linked to this order
    const orderItems = db.prepare('SELECT * FROM inventory_items WHERE order_id = ?').all(order_id);
    
    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'No items found for this order' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Update order status and add receiver info
    const updateOrderStmt = db.prepare(`
      UPDATE orders 
      SET status = 'received', received_by = ?, received_at = ?, updated_at = ?
      WHERE id = ?
    `);

    // Add items to inventory (update quantities)
    const updateItemStmt = db.prepare(`
      UPDATE inventory_items 
      SET qty = qty + ?, updated_at = ?
      WHERE sku = ?
    `);

    // Add activity log entries
    const activityStmt = db.prepare(`
      INSERT INTO activity_logs (id, type, sku, delta, at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      // Update order status
      updateOrderStmt.run(received_by, now, now, order_id);

      // Update inventory quantities and log activities
      for (const item of orderItems) {
        const currentQty = item.qty || 0;
        const newQty = currentQty + (item.qty || 0); // Add the order quantity to current inventory
        
        updateItemStmt.run(item.qty || 0, now, item.sku);
        
        // Log the activity
        const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        activityStmt.run(activityId, 'adjust', item.sku, item.qty || 0, now);
      }
    });

    transaction();

    return NextResponse.json({ 
      success: true, 
      message: 'Order received and items added to inventory',
      itemsReceived: orderItems.length
    });
  } catch (error) {
    console.error('Error receiving order:', error);
    return NextResponse.json({ error: 'Failed to receive order' }, { status: 500 });
  }
} 