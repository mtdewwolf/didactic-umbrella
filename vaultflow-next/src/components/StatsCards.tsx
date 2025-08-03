'use client';

import { useStore, currency, statusOf } from '@/lib/store';

export default function StatsCards() {
  const { items } = useStore();

  const totalItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const lowStockItems = items.filter(item => statusOf(item) !== "ok").length;
  const totalValue = items.reduce((sum, item) => sum + item.cost * item.qty, 0);

  return (
    <section className="cards">
      <div className="card accent">
        <div className="em">{totalItems}</div>
        <div className="sub">Total SKUs</div>
      </div>
      <div className="card">
        <div className="em">{totalQty}</div>
        <div className="sub">Total Units</div>
      </div>
      <div className="card">
        <div className="em">{lowStockItems}</div>
        <div className="sub">Low Stock Items</div>
      </div>
      <div className="card">
        <div className="em">{currency(totalValue)}</div>
        <div className="sub">Inventory Value</div>
      </div>
    </section>
  );
} 