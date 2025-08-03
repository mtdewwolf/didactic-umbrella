'use client';

import { useStore } from '@/lib/store';

export default function QuickAdjust() {
  const { items, selected, adjustQuantity } = useStore();

  const handleQuickAdjust = async () => {
    const current = selected ? items.find(i => i.sku === selected) : items[0];
    if (!current) return;
    
    const delta = Math.random() < 0.5 ? -Math.ceil(Math.random() * 5) : Math.ceil(Math.random() * 8);
    await adjustQuantity(current.sku, delta);
  };

  return (
    <div className="floating">
      <button className="btn fab" onClick={handleQuickAdjust}>
        Quick Adjust
      </button>
    </div>
  );
} 