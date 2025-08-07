'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import SupplierSelector from './SupplierSelector';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export default function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  const { updateItem } = useStore();
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    location: '',
    qty: 0,
    reorder: 10,
    cost: 1.00,
    supplier_id: undefined as string | undefined
  });

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku || '',
        name: item.name || '',
        category: item.category || '',
        location: item.location || '',
        qty: item.qty || 0,
        reorder: item.reorder || 10,
        cost: item.cost || 1.00,
        supplier_id: item.supplier_id || undefined
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item?.sku) return;

    try {
      await updateItem(item.sku, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !item) return null;

  return (
    <div className="modal show">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Item</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
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
          
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={formData.qty}
                onChange={(e) => handleInputChange('qty', parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Reorder Point</label>
              <input
                type="number"
                value={formData.reorder}
                onChange={(e) => handleInputChange('reorder', parseInt(e.target.value) || 0)}
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
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
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
              Update Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 