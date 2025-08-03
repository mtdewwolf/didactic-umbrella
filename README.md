# VaultFlow — Inventory Management System

A modern, responsive inventory management application built with vanilla JavaScript and Zustand for state management. Features a beautiful dark theme with glassmorphism effects and real-time inventory tracking.

## 🚀 Features

- **Modern Dark UI** - Beautiful glassmorphism design with gradients and animations
- **Real-time Inventory Management** - Add, edit, and track inventory items
- **Dual View Modes** - Table and Kanban board views
- **CSV Import/Export** - Bulk import and export inventory data
- **Barcode Scanning Simulation** - Simulated barcode scanning interface
- **Drag & Drop** - Move items between status columns
- **Search & Filtering** - Filter by SKU, name, location, status, and warehouse
- **Activity Logging** - Track all inventory changes
- **Responsive Design** - Works on desktop and mobile devices
- **Keyboard Shortcuts** - Quick search with Cmd/Ctrl+K

## 🎯 Key Features

### Inventory Management
- Add new items with SKU generation
- Track quantities, reorder points, and unit costs
- Monitor stock levels with visual status indicators
- Bulk operations via CSV import/export

### Dashboard Analytics
- Total SKUs and units count
- Low stock item tracking
- Inventory value calculation
- Real-time statistics

### Interactive Views
- **Table View**: Traditional spreadsheet-style layout
- **Kanban View**: Drag-and-drop status management
- **Detail Panel**: Visual item previews with procedural rendering

### Advanced Features
- Warehouse filtering (North A, Central B, South C)
- Quick filters (Low Stock, Out of Stock, Perishable, Overstock)
- Activity timeline with timestamps
- Toast notifications for user feedback

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **State Management**: Zustand
- **Styling**: CSS3 with CSS Grid and Flexbox
- **Graphics**: HTML5 Canvas for procedural rendering
- **Icons**: CSS-generated icons and gradients

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/mtdewwolf/didactic-umbrella.git
cd didactic-umbrella
```

2. Open `index.html` in your web browser

No build process required - this is a pure client-side application!

## 🎮 Usage

### Getting Started
1. Open the application in your browser
2. Click "+ New Item" to add your first inventory item
3. Use "Import CSV" to bulk import existing inventory
4. Switch between Table and Kanban views as needed

### Adding Items
- **Manual Entry**: Fill out the form with item details
- **Barcode Scanning**: Switch to barcode mode for simulated scanning
- **Auto-Generate SKU**: Use the "Generate SKU" button for unique identifiers

### Managing Inventory
- **Quick Adjust**: Use the floating action button for demo adjustments
- **Drag & Drop**: Move items between status columns in Kanban view
- **Search**: Use Cmd/Ctrl+K or the search bar to find items
- **Filter**: Click filter chips to view specific item categories

### Data Management
- **Export CSV**: Download your inventory as a CSV file
- **Import CSV**: Upload existing inventory data
- **Clear All**: Reset the inventory (demo data will be restored)

## 📊 CSV Format

The application expects CSV files with the following columns:
```csv
sku,name,category,location,qty,reorder,cost
ABC123,Sample Item,Electronics,A-01,50,10,25.99
```

## 🎨 Design Features

### Visual Elements
- **Glassmorphism Effects**: Translucent panels with backdrop blur
- **Procedural Graphics**: Canvas-rendered item previews
- **Gradient Backgrounds**: Dynamic color schemes based on item data
- **Smooth Animations**: Hover effects and transitions

### Color Scheme
- **Primary**: Dark theme with blue/cyan accents
- **Status Colors**: Green (OK), Yellow (Low), Red (Out of Stock)
- **Accessibility**: High contrast ratios for readability

## 🔧 Development

### Project Structure
```
didactic-umbrella/
├── index.html          # Main application file
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

### Key Components
- **Zustand Store**: Central state management
- **Canvas Renderer**: Procedural graphics generation
- **Event Handlers**: User interaction management
- **CSV Parser**: Data import/export functionality

## 🚀 Future Enhancements

- [ ] Data persistence with localStorage
- [ ] Real barcode scanning integration
- [ ] Advanced analytics and reporting
- [ ] Multi-user collaboration
- [ ] Mobile app version
- [ ] API integration for backend services
- [ ] Print-friendly reports
- [ ] Advanced filtering and sorting

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**VaultFlow** - Modern inventory management made simple and beautiful. 