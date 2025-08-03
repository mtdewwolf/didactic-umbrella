'use client';

import { useInventoryStore, currency, statusOf } from '@/lib/store';
import { InventoryItem } from '@/types/inventory';

interface InventoryPanelProps {
  showToast: (message: string) => void;
}

export default function InventoryPanel({ showToast }: InventoryPanelProps) {
  const { items, filter, mode, setMode, select, clear } = useInventoryStore();

  const filteredItems = items.filter((item) => {
    const base = [item.sku, item.name, item.category, item.location].join(' ').toLowerCase();
    const f = filter.toLowerCase().trim();
    if (f === 'low') return statusOf(item) === 'low';
    if (f === 'oos') return statusOf(item) === 'oos';
    return base.includes(f);
  });

  const handleItemClick = (item: InventoryItem) => {
    select(item.sku);
    showToast(`Selected ${item.sku}`);
  };

  const handleClear = () => {
    clear();
    showToast('Inventory cleared');
  };

  const getStatusBadge = (status: 'ok' | 'low' | 'oos') => {
    const labels = { ok: 'OK', low: 'LOW', oos: 'OUT' };
    return (
      <span className={`status ${status}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">Inventory</div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-xl overflow-hidden inline-flex">
            {['table', 'kanban'].map((viewMode) => (
              <button
                key={viewMode}
                className={`bg-transparent text-[var(--muted)] border-none px-3 py-2 cursor-pointer font-bold ${
                  mode === viewMode ? 'text-[var(--text)] bg-[var(--bg-elev-2)]' : ''
                }`}
                onClick={() => setMode(viewMode as 'table' | 'kanban')}
              >
                {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => useInventoryStore.getState().exportCSV()}>
            Export CSV
          </button>
          <button className="btn danger" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>
      <div className="panel-body">
        {mode === 'table' ? (
          <div className="w-full">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">SKU</th>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">Item</th>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">Category</th>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">Location</th>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">Qty</th>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">Reorder</th>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">Status</th>
                  <th className="text-left text-xs text-[var(--muted)] font-semibold px-3 pb-1.5">Unit Cost</th>
                </tr>
              </thead>
              <tbody className="space-y-2.5">
                {filteredItems.map((item) => (
                  <tr
                    key={item.sku}
                    className="bg-[var(--bg-elev)] shadow-[var(--shadow)] cursor-pointer hover:bg-[var(--bg-elev-2)]"
                    onClick={() => handleItemClick(item)}
                  >
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)] border-l rounded-l-xl font-bold">
                      {item.sku}
                    </td>
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)]">{item.name}</td>
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)]">{item.category}</td>
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)]">{item.location}</td>
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)]">{item.qty}</td>
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)]">{item.reorder}</td>
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)]">
                      {getStatusBadge(statusOf(item))}
                    </td>
                    <td className="p-3.5 px-3 border-t border-b border-[var(--border)] border-r rounded-r-xl">
                      {currency(item.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3.5">
            {[
              { key: 'ok', title: 'Healthy', items: filteredItems.filter(item => statusOf(item) === 'ok') },
              { key: 'low', title: 'Low', items: filteredItems.filter(item => statusOf(item) === 'low') },
              { key: 'oos', title: 'Out of Stock', items: filteredItems.filter(item => statusOf(item) === 'oos') },
            ].map((column) => (
              <div key={column.key} className="bg-[var(--bg-elev)] border border-dashed border-[var(--border)] rounded-[var(--radius-md)] p-3 min-h-[180px]">
                <h4 className="m-1 mb-2.5 text-[var(--muted)] uppercase text-xs tracking-wider">{column.title}</h4>
                <div className="space-y-2.5">
                  {column.items.map((item) => (
                    <div
                      key={item.sku}
                      className="bg-gradient-to-b from-white/[0.02] to-transparent border border-[var(--border)] rounded-xl p-2.5 shadow-[var(--shadow)] cursor-grab hover:bg-[var(--bg-elev-2)]"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-[var(--muted)]">{item.sku} • {item.location} • {currency(item.cost)}</div>
                      <div className="text-xs text-[var(--muted)]">Qty: {item.qty} / Reorder {item.reorder}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
} 