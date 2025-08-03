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
  selected: string | null;
  filter: string;
  mode: 'table' | 'kanban';
  activity: ActivityLog[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setMode: (mode: 'table' | 'kanban') => void;
  setFilter: (filter: string) => void;
  setSelected: (sku: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Database operations
  loadItems: () => Promise<void>;
  loadActivity: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateItem: (sku: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (sku: string) => Promise<void>;
  adjustQuantity: (sku: string, delta: number) => Promise<void>;
  clearAll: () => Promise<void>;
  importCSV: (text: string) => Promise<void>;
  exportCSV: () => Promise<void>;
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
  selected: null,
  filter: "",
  mode: "table",
  activity: [],
  loading: false,
  error: null,
  
  setMode: (mode) => set({ mode }),
  setFilter: (filter) => set({ filter }),
  setSelected: (selected) => set({ selected }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
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
          cost: Number.isFinite(cost) ? +cost : 0
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
      const header = "sku,name,category,location,qty,reorder,cost";
      const rows = items.map(i => [i.sku, i.name, i.category, i.location, i.qty, i.reorder, i.cost].join(","));
      const csv = [header, ...rows].join("\n");
      downloadFile("inventory.csv", csv, "text/csv");
    } catch (error) {
      console.error('Failed to export CSV:', error);
      set({ error: 'Failed to export CSV' });
    }
  },
})); 