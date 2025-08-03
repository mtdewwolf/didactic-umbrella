'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  onHide: () => void;
}

export default function Toast({ message, show, onHide }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
} 