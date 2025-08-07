'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth';
import AddItemModal from './AddItemModal';

export default function Header() {
  const { filter, setFilter, importCSV } = useStore();
  const { user, logout } = useAuthStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        await importCSV(text);
      }
    };
    input.click();
  };

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
                           <div className="brand">
                   <img src="/logo.png" alt="GoldMine Distro" className="brand-logo" />
                   <h1>GoldMine Distro — Inventory</h1>
                 </div>
          
          <div className="search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search SKU, name, location... Ctrl+K"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <div className="actions">
            <button className="btn btn-secondary" onClick={handleImportCSV}>
              Import CSV
            </button>
            <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
              New Item
            </button>
            {user && (
              <div className="user-menu">
                <span className="user-name">{user.name || user.email}</span>
                <button className="btn btn-sm btn-secondary" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AddItemModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );
} 