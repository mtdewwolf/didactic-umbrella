'use client';

import { useInventoryStore } from '@/lib/store';

export default function ActivityPanel() {
  const { activity } = useInventoryStore();

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString();
  };

  const renderActivityItem = (event: any) => {
    const time = formatTime(event.at);
    
    switch (event.type) {
      case 'adjust':
        return (
          <div key={`${event.sku}-${event.at}`} className="py-2">
            <span className="chip">Adjust</span> SKU <strong>{event.sku}</strong> qty {event.delta > 0 ? '+' : ''}{event.delta} <span className="text-[var(--muted)]">at {time}</span>
          </div>
        );
      case 'import':
        return (
          <div key={`import-${event.at}`} className="py-2">
            <span className="chip">Import</span> Added <strong>{event.count}</strong> items <span className="text-[var(--muted)]">at {time}</span>
          </div>
        );
      case 'add':
        return (
          <div key={`add-${event.sku}-${event.at}`} className="py-2">
            <span className="chip">New</span> Added SKU <strong>{event.sku}</strong> <span className="text-[var(--muted)]">at {time}</span>
          </div>
        );
      case 'clear':
        return (
          <div key={`clear-${event.at}`} className="py-2">
            <span className="chip">Clear</span> Inventory cleared <span className="text-[var(--muted)]">at {time}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">Activity</div>
        <div className="flex gap-2 flex-wrap">
          <span className="chip">Recent</span>
          <span className="chip">Adjustments</span>
          <span className="chip">Orders</span>
        </div>
      </div>
      <div className="panel-body">
        {activity.length === 0 ? (
          <div className="empty">No activity yet. Start by adding items or importing CSV.</div>
        ) : (
          <div className="space-y-1">
            {activity.slice(0, 12).map(renderActivityItem)}
          </div>
        )}
      </div>
    </section>
  );
} 