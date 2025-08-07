'use client';

import { useStore } from '@/lib/store';

export default function Sidebar() {
  const { setFilter, currentView, setCurrentView } = useStore();

  const handleNavClick = (view: 'dashboard' | 'inventory' | 'orders' | 'suppliers' | 'locations' | 'items' | 'wholesale') => {
    setCurrentView(view);
  };

  const handleWarehouseClick = (code: string) => {
    setFilter(code.toLowerCase());
  };

  const handleFilterClick = (filter: string) => {
    let val = "";
    if (filter === "low") val = "low";
    else if (filter === "oos") val = "oos";
    else if (filter === "perishable") val = "produce";
    setFilter(val);
  };

  return (
    <aside className="sidebar">
      <div className="nav-group">
        <div className="nav-title">Navigation</div>
        <div 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} 
          onClick={() => handleNavClick('dashboard')}
        >
          Dashboard
        </div>
        <div 
          className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`} 
          onClick={() => handleNavClick('inventory')}
        >
          Inventory
        </div>
        <div 
          className={`nav-item ${currentView === 'orders' ? 'active' : ''}`} 
          onClick={() => handleNavClick('orders')}
        >
          Orders
        </div>
        <div 
          className={`nav-item ${currentView === 'suppliers' ? 'active' : ''}`} 
          onClick={() => handleNavClick('suppliers')}
        >
          Suppliers
        </div>
        <div 
          className={`nav-item ${currentView === 'locations' ? 'active' : ''}`} 
          onClick={() => handleNavClick('locations')}
        >
          Locations
        </div>
        <div 
          className={`nav-item ${currentView === 'items' ? 'active' : ''}`} 
          onClick={() => handleNavClick('items')}
        >
          Items
        </div>
      </div>
      <div className="nav-group">
        <div className="nav-title">Wholesale</div>
        <div 
          className={`nav-item ${currentView === 'wholesale' ? 'active' : ''}`} 
          onClick={() => handleNavClick('wholesale')}
        >
          Wholesale Management
        </div>
      </div>
      <div className="nav-group">
        <div className="nav-title">Quick Filters</div>
        <div className="chips">
          <span className="chip" onClick={() => handleFilterClick('low')}>Low Stock</span>
          <span className="chip" onClick={() => handleFilterClick('oos')}>Out of Stock</span>
          <span className="chip" onClick={() => handleFilterClick('perishable')}>Perishable</span>
          <span className="chip" onClick={() => handleFilterClick('overstock')}>Overstock</span>
        </div>
      </div>
      <div className="nav-group">
        <div className="nav-title">Warehouses</div>
        <div className="nav-item" onClick={() => handleWarehouseClick('A')}>North A</div>
        <div className="nav-item" onClick={() => handleWarehouseClick('B')}>Central B</div>
        <div className="nav-item" onClick={() => handleWarehouseClick('C')}>South C</div>
      </div>
    </aside>
  );
} 