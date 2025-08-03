'use client';

import { useState, useEffect } from 'react';
import { useInventoryStore, currency, statusOf } from '@/lib/store';
import { InventoryItem } from '@/types/inventory';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import InventoryPanel from '@/components/InventoryPanel';
import DashboardGrid from '@/components/DashboardGrid';
import ActivityPanel from '@/components/ActivityPanel';
import AddItemModal from '@/components/AddItemModal';
import Toast from '@/components/Toast';
import QuickAdjust from '@/components/QuickAdjust';

export default function Home() {
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: '',
    show: false,
  });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 2000);
  };

  return (
    <div className="min-h-screen">
      <Header showToast={showToast} />
      
      <div className="grid grid-cols-[260px_1fr] gap-5 p-5 max-w-7xl mx-auto">
        <Sidebar showToast={showToast} />
        
        <main className="grid gap-5">
          <StatsCards />
          <InventoryPanel showToast={showToast} />
          <DashboardGrid showToast={showToast} />
          <ActivityPanel />
        </main>
      </div>

      <QuickAdjust showToast={showToast} />
      <AddItemModal showToast={showToast} />
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
} 