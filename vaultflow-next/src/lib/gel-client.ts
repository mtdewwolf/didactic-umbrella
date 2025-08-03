import { createClient } from 'gel';

// Create Gel client for local development
export const gelClient = createClient({
  host: 'localhost',
  port: 5656,
  database: 'goldmine_distro',
  user: 'gel',
  password: '',
});

// For production, you would use environment variables:
// export const gelClient = createClient({
//   host: process.env.GEL_HOST || 'localhost',
//   port: parseInt(process.env.GEL_PORT || '5656'),
//   database: process.env.GEL_DATABASE || 'goldmine_distro',
//   user: process.env.GEL_USER || 'gel',
//   password: process.env.GEL_PASSWORD || '',
// });

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

// Query functions for inventory items
export const inventoryQueries = {
  // Get all inventory items
  getAll: () => `
    select InventoryItem {
      id,
      sku,
      name,
      category,
      location,
      qty,
      reorder,
      cost,
      created_at,
      updated_at
    }
    order by .created_at desc
  `,

  // Get inventory item by SKU
  getBySku: (sku: string) => `
    select InventoryItem {
      id,
      sku,
      name,
      category,
      location,
      qty,
      reorder,
      cost,
      created_at,
      updated_at
    }
    filter .sku = <str>$sku
  `,

  // Search inventory items
  search: (query: string) => `
    select InventoryItem {
      id,
      sku,
      name,
      category,
      location,
      qty,
      reorder,
      cost,
      created_at,
      updated_at
    }
    filter .sku ilike '%' ++ <str>$query ++ '%'
      or .name ilike '%' ++ <str>$query ++ '%'
      or .category ilike '%' ++ <str>$query ++ '%'
      or .location ilike '%' ++ <str>$query ++ '%'
    order by .created_at desc
  `,

  // Get low stock items
  getLowStock: () => `
    select InventoryItem {
      id,
      sku,
      name,
      category,
      location,
      qty,
      reorder,
      cost,
      created_at,
      updated_at
    }
    filter .qty <= .reorder
    order by .qty asc
  `,

  // Get out of stock items
  getOutOfStock: () => `
    select InventoryItem {
      id,
      sku,
      name,
      category,
      location,
      qty,
      reorder,
      cost,
      created_at,
      updated_at
    }
    filter .qty = 0
    order by .created_at desc
  `,
};

// Query functions for activity logs
export const activityQueries = {
  // Get all activity logs
  getAll: () => `
    select ActivityLog {
      id,
      type,
      sku,
      delta,
      count,
      at
    }
    order by .at desc
    limit 50
  `,

  // Get activity logs by type
  getByType: (type: string) => `
    select ActivityLog {
      id,
      type,
      sku,
      delta,
      count,
      at
    }
    filter .type = <str>$type
    order by .at desc
  `,
}; 