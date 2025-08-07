'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useStore } from '@/lib/store';

interface CartItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export default function WholesalePortal() {
  const { user, logout } = useAuthStore();
  const { items, loadItems } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const getItemPrice = (item: any) => {
    if (!user || user.type !== 'wholesale') return item.retail_price || 0;
    
    // Check for custom pricing first
    if (user.customPricing && user.customPricing[item.sku]) {
      return user.customPricing[item.sku];
    }
    
    // Apply discount to wholesale price
    const basePrice = item.wholesale_price || item.retail_price || 0;
    const discount = user.discount || 0;
    return basePrice * (1 - discount / 100);
  };

  const addToCart = (item: any) => {
    const price = getItemPrice(item);
    const existingItem = cart.find(cartItem => cartItem.sku === item.sku);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.sku === item.sku 
          ? { ...cartItem, qty: cartItem.qty + 1, total: (cartItem.qty + 1) * price }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        sku: item.sku,
        name: item.name,
        qty: 1,
        price,
        total: price
      }]);
    }
  };

  const updateCartQty = (sku: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.sku !== sku));
    } else {
      setCart(cart.map(item => 
        item.sku === sku 
          ? { ...item, qty, total: qty * item.price }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  if (!user || user.type !== 'wholesale') {
    return (
      <div className="wholesale-error">
        <h2>Access Denied</h2>
        <p>This portal is for wholesale customers only.</p>
        <button className="btn btn-primary" onClick={logout}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="wholesale-portal">
      <header className="wholesale-header">
                 <div className="header-content">
           <div className="wholesale-brand">
             <img src="/logo.png" alt="GoldMine Distro" className="brand-logo" />
             <h1>Wholesale Portal</h1>
           </div>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            {user.discount && <span className="discount-badge">{user.discount}% Discount</span>}
            <button className="btn btn-sm btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="wholesale-layout">
        <div className="inventory-section">
          <div className="filters">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="inventory-grid">
            {filteredItems.map(item => {
              const price = getItemPrice(item);
              const isCustomPrice = user.customPricing && user.customPricing[item.sku];
              
              return (
                <div key={item.sku} className="inventory-card">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="item-image" />
                  )}
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="sku">SKU: {item.sku}</p>
                    <p className="category">{item.category}</p>
                    <p className="stock">In Stock: {item.qty}</p>
                    <div className="pricing">
                      <span className="price">${price.toFixed(2)}</span>
                      {isCustomPrice && <span className="custom-price-badge">Custom Price</span>}
                      {user.discount && !isCustomPrice && (
                        <span className="discount-applied">({user.discount}% off)</span>
                      )}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => addToCart(item)}
                      disabled={item.qty <= 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-section">
          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <span className="item-count">{cart.length} items</span>
          </div>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <p>Add items from the inventory to get started</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.sku} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="sku">SKU: {item.sku}</p>
                      <p className="price">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="item-controls">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateCartQty(item.sku, parseInt(e.target.value) || 0)}
                        className="qty-input"
                      />
                      <span className="total">${item.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">${getCartTotal().toFixed(2)}</span>
                </div>
                <button className="btn btn-primary btn-block">
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 