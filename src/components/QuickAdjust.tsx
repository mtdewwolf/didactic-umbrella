'use client';

import { useInventoryStore } from '@/lib/store';

interface QuickAdjustProps {
  showToast: (message: string) => void;
}

export default function QuickAdjust({ showToast }: QuickAdjustProps) {
  const { items, selected, adjust } = useInventoryStore();

  const handleQuickAdjust = () => {
    const current = selected ? items.find(item => item.sku === selected) : items[0];
    if (!current) return;
    
    const delta = Math.random() < 0.5 ? -Math.ceil(Math.random() * 5) : Math.ceil(Math.random() * 8);
    adjust(current.sku, delta);
    showToast(`Adjusted ${current.sku} ${delta > 0 ? '+' : ''}${delta}`);
  };

  return (
    <div className="fixed right-5 bottom-5 z-11 grid gap-2.5">
      <button
        className="btn p-3.5 px-4.5 rounded-2xl font-extrabold bg-gradient-to-b from-[rgba(47,228,185,0.18)] to-[rgba(47,228,185,0.06)] border-[rgba(47,228,185,0.25)] shadow-[0_10px_32px_rgba(47,228,185,0.22)]"
        onClick={handleQuickAdjust}
      >
        Quick Adjust
      </button>
    </div>
  );
} 