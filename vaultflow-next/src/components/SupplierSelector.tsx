'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

interface SupplierSelectorProps {
  value?: string;
  onChange: (supplierId: string | undefined) => void;
  placeholder?: string;
}

export default function SupplierSelector({ value, onChange, placeholder = "Select supplier..." }: SupplierSelectorProps) {
  const { suppliers, loadSuppliers, addSupplier } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSupplier = async () => {
    if (!newSupplier.name.trim()) return;

    const supplier = await addSupplier(newSupplier);
    if (supplier) {
      onChange(supplier.id);
      setIsCreating(false);
      setNewSupplier({ name: '', email: '', phone: '', address: '', contact_person: '' });
      setSearchTerm('');
    }
  };

  const handleSelectSupplier = (supplierId: string) => {
    onChange(supplierId);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    onChange(undefined);
    setSearchTerm('');
  };

  const selectedSupplier = suppliers.find(s => s.id === value);

  return (
    <div className="supplier-selector">
      {!isCreating ? (
        <div className="supplier-input">
          <input
            type="text"
            placeholder={placeholder}
            value={selectedSupplier ? selectedSupplier.name : searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchTerm('')}
            className="supplier-input-field"
          />
          <div className="supplier-actions">
            {selectedSupplier && (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleClearSelection}
                title="Clear selection"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setIsCreating(true)}
              title="Create new supplier"
            >
              +
            </button>
          </div>
        </div>
      ) : (
        <div className="supplier-create">
          <div className="form-group">
            <input
              type="text"
              placeholder="Supplier name *"
              value={newSupplier.name}
              onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
              className="supplier-input-field"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                className="supplier-input-field"
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                placeholder="Phone"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                className="supplier-input-field"
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Address"
              value={newSupplier.address}
              onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
              className="supplier-input-field"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Contact person"
              value={newSupplier.contact_person}
              onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_person: e.target.value }))}
              className="supplier-input-field"
            />
          </div>
          <div className="supplier-create-actions">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleCreateSupplier}
              disabled={!newSupplier.name.trim()}
            >
              Create
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setIsCreating(false);
                setNewSupplier({ name: '', email: '', phone: '', address: '', contact_person: '' });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dropdown for existing suppliers */}
      {!isCreating && searchTerm && filteredSuppliers.length > 0 && (
        <div className="supplier-dropdown">
          {filteredSuppliers.map(supplier => (
            <div
              key={supplier.id}
              className="supplier-option"
              onClick={() => handleSelectSupplier(supplier.id)}
            >
              <div className="supplier-name">{supplier.name}</div>
              {supplier.email && <div className="supplier-email">{supplier.email}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 