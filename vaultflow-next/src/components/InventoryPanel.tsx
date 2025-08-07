'use client';

import { useState } from 'react';
import { useStore, currency, statusOf } from '@/lib/store';
import EditItemModal from './EditItemModal';
import QuickQuantityAdjust from './QuickQuantityAdjust';

export default function InventoryPanel() {
  const { items, filter, mode, setMode, setSelected, exportCSV, clearAll, loading, error } = useStore();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredItems = items.filter(item => {
    if (!filter) return true;
    const search = filter.toLowerCase();
    return (
      item.sku.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      item.location.toLowerCase().includes(search) ||
      (item.supplier_name && item.supplier_name.toLowerCase().includes(search)) ||
      (filter === "low" && statusOf(item) === "low") ||
      (filter === "oos" && statusOf(item) === "oos")
    );
  });

  const handleRowClick = (sku: string) => {
    setSelected(sku);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingItem(null);
  };

  const handleModeChange = (newMode: 'table' | 'kanban') => {
    setMode(newMode);
  };

  const handleExport = () => {
    exportCSV();
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all inventory? This action cannot be undone.')) {
      clearAll();
    }
  };

  const getStatusBadge = (item: any) => {
    const status = statusOf(item);
    const colors = {
      ok: "var(--ok)",
      low: "var(--warning)", 
      oos: "var(--danger)"
    };
    return (
      <span className="badge" style={{ backgroundColor: colors[status] }}>
        {status === "ok" ? "In Stock" : status === "low" ? "Low Stock" : "Out of Stock"}
      </span>
    );
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
    <>
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Inventory</div>
          <div className="panel-actions">
            <div className="view-toggle">
              <button 
                className={`btn btn-sm ${mode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleModeChange('table')}
              >
                Table
              </button>
              <button 
                className={`btn btn-sm ${mode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleModeChange('kanban')}
              >
                Kanban
              </button>
            </div>
            <button className="btn btn-secondary" onClick={handleExport}>
              Export CSV
            </button>
            <button className="btn btn-danger" onClick={handleClear}>
              Clear All
            </button>
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
                    <th>Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Supplier</th>
                    <th>Order</th>
                    <th>Quantity</th>
                    <th>Reorder</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.sku} onClick={() => handleRowClick(item.sku)}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.location}</td>
                      <td>{item.supplier_name || '-'}</td>
                      <td>{item.order_number || '-'}</td>
                      <td>
                        <QuickQuantityAdjust item={item} />
                      </td>
                      <td>{item.reorder}</td>
                      <td>{currency(item.cost)}</td>
                      <td>{getStatusBadge(item)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            title="Edit item"
                          >
                            ✎
                          </button>
                        </div>
                      </td>
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
            <div className="kanban-grid">
              {filteredItems.map(item => (
                <div key={item.sku} className="kanban-card" onClick={() => handleRowClick(item.sku)}>
                  <div className="card-header">
                    <h3>{item.name}</h3>
                    <span className="sku">{item.sku}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Location:</strong> {item.location}</p>
                    <p><strong>Supplier:</strong> {item.supplier_name || 'None'}</p>
                    <p><strong>Quantity:</strong> 
                      <QuickQuantityAdjust item={item} />
                    </p>
                    <p><strong>Reorder:</strong> {item.reorder}</p>
                    <p><strong>Cost:</strong> {currency(item.cost)}</p>
                    <div className="card-status">
                      {getStatusBadge(item)}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                      title="Edit item"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <EditItemModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        item={editingItem}
      />
    </>
  );
} 