'use client';

import { useInventoryStore, currency, statusOf } from '@/lib/store';
import { InventoryItem } from '@/types/inventory';

interface DashboardGridProps {
  showToast: (message: string) => void;
}

export default function DashboardGrid({ showToast }: DashboardGridProps) {
  const { items, selected } = useInventoryStore();

  const currentItem = selected ? items.find(item => item.sku === selected) : items[0];

  const lowStockItems = items.filter(item => statusOf(item) !== 'ok').slice(0, 5);

  const handleItemSelect = (item: InventoryItem) => {
    useInventoryStore.getState().select(item.sku);
    showToast(`Planning for ${item.sku}`);
  };

  return (
    <section className="grid grid-cols-[1.25fr_1fr] gap-5">
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Restock Planner</div>
          <div className="flex gap-2 flex-wrap">
            {['7d', '14d', '30d', '90d'].map((period) => (
              <span key={period} className="chip cursor-pointer hover:bg-[var(--bg-elev-2)]" onClick={() => showToast(`Planner lead set to ${period}`)}>
                Lead {period}
              </span>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <div className="grid grid-cols-3 gap-3.5">
            {[
              { title: 'Reorder Soon', items: lowStockItems },
              { title: 'Pending PO', items: [] },
              { title: 'Received', items: [] },
            ].map((column) => (
              <div key={column.title} className="bg-[var(--bg-elev)] border border-dashed border-[var(--border)] rounded-[var(--radius-md)] p-3 min-h-[180px]">
                <h4 className="m-1 mb-2.5 text-[var(--muted)] uppercase text-xs tracking-wider">{column.title}</h4>
                <div className="space-y-2.5">
                  {column.items.map((item) => {
                    const need = Math.max(0, item.reorder + 10 - item.qty);
                    return (
                      <div
                        key={item.sku}
                        className="bg-gradient-to-b from-white/[0.02] to-transparent border border-[var(--border)] rounded-xl p-2.5 shadow-[var(--shadow)] cursor-pointer hover:bg-[var(--bg-elev-2)]"
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs text-[var(--muted)]">{item.sku} • Need {need}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Item Detail</div>
          <div className="flex gap-2">
            <span className="chip">{currentItem?.sku || '—'}</span>
          </div>
        </div>
        <div className="panel-body">
          <div className="grid gap-3">
            <div className="h-[210px] rounded-[var(--radius-md)] border border-[var(--border)] bg-gradient-to-br from-[rgba(109,214,255,0.25)] to-transparent relative overflow-hidden">
              {currentItem && (
                <div className="absolute inset-4">
                  <div className="text-[var(--text)] font-bold text-lg mb-2">{currentItem.name}</div>
                  <div className="text-[var(--muted)] text-sm">SKU {currentItem.sku} • {currentItem.location}</div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Name', value: currentItem?.name || '—' },
                { label: 'Category', value: currentItem?.category || '—' },
                { label: 'Location', value: currentItem?.location || '—' },
                { label: 'Quantity', value: currentItem?.qty?.toString() || '—' },
                { label: 'Reorder Point', value: currentItem?.reorder?.toString() || '—' },
                { label: 'Unit Cost', value: currentItem ? currency(currentItem.cost) : '—' },
              ].map((info) => (
                <div key={info.label} className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-xl p-2.5">
                  <div className="text-[var(--muted)] text-xs">{info.label}</div>
                  <div className="font-medium">{info.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 