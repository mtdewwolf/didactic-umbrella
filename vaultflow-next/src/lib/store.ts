import { create } from 'zustand';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  location: string;
  qty: number;
  reorder: number;
  cost: number;
  supplier_id?: string;
  supplier_name?: string;
  order_id?: string;
  order_number?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'received';
  order_date: Date;
  expected_delivery?: Date;
  notes?: string;
  total_amount: number;
  received_by?: string;
  received_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id: string;
  type: 'add' | 'adjust' | 'import' | 'clear';
  sku?: string;
  delta?: number;
  count?: number;
  at: Date;
}

interface StoreState {
  items: InventoryItem[];
  suppliers: Supplier[];
  orders: Order[];
  selected: string | null;
  filter: string;
  mode: 'table' | 'kanban';
  activity: ActivityLog[];
  loading: boolean;
  error: string | null;
  currentView: 'dashboard' | 'inventory' | 'orders' | 'suppliers' | 'locations' | 'items' | 'wholesale';
  
  // Actions
  setMode: (mode: 'table' | 'kanban') => void;
  setFilter: (filter: string) => void;
  setSelected: (sku: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentView: (view: 'dashboard' | 'inventory' | 'orders' | 'suppliers' | 'locations' | 'items' | 'wholesale') => void;
  
  // Database operations
  loadItems: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadActivity: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'supplier_name' | 'order_number'>) => Promise<void>;
  updateItem: (sku: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (sku: string) => Promise<void>;
  adjustQuantity: (sku: string, delta: number) => Promise<void>;
  clearAll: () => Promise<void>;
  importCSV: (text: string) => Promise<void>;
  exportCSV: () => Promise<void>;
  
  // Supplier operations
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<Supplier | null>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Order operations
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'supplier_name'> & { order_number?: string }) => Promise<Order | null>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addItemsToOrder: (order_id: string, items: Array<{ sku: string; name: string; qty: number; cost: number; category?: string; location?: string; reorder?: number }>) => Promise<void>;
  receiveOrder: (order_id: string, received_by: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string | null>;
}

// Utils
function nanoid(size = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < size; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function currency(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function statusOf(item: InventoryItem) {
  if (item.qty === 0) return "oos";
  if (item.qty <= item.reorder) return "low";
  return "ok";
}

export const useStore = create<StoreState>((set, get) => ({
  items: [],
  suppliers: [],
  orders: [],
  selected: null,
  filter: "",
  mode: "table",
  activity: [],
  loading: false,
  error: null,
  currentView: 'dashboard',
  
  setMode: (mode) => set({ mode }),
  setFilter: (filter) => set({ filter }),
  setSelected: (selected) => set({ selected }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentView: (currentView) => set({ currentView }),
  
  loadItems: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load items');
      }
      
      set({ items: data.items, loading: false });
    } catch (error) {
      console.error('Failed to load items:', error);
      set({ error: 'Failed to load inventory items', loading: false });
    }
  },
  
  loadSuppliers: async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load suppliers');
      }
      
      set({ suppliers: data.suppliers });
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  },
  
  loadOrders: async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load orders');
      }
      
      set({ orders: data.orders });
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  },
  
  loadActivity: async () => {
    try {
      const response = await fetch('/api/activity');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load activity');
      }
      
      set({ activity: data.activity });
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  },
  
  addItem: async (itemData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item');
      }
      
      // Reload items
      await get().loadItems();
      await get().loadActivity();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to add item:', error);
      set({ error: 'Failed to add item', loading: false });
    }
  },
  
  updateItem: async (sku, updates) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sku, updates }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }
      
      await get().loadItems();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update item:', error);
      set({ error: 'Failed to update item', loading: false });
    }
  },
  
  deleteItem: async (sku) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/inventory?sku=${encodeURIComponent(sku)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete item');
      }
      
      await get().loadItems();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to delete item:', error);
      set({ error: 'Failed to delete item', loading: false });
    }
  },
  
  adjustQuantity: async (sku, delta) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sku, delta }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust quantity');
      }
      
      await get().loadItems();
      await get().loadActivity();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to adjust quantity:', error);
      set({ error: 'Failed to adjust quantity', loading: false });
    }
  },
  
  clearAll: async () => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch('/api/inventory/clear', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear inventory');
      }
      
      await get().loadItems();
      await get().loadActivity();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to clear all:', error);
      set({ error: 'Failed to clear inventory', loading: false });
    }
  },
  
  importCSV: async (text) => {
    try {
      set({ loading: true, error: null });
      
      const rows = text.trim().split(/\r?\n/);
      const header = rows.shift()?.split(",") || [];
      const items = rows.filter(Boolean).map(r => {
        const vals = r.split(",");
        const map = Object.fromEntries(header.map((h, i) => [h.trim(), (vals[i] ?? "").trim()]));
        const cost = parseFloat(map.cost || "0");
        return {
          sku: map.sku || nanoid(),
          name: map.name || "Unnamed",
          category: map.category || "General",
          location: map.location || "A-01",
          qty: Number.isFinite(+map.qty) ? +map.qty : 0,
          reorder: Number.isFinite(+map.reorder) ? +map.reorder : 10,
          cost: Number.isFinite(cost) ? +cost : 0,
          supplier_id: map.supplier_id || undefined
        };
      });
      
      // Insert all items
      for (const item of items) {
        await get().addItem(item);
      }
      
      // Add activity log for import
      await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'import',
          count: items.length,
        }),
      });
      
      await get().loadActivity();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to import CSV:', error);
      set({ error: 'Failed to import CSV', loading: false });
    }
  },
  
  exportCSV: async () => {
    try {
      const { items } = get();
      const header = "sku,name,category,location,qty,reorder,cost,supplier_id";
      const rows = items.map(i => [i.sku, i.name, i.category, i.location, i.qty, i.reorder, i.cost, i.supplier_id || ''].join(","));
      const csv = [header, ...rows].join("\n");
      downloadFile("inventory.csv", csv, "text/csv");
    } catch (error) {
      console.error('Failed to export CSV:', error);
      set({ error: 'Failed to export CSV' });
    }
  },
  
  addSupplier: async (supplierData) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // Supplier already exists, return the existing supplier
          return data.supplier;
        }
        throw new Error(data.error || 'Failed to add supplier');
      }
      
      await get().loadSuppliers();
      return data.supplier;
    } catch (error) {
      console.error('Failed to add supplier:', error);
      return null;
    }
  },
  
  updateSupplier: async (id, updates) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, updates }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update supplier');
      }
      
      await get().loadSuppliers();
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  },
  
  deleteSupplier: async (id) => {
    try {
      const response = await fetch(`/api/suppliers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete supplier');
      }
      
      await get().loadSuppliers();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    }
  },
  
  addOrder: async (orderData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add order');
      }
      
      await get().loadOrders();
      await get().loadActivity();
      set({ loading: false });
      return data.order;
    } catch (error) {
      console.error('Failed to add order:', error);
      set({ error: 'Failed to add order', loading: false });
      return null;
    }
  },
  
  updateOrder: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, updates }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }
      
      await get().loadOrders();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update order:', error);
      set({ error: 'Failed to update order', loading: false });
    }
  },
  
  deleteOrder: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete order');
      }
      
      await get().loadOrders();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to delete order:', error);
      set({ error: 'Failed to delete order', loading: false });
    }
  },
  
  addItemsToOrder: async (order_id, items) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch('/api/orders/add-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id, items }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add items to order');
      }
      
      await get().loadItems();
      await get().loadOrders();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to add items to order:', error);
      set({ error: 'Failed to add items to order', loading: false });
    }
  },
  
  receiveOrder: async (order_id, received_by) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch('/api/orders/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id, received_by }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to receive order');
      }
      
      await get().loadOrders();
      await get().loadItems();
      await get().loadActivity();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to receive order:', error);
      set({ error: 'Failed to receive order', loading: false });
    }
  },
  
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }
      
      return data.imageUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      set({ error: 'Failed to upload image' });
      return null;
    }
  },
})); 