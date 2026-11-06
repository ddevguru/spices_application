'use client';

import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    storeName: 'Naturale - Premium Dry Fruits & Spices',
    contactEmail: 'care@naturale.com',
    contactPhone: '+91 800-NATURALE',
    currencySymbol: '₹',
    standardDeliveryFee: 40,
    freeDeliveryThreshold: 500,
    minimumOrderValue: 150,
    lowStockThreshold: 15,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await mockApi.getSettings();
      if (s) setSettings((prev) => ({ ...prev, ...s }));
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await mockApi.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Store Settings & Policies</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Configure delivery rules, threshold limits, tax policies and contact info.
          </p>
        </div>
      </div>

      {saved && (
        <div
          style={{
            backgroundColor: 'rgba(39, 134, 95, 0.12)',
            color: 'var(--color-success-green)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <CheckCircle size={16} /> Store settings updated and persisted successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>General Information</h3>
        <div className="form-group">
          <label className="form-label">Store Brand Name</label>
          <input
            type="text"
            className="form-input"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Support Email</label>
            <input
              type="email"
              className="form-input"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Support Toll-Free Phone</label>
            <input
              type="text"
              className="form-input"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            />
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', borderTop: '1px solid var(--color-light-border)', paddingTop: '20px' }}>
          Pricing & Delivery Thresholds
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Standard Delivery Fee (₹)</label>
            <input
              type="number"
              className="form-input"
              value={settings.standardDeliveryFee}
              onChange={(e) => setSettings({ ...settings, standardDeliveryFee: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Free Delivery Threshold (₹)</label>
            <input
              type="number"
              className="form-input"
              value={settings.freeDeliveryThreshold}
              onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Order Value (₹)</label>
            <input
              type="number"
              className="form-input"
              value={settings.minimumOrderValue}
              onChange={(e) => setSettings({ ...settings, minimumOrderValue: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', borderTop: '1px solid var(--color-light-border)', paddingTop: '20px' }}>
          Inventory Warning Thresholds
        </h3>
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label className="form-label">Low Stock Alert Level (Units)</label>
          <input
            type="number"
            className="form-input"
            value={settings.lowStockThreshold}
            onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 15 })}
          />
          <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Products will show amber warning badge when any weight variant falls below this level.
          </p>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary">
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}

