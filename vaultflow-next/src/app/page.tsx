'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import InventoryPanel from '@/components/InventoryPanel';
import QuickAdjust from '@/components/QuickAdjust';
import Toast from '@/components/Toast';
import { useStore } from '@/lib/store';

export default function Home() {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { loadItems, loadActivity } = useStore();

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadItems();
        await loadActivity();
      } catch (error) {
        console.error('Failed to initialize data:', error);
        showToastMessage('Failed to load inventory data');
      }
    };

    initializeData();
  }, [loadItems, loadActivity]);

  return (
    <>
      <div className="noise"></div>
      <div className="glow"></div>
      
      <Header />
      
      <div className="layout">
        <Sidebar />
        
        <main className="content">
          <StatsCards />
          <InventoryPanel />
        </main>
      </div>
      
      <QuickAdjust />
      
      <Toast 
        message={toastMessage} 
        show={showToast} 
        onHide={hideToast} 
      />
    </>
  );
}
