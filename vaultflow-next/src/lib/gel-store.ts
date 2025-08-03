import { create } from 'zustand';
import { gelClient, inventoryQueries, activityQueries, type InventoryItem, type ActivityLog } from './gel-client';

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

export const useGelStore = create<StoreState>((set, get) => ({
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
      const result = await gelClient.query(inventoryQueries.getAll());
      set({ items: result, loading: false });
    } catch (error) {
      console.error('Failed to load items:', error);
      set({ error: 'Failed to load inventory items', loading: false });
    }
  },
  
  loadActivity: async () => {
    try {
      const result = await gelClient.query(activityQueries.getAll());
      set({ activity: result });
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  },
  
  addItem: async (itemData) => {
    try {
      set({ loading: true, error: null });
      
      const now = new Date();
      const newItem = {
        ...itemData,
        id: nanoid(),
        created_at: now,
        updated_at: now,
      };
      
      // Insert into Gel database
      await gelClient.execute(`
        insert InventoryItem {
          id := <str>$id,
          sku := <str>$sku,
          name := <str>$name,
          category := <str>$category,
          location := <str>$location,
          qty := <int64>$qty,
          reorder := <int64>$reorder,
          cost := <float64>$cost,
          created_at := <datetime>$created_at,
          updated_at := <datetime>$updated_at
        }
      `, {
        id: newItem.id,
        sku: newItem.sku,
        name: newItem.name,
        category: newItem.category,
        location: newItem.location,
        qty: newItem.qty,
        reorder: newItem.reorder,
        cost: newItem.cost,
        created_at: newItem.created_at,
        updated_at: newItem.updated_at,
      });
      
      // Add activity log
      await gelClient.execute(`
        insert ActivityLog {
          type := 'add',
          sku := <str>$sku,
          at := <datetime>$at
        }
      `, {
        sku: newItem.sku,
        at: now,
      });
      
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
      
      const now = new Date();
      await gelClient.execute(`
        update InventoryItem
        filter .sku = <str>$sku
        set {
          name := <str>$name,
          category := <str>$category,
          location := <str>$location,
          qty := <int64>$qty,
          reorder := <int64>$reorder,
          cost := <float64>$cost,
          updated_at := <datetime>$updated_at
        }
      `, {
        sku,
        name: updates.name,
        category: updates.category,
        location: updates.location,
        qty: updates.qty,
        reorder: updates.reorder,
        cost: updates.cost,
        updated_at: now,
      });
      
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
      
      await gelClient.execute(`
        delete InventoryItem
        filter .sku = <str>$sku
      `, { sku });
      
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
      
      const now = new Date();
      await gelClient.execute(`
        update InventoryItem
        filter .sku = <str>$sku
        set {
          qty := .qty + <int64>$delta,
          updated_at := <datetime>$updated_at
        }
      `, {
        sku,
        delta,
        updated_at: now,
      });
      
      // Add activity log
      await gelClient.execute(`
        insert ActivityLog {
          type := 'adjust',
          sku := <str>$sku,
          delta := <int64>$delta,
          at := <datetime>$at
        }
      `, {
        sku,
        delta,
        at: now,
      });
      
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
      
      await gelClient.execute(`delete InventoryItem`);
      
      // Add activity log
      await gelClient.execute(`
        insert ActivityLog {
          type := 'clear',
          at := <datetime>$at
        }
      `, {
        at: new Date(),
      });
      
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