export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  location: string;
  qty: number;
  reorder: number;
  cost: number;
}

export interface ActivityLog {
  type: 'add' | 'adjust' | 'import' | 'clear';
  sku?: string;
  delta?: number;
  count?: number;
  at: Date;
}

export interface InventoryStore {
  items: InventoryItem[];
  selected: string | null;
  filter: string;
  mode: 'table' | 'kanban';
  activity: ActivityLog[];
  
  // Actions
  setMode: (mode: 'table' | 'kanban') => void;
  setFilter: (filter: string) => void;
  addItem: (item: InventoryItem) => void;
  clear: () => void;
  select: (sku: string) => void;
  adjust: (sku: string, delta: number) => void;
  importCSV: (text: string) => void;
  exportCSV: () => void;
}

export type ItemStatus = 'ok' | 'low' | 'oos';

export interface Warehouse {
  code: string;
  name: string;
}

export interface FilterChip {
  id: string;
  label: string;
  filter: string;
} 