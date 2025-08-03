'use client';

import { useState, useEffect } from 'react';
import { useInventoryStore } from '@/lib/store';

interface HeaderProps {
  showToast: (message: string) => void;
}

export default function Header({ showToast }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const { setFilter, exportCSV } = useInventoryStore();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilter(value);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        useInventoryStore.getState().importCSV(text);
        showToast(`CSV imported (${file.name})`);
      }
    };
    input.click();
  };

  const handleExport = () => {
    exportCSV();
    showToast('Exported CSV');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-[color-mix(in_oklab,var(--bg)_70%,transparent)] backdrop-blur-md border-b border-[var(--border)] shadow-[var(--shadow)]">
      <div className="grid grid-cols-[260px_1fr_auto] gap-4 items-center p-3.5 px-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] shadow-[0_8px_20px_rgba(109,214,255,0.25)] border-2 border-white/8 relative">
            <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/15 to-transparent"></div>
          </div>
          <h1 className="m-0 font-bold text-lg tracking-wide">VaultFlow — Inventory</h1>
        </div>

        <div className="flex gap-2.5 bg-[var(--bg-elev)] border border-[var(--border)] rounded-full px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
          <input
            id="search"
            type="text"
            placeholder="Search SKU, name, location, supplier…"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[var(--text)] text-sm"
          />
          <span className="text-[var(--muted)] text-xs px-2 py-1 rounded-md bg-[var(--chip)] border border-[var(--border)]">
            ⌘ K
          </span>
        </div>

        <div className="flex gap-2.5 items-center">
          <button className="btn" onClick={handleImport}>
            Import CSV
          </button>
          <button className="btn primary" onClick={() => {
            const modal = document.querySelector('.modal') as HTMLElement;
            if (modal) modal.classList.add('show');
          }}>
            + New Item
          </button>
        </div>
      </div>
    </header>
  );
} 