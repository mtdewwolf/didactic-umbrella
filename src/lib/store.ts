import { create } from 'zustand';
import { InventoryStore, InventoryItem, ActivityLog } from '@/types/inventory';

// Utility functions
const nanoid = (size = 8): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const downloadFile = (name: string, content: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

const currency = (n: number): string => {
  return '$' + n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const statusOf = (item: InventoryItem): 'ok' | 'low' | 'oos' => {
  if (item.qty === 0) return 'oos';
  if (item.qty <= item.reorder) return 'low';
  return 'ok';
};

// Seed data generation
const seedItems = (): InventoryItem[] => {
  const cats = [
    'Beverages',
    'Produce',
    'Electronics',
    'Hardware',
    'Pharma',
    'Textiles',
    'Automotive',
    'Home',
  ];
  const locs = [
    'A-01',
    'A-02',
    'B-10',
    'B-22',
    'C-05',
    'D-11',
    'E-03',
    'F-18',
    'G-07',
    'H-04',
  ];

  const sampleName = (): string => {
    const adj = [
      'Fresh',
      'Premium',
      'Ultra',
      'Eco',
      'Smart',
      'Rapid',
      'Nano',
      'Fusion',
      'Crystal',
      'Quantum',
      'Aero',
      'Polar',
    ];
    const noun = [
      'Mixer',
      'Valve',
      'Sensor',
      'Pack',
      'Bottle',
      'Kit',
      'Module',
      'Panel',
      'Glove',
      'Lens',
      'Drive',
      'Clamp',
    ];
    return (
      adj[Math.floor(Math.random() * adj.length)] +
      ' ' +
      noun[Math.floor(Math.random() * noun.length)]
    );
  };

  const items: InventoryItem[] = [];
  for (let i = 0; i < 24; i++) {
    const qty = Math.floor(Math.random() * 160);
    const reorder = [10, 20, 30, 40][Math.floor(Math.random() * 4)];
    items.push({
      sku: nanoid(),
      name: sampleName(),
      category: cats[Math.floor(Math.random() * cats.length)],
      location: locs[Math.floor(Math.random() * locs.length)],
      qty,
      reorder,
      cost: +(Math.random() * 150 + 2).toFixed(2),
    });
  }
  return items;
};

// Zustand store
export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: seedItems(),
  selected: null,
  filter: '',
  mode: 'table',
  activity: [],

  setMode: (mode) => set({ mode }),
  setFilter: (filter) => set({ filter }),
  
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      activity: [
        { type: 'add', sku: item.sku, at: new Date() },
        ...state.activity,
      ],
    })),

  clear: () =>
    set((state) => ({
      items: [],
      selected: null,
      activity: [{ type: 'clear', at: new Date() }, ...state.activity],
    })),

  select: (sku) => set({ selected: sku }),

  adjust: (sku, delta) =>
    set((state) => {
      const items = state.items.map((it) =>
        it.sku === sku ? { ...it, qty: Math.max(0, it.qty + delta) } : it
      );
      return {
        items,
        activity: [
          { type: 'adjust', sku, delta, at: new Date() },
          ...state.activity,
        ],
      };
    }),

  importCSV: (text) => {
    const rows = text.trim().split(/\r?\n/);
    const header = rows.shift()?.split(',') || [];
    const items = rows
      .filter(Boolean)
      .map((r) => {
        const vals = r.split(',');
        const map = Object.fromEntries(
          header.map((h, i) => [h.trim(), (vals[i] ?? '').trim()])
        );
        const cost = parseFloat(map.cost || '0');
        return {
          sku: map.sku || nanoid(),
          name: map.name || 'Unnamed',
          category: map.category || 'General',
          location: map.location || 'A-01',
          qty: Number.isFinite(+map.qty) ? +map.qty : 0,
          reorder: Number.isFinite(+map.reorder) ? +map.reorder : 10,
          cost: Number.isFinite(cost) ? +cost : 0,
        };
      });

    set((state) => ({
      items: [...state.items, ...items],
      activity: [
        { type: 'import', count: items.length, at: new Date() },
        ...state.activity,
      ],
    }));
  },

  exportCSV: () => {
    const { items } = get();
    const header = 'sku,name,category,location,qty,reorder,cost';
    const rows = items.map((i) =>
      [i.sku, i.name, i.category, i.location, i.qty, i.reorder, i.cost].join(',')
    );
    const csv = [header, ...rows].join('\n');
    downloadFile('inventory.csv', csv, 'text/csv');
  },
}));

// Export utility functions for use in components
export { currency, statusOf, nanoid }; 