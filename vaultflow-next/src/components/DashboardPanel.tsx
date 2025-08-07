'use client';

import { useStore, currency, statusOf } from '@/lib/store';
import StatsCards from './StatsCards';
import InventoryPanel from './InventoryPanel';

export default function DashboardPanel() {
  const { items, filter, mode, setMode, setSelected, exportCSV, clearAll, loading, error } = useStore();

  const filteredItems = items.filter(item => {
    if (!filter) return true;
    const search = filter.toLowerCase();
    return (
      item.sku.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      item.location.toLowerCase().includes(search) ||
      (filter === "low" && statusOf(item) === "low") ||
      (filter === "oos" && statusOf(item) === "oos")
    );
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
          <div className="panel-title">Dashboard</div>
        </div>
        <div className="panel-body">
          <div className="empty">
            <p>Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Dashboard</div>
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
      <StatsCards />
      <InventoryPanel />
    </>
  );
} 