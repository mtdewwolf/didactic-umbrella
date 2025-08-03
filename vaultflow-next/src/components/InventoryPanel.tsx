'use client';

import { useStore, currency, statusOf } from '@/lib/store';

export default function InventoryPanel() {
  const { items, filter, mode, setMode, setSelected, exportCSV, clearAll, loading, error } = useStore();

  const filteredItems = items.filter(item => {
    const f = filter.toLowerCase().trim();
    const base = [item.sku, item.name, item.category, item.location].join(" ").toLowerCase();
    if (f === "low") return statusOf(item) === "low";
    if (f === "oos") return statusOf(item) === "oos";
    return base.includes(f);
  });

  const handleRowClick = (sku: string) => {
    setSelected(sku);
  };

  const handleModeChange = (newMode: 'table' | 'kanban') => {
    setMode(newMode);
  };

  const handleExport = () => {
    exportCSV();
  };

  const handleClear = () => {
    clearAll();
  };

  const getStatusBadge = (status: string) => {
    const label = { ok: "OK", low: "LOW", oos: "OUT" }[status];
    return <span className={`status ${status}`}>{label}</span>;
  };

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Inventory</div>
        </div>
        <div className="panel-body">
          <div className="empty">
            <p>Loading inventory...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Inventory</div>
        </div>
        <div className="panel-body">
          <div className="empty">
            <p>Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">Inventory</div>
        <div className="toolbar">
          <div className="seg">
            <button 
              className={mode === 'table' ? 'active' : ''} 
              onClick={() => handleModeChange('table')}
            >
              Table
            </button>
            <button 
              className={mode === 'kanban' ? 'active' : ''} 
              onClick={() => handleModeChange('kanban')}
            >
              Kanban
            </button>
          </div>
          <button className="btn" onClick={handleExport}>Export CSV</button>
          <button className="btn danger" onClick={handleClear}>Clear</button>
        </div>
      </div>
      <div className="panel-body">
        {items.length === 0 ? (
          <div className="empty">
            <p>No inventory items yet.</p>
            <p>Start by adding items or importing a CSV file.</p>
          </div>
        ) : mode === 'table' ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Qty</th>
                  <th>Reorder</th>
                  <th>Status</th>
                  <th>Unit Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.sku} onClick={() => handleRowClick(item.sku)}>
                    <td><strong>{item.sku}</strong></td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.location}</td>
                    <td>{item.qty}</td>
                    <td>{item.reorder}</td>
                    <td>{getStatusBadge(statusOf(item))}</td>
                    <td>{currency(item.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && items.length > 0 && (
              <div className="empty">
                <p>No items match your current filter.</p>
                <p>Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="kanban">
            <div className="col" data-col="ok">
              <h4>Healthy</h4>
              <div className="tickets">
                {filteredItems.filter(item => statusOf(item) === 'ok').map(item => (
                  <div key={item.sku} className="ticket" draggable>
                    <div className="title">{item.name}</div>
                    <div className="meta">{item.sku} • {item.location} • {currency(item.cost)}</div>
                    <div className="meta">Qty: {item.qty} / Reorder {item.reorder}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col" data-col="low">
              <h4>Low</h4>
              <div className="tickets">
                {filteredItems.filter(item => statusOf(item) === 'low').map(item => (
                  <div key={item.sku} className="ticket" draggable>
                    <div className="title">{item.name}</div>
                    <div className="meta">{item.sku} • {item.location} • {currency(item.cost)}</div>
                    <div className="meta">Qty: {item.qty} / Reorder {item.reorder}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col" data-col="oos">
              <h4>Out of Stock</h4>
              <div className="tickets">
                {filteredItems.filter(item => statusOf(item) === 'oos').map(item => (
                  <div key={item.sku} className="ticket" draggable>
                    <div className="title">{item.name}</div>
                    <div className="meta">{item.sku} • {item.location} • {currency(item.cost)}</div>
                    <div className="meta">Qty: {item.qty} / Reorder {item.reorder}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 