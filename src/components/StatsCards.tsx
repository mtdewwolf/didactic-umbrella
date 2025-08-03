'use client';

import { useInventoryStore, currency } from '@/lib/store';

export default function StatsCards() {
  const { items } = useInventoryStore();

  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.qty, 0);
  const lowStockItems = items.filter(item => {
    const status = item.qty === 0 ? 'oos' : item.qty <= item.reorder ? 'low' : 'ok';
    return status !== 'ok';
  }).length;
  const inventoryValue = items.reduce((sum, item) => sum + (item.cost * item.qty), 0);

  return (
    <section className="grid grid-cols-4 gap-4">
      <div className="card accent">
        <div className="em">{totalItems}</div>
        <div className="sub">Total SKUs</div>
      </div>
      <div className="card">
        <div className="em">{totalUnits}</div>
        <div className="sub">Total Units</div>
      </div>
      <div className="card">
        <div className="em">{lowStockItems}</div>
        <div className="sub">Low Stock Items</div>
      </div>
      <div className="card">
        <div className="em">{currency(inventoryValue)}</div>
        <div className="sub">Inventory Value</div>
      </div>
    </section>
  );
} 