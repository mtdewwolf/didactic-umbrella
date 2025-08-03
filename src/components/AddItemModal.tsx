'use client';

import { useState, useEffect } from 'react';
import { useInventoryStore, nanoid } from '@/lib/store';
import { InventoryItem } from '@/types/inventory';

interface AddItemModalProps {
  showToast: (message: string) => void;
}

export default function AddItemModal({ showToast }: AddItemModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'manual' | 'scan'>('manual');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    location: 'A-01',
    qty: '0',
    reorder: '10',
    cost: '1.00',
  });

  const { addItem, select } = useInventoryStore();

  const handleOpen = () => {
    setIsOpen(true);
    setFormData({
      sku: '',
      name: '',
      category: '',
      location: 'A-01',
      qty: '0',
      reorder: '10',
      cost: '1.00',
    });
    setMode('manual');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast('Please enter a name');
      return;
    }

    const item: InventoryItem = {
      sku: (formData.sku.trim() || nanoid()).toUpperCase(),
      name: formData.name.trim() || 'Unnamed',
      category: formData.category.trim() || 'General',
      location: formData.location.trim() || 'A-01',
      qty: Number.isFinite(+formData.qty) ? Math.max(0, +formData.qty) : 0,
      reorder: Number.isFinite(+formData.reorder) ? Math.max(0, +formData.reorder) : 10,
      cost: Number.isFinite(+formData.cost) ? Math.max(0, +(+formData.cost).toFixed(2)) : 0,
    };

    addItem(item);
    select(item.sku);
    handleClose();
    showToast(`Added ${item.sku}`);
  };

  const handleGenerateSku = () => {
    setFormData(prev => ({ ...prev, sku: nanoid() }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      <div className={`modal ${isOpen ? 'show' : ''}`}>
        <div className="backdrop" onClick={handleClose}></div>
        <div className="dialog">
          <div className="dialog-header">
            <div className="dialog-title">Add New Item</div>
            <div className="seg-switch">
              {['manual', 'scan'].map((m) => (
                <button
                  key={m}
                  className={`${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m as 'manual' | 'scan')}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="dialog-body">
            <form onKeyDown={handleKeyDown} className="grid gap-3">
              <div className="form-grid">
                <div className="form-row">
                  <label htmlFor="sku">SKU</label>
                  <input
                    type="text"
                    id="sku"
                    placeholder={mode === 'scan' ? 'Click here and scan barcode…' : 'Scan or generate…'}
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Item name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    placeholder="Category e.g. Hardware"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    placeholder="A-01"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="qty">Quantity</label>
                  <input
                    type="number"
                    id="qty"
                    min="0"
                    step="1"
                    value={formData.qty}
                    onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="reorder">Reorder Point</label>
                  <input
                    type="number"
                    id="reorder"
                    min="0"
                    step="1"
                    value={formData.reorder}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorder: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="cost">Unit Cost</label>
                  <input
                    type="number"
                    id="cost"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
              </div>
              {mode === 'scan' && (
                <div className="text-xs text-[var(--muted)]">
                  Tip: Click the SKU field and scan a barcode with your USB scanner. Most scanners send the digits then Enter.
                </div>
              )}
            </form>
          </div>
          <div className="dialog-footer">
            <button className="btn" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn" onClick={handleGenerateSku}>
              Generate SKU
            </button>
            <button className="btn primary" onClick={handleSave}>
              Save Item
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 