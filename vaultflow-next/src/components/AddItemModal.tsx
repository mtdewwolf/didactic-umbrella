'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const { addItem } = useStore();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    location: 'A-01',
    qty: 0,
    reorder: 10,
    cost: 1.00
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const newItem = {
      sku: (formData.sku.trim() || generateSKU()).toUpperCase(),
      name: formData.name.trim() || "Unnamed",
      category: formData.category.trim() || "General",
      location: formData.location.trim() || "A-01",
      qty: Math.max(0, formData.qty),
      reorder: Math.max(0, formData.reorder),
      cost: Math.max(0, parseFloat(formData.cost.toString()))
    };

    await addItem(newItem);
    onClose();
    setFormData({
      sku: '',
      name: '',
      category: '',
      location: 'A-01',
      qty: 0,
      reorder: 10,
      cost: 1.00
    });
  };

  const generateSKU = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  const handleGenerateSKU = () => {
    setFormData(prev => ({ ...prev, sku: generateSKU() }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal show">
      <div className="backdrop" onClick={onClose}></div>
      <div className="dialog" role="dialog" aria-modal="true">
        <div className="dialog-header">
          <div className="dialog-title">Add New Item</div>
        </div>
        <div className="dialog-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-row">
                <label htmlFor="sku">SKU</label>
                <input
                  type="text"
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Scan or generate…"
                />
              </div>
              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Item name"
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Category e.g. Hardware"
                />
              </div>
              <div className="form-row">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="A-01"
                />
              </div>
              <div className="form-row">
                <label htmlFor="qty">Quantity</label>
                <input
                  type="number"
                  id="qty"
                  value={formData.qty}
                  onChange={(e) => setFormData(prev => ({ ...prev, qty: parseInt(e.target.value) || 0 }))}
                  min="0"
                  step="1"
                />
              </div>
              <div className="form-row">
                <label htmlFor="reorder">Reorder Point</label>
                <input
                  type="number"
                  id="reorder"
                  value={formData.reorder}
                  onChange={(e) => setFormData(prev => ({ ...prev, reorder: parseInt(e.target.value) || 0 }))}
                  min="0"
                  step="1"
                />
              </div>
              <div className="form-row">
                <label htmlFor="cost">Unit Cost</label>
                <input
                  type="number"
                  id="cost"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </form>
        </div>
        <div className="dialog-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleGenerateSKU}>Generate SKU</button>
          <button className="btn primary" onClick={handleSubmit}>Save Item</button>
        </div>
      </div>
    </div>
  );
} 