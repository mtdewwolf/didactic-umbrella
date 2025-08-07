'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

interface QuickQuantityAdjustProps {
  item: any;
  onUpdate?: () => void;
}

export default function QuickQuantityAdjust({ item, onUpdate }: QuickQuantityAdjustProps) {
  const { adjustQuantity } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(item.qty);

  const handleQuickAdjust = async (delta: number) => {
    try {
      await adjustQuantity(item.sku, delta);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to adjust quantity:', error);
    }
  };

  const handleSetQuantity = async () => {
    try {
      const delta = newQuantity - item.qty;
      await adjustQuantity(item.sku, delta);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to set quantity:', error);
    }
  };

  const handleCancel = () => {
    setNewQuantity(item.qty);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="quantity-editor">
        <input
          type="number"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
          min="0"
          className="quantity-input"
        />
        <div className="quantity-actions">
          <button 
            className="btn btn-sm btn-primary" 
            onClick={handleSetQuantity}
          >
            ✓
          </button>
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={handleCancel}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quantity-controls">
      <span className="quantity-display">{item.qty}</span>
      <div className="quantity-buttons">
        <button 
          className="btn btn-sm btn-secondary" 
          onClick={() => handleQuickAdjust(-1)}
          title="Decrease by 1"
        >
          -
        </button>
        <button 
          className="btn btn-sm btn-secondary" 
          onClick={() => handleQuickAdjust(1)}
          title="Increase by 1"
        >
          +
        </button>
        <button 
          className="btn btn-sm btn-primary" 
          onClick={() => setIsEditing(true)}
          title="Set exact quantity"
        >
          ✎
        </button>
      </div>
    </div>
  );
} 