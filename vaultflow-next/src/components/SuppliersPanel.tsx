'use client';

import { useState, useEffect } from 'react';
import { useStore, Supplier } from '@/lib/store';

export default function SuppliersPanel() {
  const { suppliers, loadSuppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
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
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;

    try {
      await addSupplier(newSupplier);
      setIsAddModalOpen(false);
      setNewSupplier({ name: '', email: '', phone: '', address: '', contact_person: '' });
    } catch (error) {
      console.error('Failed to add supplier:', error);
    }
  };

  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    try {
      await updateSupplier(editingSupplier.id, {
        name: editingSupplier.name,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        address: editingSupplier.address,
        contact_person: editingSupplier.contact_person
      });
      setEditingSupplier(null);
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      try {
        await deleteSupplier(id);
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Suppliers Management</div>
          <div className="panel-actions">
            <div className="search">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Supplier
            </button>
          </div>
        </div>
        <div className="panel-body">
          {suppliers.length === 0 ? (
            <div className="empty">
              <p>No suppliers yet.</p>
              <p>Start by adding your first supplier.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td>
                        <strong>{supplier.name}</strong>
                      </td>
                      <td>{supplier.contact_person || '-'}</td>
                      <td>
                        {supplier.email ? (
                          <a href={`mailto:${supplier.email}`} className="link">
                            {supplier.email}
                          </a>
                        ) : '-'}
                      </td>
                      <td>
                        {supplier.phone ? (
                          <a href={`tel:${supplier.phone}`} className="link">
                            {supplier.phone}
                          </a>
                        ) : '-'}
                      </td>
                      <td>{supplier.address || '-'}</td>
                      <td>{formatDate(supplier.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setEditingSupplier(supplier)}
                            title="Edit supplier"
                          >
                            ✎
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            title="Delete supplier"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSuppliers.length === 0 && suppliers.length > 0 && (
                <div className="empty">
                  <p>No suppliers match your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Supplier</h2>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddSupplier}>
              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={newSupplier.contact_person}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Supplier</h2>
              <button className="btn-close" onClick={() => setEditingSupplier(null)}>×</button>
            </div>
            <form onSubmit={handleEditSupplier}>
              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingSupplier.email || ''}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editingSupplier.phone || ''}
                    onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={editingSupplier.address || ''}
                  onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, address: e.target.value } : null)}
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={editingSupplier.contact_person || ''}
                  onChange={(e) => setEditingSupplier(prev => prev ? { ...prev, contact_person: e.target.value } : null)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSupplier(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 