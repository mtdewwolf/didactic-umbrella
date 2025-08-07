'use client';

import { useState, useEffect } from 'react';
import { useStore, Order, InventoryItem } from '@/lib/store';

export default function OrdersPanel() {
  const { orders, suppliers, items, loadOrders, loadSuppliers, loadItems, addOrder, updateOrder, deleteOrder, addItemsToOrder, receiveOrder } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<Order | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrder, setNewOrder] = useState<{
    supplier_id: string;
    order_number: string;
    expected_delivery: string;
    notes: string;
  }>({
    supplier_id: '',
    order_number: '',
    expected_delivery: '',
    notes: ''
  });

  // State for adding items to order
  const [selectedItems, setSelectedItems] = useState<Array<{
    sku: string;
    name: string;
    qty: number;
    cost: number;
    category: string;
    location: string;
    reorder: number;
  }>>([]);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [showItemSelector, setShowItemSelector] = useState(false);

  useEffect(() => {
    loadOrders();
    loadSuppliers();
    loadItems();
  }, [loadOrders, loadSuppliers, loadItems]);

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.supplier_name && order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.supplier_id.trim()) return;

    try {
      const createdOrder = await addOrder({
        supplier_id: newOrder.supplier_id,
        order_number: newOrder.order_number || undefined,
        expected_delivery: newOrder.expected_delivery ? new Date(newOrder.expected_delivery) : undefined,
        notes: newOrder.notes || undefined,
        status: 'pending',
        order_date: new Date(),
        total_amount: calculateTotalAmount()
      });

      // Add items to the order if any are selected
      if (createdOrder && selectedItems.length > 0) {
        await addItemsToOrder(createdOrder.id, selectedItems);
      }

      setIsAddModalOpen(false);
      setNewOrder({ supplier_id: '', order_number: '', expected_delivery: '', notes: '' });
      setSelectedItems([]);
      setItemSearchTerm('');
    } catch (error) {
      console.error('Failed to add order:', error);
    }
  };

  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await updateOrder(editingOrder.id, {
        status: editingOrder.status,
        expected_delivery: editingOrder.expected_delivery,
        notes: editingOrder.notes,
        total_amount: editingOrder.total_amount
      });
      setEditingOrder(null);
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(id);
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  const handleReceiveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingOrder || !receiverName.trim()) return;

    try {
      await receiveOrder(receivingOrder.id, receiverName.trim());
      setReceivingOrder(null);
      setReceiverName('');
    } catch (error) {
      console.error('Failed to receive order:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "var(--warning)",
      confirmed: "var(--primary)",
      shipped: "var(--info)",
      delivered: "var(--ok)",
      received: "var(--ok)",
      cancelled: "var(--danger)"
    };
    return (
      <span className="badge" style={{ backgroundColor: colors[status as keyof typeof colors] }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  // Helper functions for item selection
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  const addItemToOrder = (item: InventoryItem) => {
    const existingItem = selectedItems.find(selected => selected.sku === item.sku);
    if (existingItem) {
      setSelectedItems(prev => prev.map(selected => 
        selected.sku === item.sku 
          ? { ...selected, qty: selected.qty + 1 }
          : selected
      ));
    } else {
      setSelectedItems(prev => [...prev, {
        sku: item.sku,
        name: item.name,
        qty: 1,
        cost: item.cost,
        category: item.category,
        location: item.location,
        reorder: item.reorder
      }]);
    }
  };

  const removeItemFromOrder = (sku: string) => {
    setSelectedItems(prev => prev.filter(item => item.sku !== sku));
  };

  const updateItemQuantity = (sku: string, qty: number) => {
    if (qty <= 0) {
      removeItemFromOrder(sku);
    } else {
      setSelectedItems(prev => prev.map(item => 
        item.sku === sku ? { ...item, qty } : item
      ));
    }
  };

  const calculateTotalAmount = () => {
    return selectedItems.reduce((total, item) => total + (item.cost * item.qty), 0);
  };

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Orders Management</div>
          <div className="panel-actions">
            <div className="search">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Order
            </button>
          </div>
        </div>
        <div className="panel-body">
          {orders.length === 0 ? (
            <div className="empty">
              <p>No orders yet.</p>
              <p>Start by creating your first purchase order.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Order Date</th>
                    <th>Expected Delivery</th>
                    <th>Total Amount</th>
                    <th>Received By</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.order_number}</strong>
                      </td>
                      <td>{order.supplier_name || 'Unknown Supplier'}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatDate(order.order_date)}</td>
                      <td>{order.expected_delivery ? formatDate(order.expected_delivery) : '-'}</td>
                      <td>${order.total_amount.toFixed(2)}</td>
                      <td>{order.received_by ? `${order.received_by} (${formatDate(order.received_at!)})` : '-'}</td>
                      <td>{order.notes || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          {order.status !== 'received' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => setReceivingOrder(order)}
                              title="Receive order"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setEditingOrder(order)}
                            title="Edit order"
                          >
                            ✎
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Delete order"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && orders.length > 0 && (
                <div className="empty">
                  <p>No orders match your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add Order Modal */}
      {isAddModalOpen && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Purchase Order</h2>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddOrder}>
              <div className="form-group">
                <label>Supplier *</label>
                <select
                  value={newOrder.supplier_id}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, supplier_id: e.target.value }))}
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Order Number (Optional)</label>
                <input
                  type="text"
                  value={newOrder.order_number}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, order_number: e.target.value }))}
                  placeholder="Leave empty for auto-generation"
                />
              </div>
              <div className="form-group">
                <label>Expected Delivery</label>
                <input
                  type="date"
                  value={newOrder.expected_delivery}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, expected_delivery: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes for this order..."
                />
              </div>

              {/* Items Section */}
              <div className="form-group">
                <label>Add Items to Order</label>
                <div className="item-selector">
                  <div className="search">
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Selected Items */}
                  {selectedItems.length > 0 && (
                    <div className="selected-items">
                      <h4>Selected Items ({selectedItems.length})</h4>
                      <div className="selected-items-list">
                        {selectedItems.map(item => (
                          <div key={item.sku} className="selected-item">
                            <div className="item-info">
                              <strong>{item.name}</strong>
                              <span className="sku">SKU: {item.sku}</span>
                              <span className="cost">${item.cost.toFixed(2)} each</span>
                            </div>
                            <div className="item-controls">
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateItemQuantity(item.sku, parseInt(e.target.value) || 1)}
                                className="qty-input"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeItemFromOrder(item.sku)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="total-amount">
                        <strong>Total Amount: ${calculateTotalAmount().toFixed(2)}</strong>
                      </div>
                    </div>
                  )}

                  {/* Available Items */}
                  <div className="available-items">
                    <h4>Available Items</h4>
                    <div className="items-grid">
                      {filteredItems
                        .filter(item => !selectedItems.find(selected => selected.sku === item.sku))
                        .slice(0, 10)
                        .map(item => (
                          <div key={item.sku} className="item-card">
                            <div className="item-details">
                              <strong>{item.name}</strong>
                              <span className="sku">SKU: {item.sku}</span>
                              <span className="category">{item.category}</span>
                              <span className="cost">${item.cost.toFixed(2)}</span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => addItemToOrder(item)}
                            >
                              Add
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Purchase Order</h2>
              <button className="btn-close" onClick={() => setEditingOrder(null)}>×</button>
            </div>
            <form onSubmit={handleEditOrder}>
              <div className="form-group">
                <label>Order Number</label>
                <input
                  type="text"
                  value={editingOrder.order_number}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  value={editingOrder.supplier_name || 'Unknown Supplier'}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expected Delivery</label>
                <input
                  type="date"
                  value={editingOrder.expected_delivery ? new Date(editingOrder.expected_delivery).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, expected_delivery: new Date(e.target.value) } : null)}
                />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingOrder.total_amount}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, total_amount: parseFloat(e.target.value) || 0 } : null)}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Order Modal */}
      {receivingOrder && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Receive Order</h2>
              <button className="btn-close" onClick={() => setReceivingOrder(null)}>×</button>
            </div>
            <form onSubmit={handleReceiveOrder}>
              <div className="form-group">
                <label>Order Number</label>
                <input
                  type="text"
                  value={receivingOrder.order_number}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  value={receivingOrder.supplier_name || 'Unknown Supplier'}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Receiver Name *</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmation</label>
                <div className="alert alert-info">
                  <p><strong>Warning:</strong> This action will:</p>
                  <ul>
                    <li>Mark the order as "Received"</li>
                    <li>Add all order items to inventory</li>
                    <li>Update stock quantities</li>
                    <li>Log the activity</li>
                  </ul>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setReceivingOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Receive Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 