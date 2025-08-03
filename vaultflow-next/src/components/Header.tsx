'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import AddItemModal from './AddItemModal';

export default function Header() {
  const { setFilter, importCSV } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleImport = () => {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = ".csv,text/csv";
    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (file) {
        const text = await file.text();
        await importCSV(text);
      }
    };
    picker.click();
  };

  const handleAddItem = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="brand">
            <div className="logo" aria-hidden="true"></div>
            <h1>GoldMine Distro — Inventory</h1>
          </div>
          <div className="searchbar">
            <input 
              id="search" 
              placeholder="Search SKU, name, location, supplier…" 
              onChange={handleSearch}
            />
            <span className="kbd">⌘ K</span>
          </div>
          <div className="actions">
            <button className="btn" onClick={handleImport}>Import CSV</button>
            <button className="btn primary" onClick={handleAddItem}>+ New Item</button>
          </div>
        </div>
      </header>
      
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 