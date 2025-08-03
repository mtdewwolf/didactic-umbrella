# GoldMine Distro — Inventory Management

A modern inventory management system built with Next.js and SQLite database.

## Features

- 📦 **Inventory Management**: Add, edit, and track inventory items
- 🔍 **Search & Filter**: Find items by SKU, name, category, or location
- 📊 **Real-time Stats**: View total SKUs, units, low stock items, and inventory value
- 📋 **Table & Kanban Views**: Switch between table and kanban board views
- 📥 **CSV Import/Export**: Bulk import and export inventory data
- ⚡ **Quick Adjust**: Rapidly adjust stock quantities
- 🎨 **Modern UI**: Dark theme with beautiful gradients and animations
- 💾 **Persistent Storage**: SQLite database for reliable data persistence

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Database**: SQLite with better-sqlite3
- **State Management**: Zustand
- **Styling**: Custom CSS with modern design system

## Getting Started

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **npm** or **yarn**

### Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd vaultflow-next
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses SQLite with the following schema:

```sql
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  reorder INTEGER NOT NULL DEFAULT 10,
  cost REAL NOT NULL DEFAULT 0.0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  sku TEXT,
  delta INTEGER,
  count INTEGER,
  at DATETIME NOT NULL
);
```

## Usage

### Adding Items
1. Click the "+ New Item" button
2. Fill in the item details (SKU, name, category, location, quantity, reorder point, cost)
3. Click "Save Item"

### Importing CSV
1. Prepare a CSV file with headers: `sku,name,category,location,qty,reorder,cost`
2. Click "Import CSV" and select your file
3. Items will be imported automatically

### Quick Adjust
1. Select an item from the inventory table
2. Click the "Quick Adjust" floating button
3. The system will randomly adjust the quantity

### Filtering
- Use the search bar to find items by SKU, name, category, or location
- Click sidebar filters for "Low Stock", "Out of Stock", etc.
- Use warehouse filters to view items by location

## Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   ```bash
   npx vercel
   ```

2. **Deploy**:
   ```bash
   npx vercel --prod
   ```

### Database File

The SQLite database file (`goldmine_distro.db`) will be created automatically in the project root when you first run the application. This file contains all your inventory data and should be backed up regularly.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: Create an issue in this repository
- **Documentation**: Check the code comments for detailed implementation details
