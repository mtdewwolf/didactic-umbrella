'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DashboardPanel from '@/components/DashboardPanel';
import InventoryPanel from '@/components/InventoryPanel';
import OrdersPanel from '@/components/OrdersPanel';
import SuppliersPanel from '@/components/SuppliersPanel';
import LocationsPanel from '@/components/LocationsPanel';
import ItemsPanel from '@/components/ItemsPanel';
import QuickAdjust from '@/components/QuickAdjust';
import Toast from '@/components/Toast';
import { useStore } from '@/lib/store';

export default function Home() {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { loadItems, loadSuppliers, loadOrders, loadActivity, currentView } = useStore();

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  useEffect(() => {
    loadItems();
    loadSuppliers();
    loadOrders();
    loadActivity();
  }, [loadItems, loadSuppliers, loadOrders, loadActivity]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'inventory':
        return <InventoryPanel />;
      case 'orders':
        return <OrdersPanel />;
      case 'suppliers':
        return <SuppliersPanel />;
      case 'locations':
        return <LocationsPanel />;
      case 'items':
        return <ItemsPanel />;
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <AuthGuard>
      <>
        <div className="noise"></div>
        <div className="glow"></div>
        <Header />
        <div className="layout">
          <Sidebar />
          <main className="content">
            {renderCurrentView()}
          </main>
        </div>
        <QuickAdjust />
        <Toast message={toastMessage} show={showToast} onHide={hideToast} />
      </>
    </AuthGuard>
  );
}
