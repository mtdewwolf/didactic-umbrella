'use client';

import { useStore } from '@/lib/store';

export default function LocationsPanel() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">Locations Management</div>
        <div className="panel-actions">
          <button className="btn btn-secondary">Add Location</button>
          <button className="btn btn-primary">Import Locations</button>
        </div>
      </div>
      <div className="panel-body">
        <div className="empty">
          <p>Locations management coming soon!</p>
          <p>This section will allow you to:</p>
          <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
            <li>Manage warehouse locations and zones</li>
            <li>Track location capacity and utilization</li>
            <li>View location-specific inventory</li>
            <li>Generate location reports</li>
          </ul>
        </div>
      </div>
    </section>
  );
} 