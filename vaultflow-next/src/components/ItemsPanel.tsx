'use client';

import { useState, useEffect } from 'react';
import { useStore, InventoryItem } from '@/lib/store';

export default function ItemsPanel() {
  const { items, loadItems, addItem, updateItem, deleteItem, uploadImage } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    category: '',
    location: '',
    cost: 0,
    reorder: 10,
    image_url: ''
  });

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.sku.trim() || !newItem.name.trim()) return;

    try {
      await addItem({
        sku: newItem.sku,
        name: newItem.name,
        category: newItem.category || 'Uncategorized',
        location: newItem.location || 'Unknown',
        qty: 0, // Items start with 0 quantity in catalog
        reorder: newItem.reorder,
        cost: newItem.cost,
        image_url: newItem.image_url || undefined
      });
      setIsAddModalOpen(false);
      setNewItem({ sku: '', name: '', category: '', location: '', cost: 0, reorder: 10, image_url: '' });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateItem(editingItem.sku, {
        name: editingItem.name,
        category: editingItem.category,
        location: editingItem.location,
        cost: editingItem.cost,
        reorder: editingItem.reorder,
        image_url: editingItem.image_url
      });
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (sku: string) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteItem(sku);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const generateSKU = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let sku = '';
    for (let i = 0; i < 8; i++) {
      sku += chars[Math.floor(Math.random() * chars.length)];
    }
    setNewItem(prev => ({ ...prev, sku }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setNewItem(prev => ({ ...prev, image_url: imageUrl }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setEditingItem(prev => prev ? { ...prev, image_url: imageUrl } : null);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Items Catalog</div>
          <div className="panel-actions">
            <div className="search">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Item
            </button>
          </div>
        </div>
        <div className="panel-body">
          {items.length === 0 ? (
            <div className="empty">
              <p>No items in catalog yet.</p>
              <p>Start by adding your first item to the catalog.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                                 <thead>
                   <tr>
                     <th>Image</th>
                     <th>SKU</th>
                     <th>Name</th>
                     <th>Category</th>
                     <th>Location</th>
                     <th>Cost</th>
                     <th>Reorder Level</th>
                     <th>Current Stock</th>
                     <th>Actions</th>
                   </tr>
                 </thead>
                                 <tbody>
                   {filteredItems.map(item => (
                     <tr key={item.sku}>
                       <td>
                         {item.image_url ? (
                           <img 
                             src={item.image_url} 
                             alt={item.name}
                             className="item-image"
                             onError={(e) => {
                               e.currentTarget.style.display = 'none';
                             }}
                           />
                         ) : (
                           <div className="no-image">No Image</div>
                         )}
                       </td>
                       <td>
                         <strong>{item.sku}</strong>
                       </td>
                       <td>{item.name}</td>
                       <td>{item.category}</td>
                       <td>{item.location}</td>
                       <td>${item.cost.toFixed(2)}</td>
                       <td>{item.reorder}</td>
                       <td>
                         <span className={`stock-level ${item.qty === 0 ? 'oos' : item.qty <= item.reorder ? 'low' : 'ok'}`}>
                           {item.qty}
                         </span>
                       </td>
                       <td>
                         <div className="action-buttons">
                           <button
                             className="btn btn-sm btn-primary"
                             onClick={() => setEditingItem(item)}
                             title="Edit item"
                           >
                             ✎
                           </button>
                           <button
                             className="btn btn-sm btn-danger"
                             onClick={() => handleDeleteItem(item.sku)}
                             title="Delete item"
                           >
                             🗑
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
              {filteredItems.length === 0 && items.length > 0 && (
                <div className="empty">
                  <p>No items match your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Item to Catalog</h2>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>SKU *</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Enter SKU or generate one"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={generateSKU}
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Item name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Electronics, Clothing, Food"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., A-01, B-02"
                />
              </div>
              <div className="form-group">
                <label>Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.cost}
                  onChange={(e) => setNewItem(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  placeholder="0.00"
                />
              </div>
                             <div className="form-group">
                 <label>Reorder Level</label>
                 <input
                   type="number"
                   value={newItem.reorder}
                   onChange={(e) => setNewItem(prev => ({ ...prev, reorder: parseInt(e.target.value) || 0 }))}
                   min="0"
                   placeholder="10"
                 />
               </div>
               <div className="form-group">
                 <label>Item Image</label>
                 <div className="image-upload-container">
                   {newItem.image_url ? (
                     <div className="image-preview">
                       <img src={newItem.image_url} alt="Preview" />
                       <button
                         type="button"
                         className="btn btn-sm btn-danger"
                         onClick={() => setNewItem(prev => ({ ...prev, image_url: '' }))}
                       >
                         Remove
                       </button>
                     </div>
                   ) : (
                     <div className="image-upload">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleImageUpload}
                         id="image-upload"
                         style={{ display: 'none' }}
                       />
                       <label htmlFor="image-upload" className="btn btn-secondary">
                         Upload Image
                       </label>
                     </div>
                   )}
                 </div>
               </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Item</h2>
              <button className="btn-close" onClick={() => setEditingItem(null)}>×</button>
            </div>
            <form onSubmit={handleEditItem}>
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  value={editingItem.sku}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editingItem.location}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, location: e.target.value } : null)}
                />
              </div>
              <div className="form-group">
                <label>Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem.cost}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, cost: parseFloat(e.target.value) || 0 } : null)}
                  min="0"
                />
              </div>
                             <div className="form-group">
                 <label>Reorder Level</label>
                 <input
                   type="number"
                   value={editingItem.reorder}
                   onChange={(e) => setEditingItem(prev => prev ? { ...prev, reorder: parseInt(e.target.value) || 0 } : null)}
                   min="0"
                 />
               </div>
               <div className="form-group">
                 <label>Item Image</label>
                 <div className="image-upload-container">
                   {editingItem.image_url ? (
                     <div className="image-preview">
                       <img src={editingItem.image_url} alt="Preview" />
                       <button
                         type="button"
                         className="btn btn-sm btn-danger"
                         onClick={() => setEditingItem(prev => prev ? { ...prev, image_url: '' } : null)}
                       >
                         Remove
                       </button>
                     </div>
                   ) : (
                     <div className="image-upload">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleEditImageUpload}
                         id="edit-image-upload"
                         style={{ display: 'none' }}
                       />
                       <label htmlFor="edit-image-upload" className="btn btn-secondary">
                         Upload Image
                       </label>
                     </div>
                   )}
                 </div>
               </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 