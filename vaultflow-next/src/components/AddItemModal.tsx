'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import SupplierSelector from './SupplierSelector';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const { addItem, orders, loadOrders } = useStore();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    location: 'A-01',
    qty: 0,
    reorder: 10,
    cost: 1.00,
    retail_price: 0,
    wholesale_price: 0,
    supplier_id: undefined as string | undefined,
    order_id: undefined as string | undefined
  });

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, loadOrders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addItem(formData);
      onClose();
      setFormData({
        sku: '',
        name: '',
        category: '',
        location: 'A-01',
        qty: 0,
        reorder: 10,
        cost: 1.00,
        retail_price: 0,
        wholesale_price: 0,
        supplier_id: undefined,
        order_id: undefined
      });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const generateSKU = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let sku = '';
    for (let i = 0; i < 8; i++) {
      sku += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData(prev => ({ ...prev, sku }));
  };

  const handleGenerateSKU = () => {
    generateSKU();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Item</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>SKU</label>
            <div className="sku-input-group">
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                required
              />
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleGenerateSKU}>
                Generate
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Supplier</label>
            <SupplierSelector
              value={formData.supplier_id}
              onChange={(supplierId) => setFormData(prev => ({ ...prev, supplier_id: supplierId }))}
              placeholder="Select or create supplier..."
            />
          </div>
          
          <div className="form-group">
            <label>Order (Optional)</label>
            <select
              value={formData.order_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, order_id: e.target.value || undefined }))}
            >
              <option value="">No Order</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.order_number} - {order.supplier_name || 'Unknown Supplier'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={formData.qty}
                onChange={(e) => setFormData(prev => ({ ...prev, qty: parseInt(e.target.value) || 0 }))}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Reorder Point</label>
              <input
                type="number"
                value={formData.reorder}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder: parseInt(e.target.value) || 0 }))}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Retail Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.retail_price}
                onChange={(e) => setFormData(prev => ({ ...prev, retail_price: parseFloat(e.target.value) || 0 }))}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Wholesale Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.wholesale_price}
                onChange={(e) => setFormData(prev => ({ ...prev, wholesale_price: parseFloat(e.target.value) || 0 }))}
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 