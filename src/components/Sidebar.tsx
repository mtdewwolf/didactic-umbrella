'use client';

import { useState } from 'react';
import { useInventoryStore } from '@/lib/store';

interface SidebarProps {
  showToast: (message: string) => void;
}

export default function Sidebar({ showToast }: SidebarProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeWarehouse, setActiveWarehouse] = useState<string | null>(null);
  const { setFilter } = useInventoryStore();

  const handleViewChange = (view: string) => {
    setActiveView(view);
    showToast(`Switched to ${view.charAt(0).toUpperCase() + view.slice(1)}`);
  };

  const handleWarehouseFilter = (code: string) => {
    setActiveWarehouse(activeWarehouse === code ? null : code);
    const filter = activeWarehouse === code ? '' : code.toLowerCase();
    setFilter(filter);
    showToast(`Filtered by warehouse ${code}`);
  };

  const handleQuickFilter = (filter: string) => {
    let val = '';
    if (filter === 'low') val = 'low';
    else if (filter === 'oos') val = 'oos';
    else if (filter === 'perishable') val = 'produce';
    setFilter(val);
  };

  return (
    <aside className="sticky top-22 self-start bg-[color-mix(in_oklab,var(--bg-elev)_85%,transparent)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow)] overflow-hidden">
      <div className="p-4 border-b border-dashed border-[var(--border)]">
        <div className="text-[var(--muted)] text-xs tracking-widest uppercase mb-3 ml-2">Navigation</div>
        {['dashboard', 'inventory', 'orders', 'suppliers', 'locations'].map((view) => (
          <div
            key={view}
            className={`flex items-center gap-3 p-2.5 px-3 rounded-xl cursor-pointer text-[var(--text)] border border-transparent hover:bg-[var(--bg-elev-2)] hover:border-[var(--border)] ${
              activeView === view ? 'bg-gradient-to-b from-[rgba(123,109,255,0.18)] to-[rgba(123,109,255,0.06)] border-[rgba(123,109,255,0.25)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]' : ''
            }`}
            onClick={() => handleViewChange(view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </div>
        ))}
      </div>

      <div className="p-4 border-b border-dashed border-[var(--border)]">
        <div className="text-[var(--muted)] text-xs tracking-widest uppercase mb-3 ml-2">Quick Filters</div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'low', label: 'Low Stock', filter: 'low' },
            { id: 'oos', label: 'Out of Stock', filter: 'oos' },
            { id: 'perishable', label: 'Perishable', filter: 'perishable' },
            { id: 'overstock', label: 'Overstock', filter: 'overstock' },
          ].map((chip) => (
            <span
              key={chip.id}
              className="chip cursor-pointer hover:bg-[var(--bg-elev-2)]"
              onClick={() => handleQuickFilter(chip.filter)}
            >
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="text-[var(--muted)] text-xs tracking-widest uppercase mb-3 ml-2">Warehouses</div>
        {[
          { code: 'A', name: 'North A' },
          { code: 'B', name: 'Central B' },
          { code: 'C', name: 'South C' },
        ].map((warehouse) => (
          <div
            key={warehouse.code}
            className={`flex items-center gap-3 p-2.5 px-3 rounded-xl cursor-pointer text-[var(--text)] border border-transparent hover:bg-[var(--bg-elev-2)] hover:border-[var(--border)] ${
              activeWarehouse === warehouse.code ? 'bg-gradient-to-b from-[rgba(123,109,255,0.18)] to-[rgba(123,109,255,0.06)] border-[rgba(123,109,255,0.25)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]' : ''
            }`}
            onClick={() => handleWarehouseFilter(warehouse.code)}
          >
            {warehouse.name}
          </div>
        ))}
      </div>
    </aside>
  );
} 