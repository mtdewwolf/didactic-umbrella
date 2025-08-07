'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

interface WholesaleCustomer {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  address: string;
  discount: number;
  customPricing: Record<string, number>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface CustomerPricing {
  customer_id: string;
  sku: string;
  custom_price: number;
}

export default function WholesaleSettingsPanel() {
  const { items, loadItems } = useStore();
  const [customers, setCustomers] = useState<WholesaleCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<WholesaleCustomer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'pricing' | 'settings'>('customers');

  const [newCustomer, setNewCustomer] = useState({
    email: '',
    name: '',
    company: '',
    phone: '',
    address: '',
    discount: 0,
    status: 'active' as const,
  });

  const [pricingData, setPricingData] = useState({
    customer_id: '',
    sku: '',
    custom_price: 0,
  });

  useEffect(() => {
    loadItems();
    loadCustomers();
  }, [loadItems]);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/wholesale/customers');
      const data = await response.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/wholesale/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      
      if (response.ok) {
        setShowAddCustomer(false);
        setNewCustomer({
          email: '',
          name: '',
          company: '',
          phone: '',
          address: '',
          discount: 0,
          status: 'active',
        });
        loadCustomers();
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  const handleUpdateCustomer = async (customerId: string, updates: Partial<WholesaleCustomer>) => {
    try {
      const response = await fetch(`/api/wholesale/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        loadCustomers();
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleAddPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/wholesale/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingData),
      });
      
      if (response.ok) {
        setShowPricingModal(false);
        setPricingData({ customer_id: '', sku: '', custom_price: 0 });
        loadCustomers();
      }
    } catch (error) {
      console.error('Failed to add pricing:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="wholesale-settings">
      <div className="settings-header">
        <h1>Wholesale Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddCustomer(true)}
          >
            Add Customer
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button
          className={`tab ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing Rules
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'customers' && (
        <div className="customers-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="customers-grid">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="customer-card">
                <div className="customer-header">
                  <h3>{customer.name}</h3>
                  <span className={`status-badge ${customer.status}`}>
                    {customer.status}
                  </span>
                </div>
                <div className="customer-details">
                  <p><strong>Company:</strong> {customer.company}</p>
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  <p><strong>Discount:</strong> {customer.discount}%</p>
                  <p><strong>Custom Prices:</strong> {Object.keys(customer.customPricing || {}).length} items</p>
                </div>
                <div className="customer-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setPricingData({ ...pricingData, customer_id: customer.id });
                      setShowPricingModal(true);
                    }}
                  >
                    Manage Pricing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="pricing-section">
          <div className="pricing-header">
            <h2>Pricing Rules</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowPricingModal(true)}
            >
              Add Pricing Rule
            </button>
          </div>
          
          <div className="pricing-rules">
            {/* Pricing rules table would go here */}
            <p>Pricing rules management coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="settings-section">
          <h2>Wholesale Settings</h2>
          <div className="settings-grid">
            <div className="setting-card">
              <h3>Default Discount</h3>
              <p>Set the default discount percentage for new wholesale customers</p>
              <input type="number" min="0" max="100" defaultValue="10" />
            </div>
            <div className="setting-card">
              <h3>Minimum Order Amount</h3>
              <p>Set minimum order amount for wholesale customers</p>
              <input type="number" min="0" defaultValue="100" />
            </div>
            <div className="setting-card">
              <h3>Auto-approval Threshold</h3>
              <p>Orders below this amount are auto-approved</p>
              <input type="number" min="0" defaultValue="500" />
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Wholesale Customer</h2>
              <button className="btn-close" onClick={() => setShowAddCustomer(false)}>×</button>
            </div>
            <form onSubmit={handleAddCustomer}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Default Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCustomer.discount}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCustomer(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Customer: {selectedCustomer.name}</h2>
              <button className="btn-close" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateCustomer(selectedCustomer.id, selectedCustomer);
            }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, email: e.target.value } : null)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={selectedCustomer.company}
                    onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, company: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={selectedCustomer.phone}
                    onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={selectedCustomer.address}
                  onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, address: e.target.value } : null)}
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedCustomer.discount}
                    onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, discount: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={selectedCustomer.status}
                    onChange={(e) => setSelectedCustomer(prev => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' } : null)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pricing Modal */}
      {showPricingModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Custom Pricing</h2>
              <button className="btn-close" onClick={() => setShowPricingModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddPricing}>
              <div className="form-group">
                <label>Customer</label>
                <select
                  value={pricingData.customer_id}
                  onChange={(e) => setPricingData(prev => ({ ...prev, customer_id: e.target.value }))}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.company}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Item (SKU)</label>
                <select
                  value={pricingData.sku}
                  onChange={(e) => setPricingData(prev => ({ ...prev, sku: e.target.value }))}
                  required
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} - {item.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Custom Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricingData.custom_price}
                  onChange={(e) => setPricingData(prev => ({ ...prev, custom_price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPricingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Pricing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 