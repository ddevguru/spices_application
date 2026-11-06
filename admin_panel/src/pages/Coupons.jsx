import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Plus, Trash2, Ticket, CheckCircle2 } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState(() => mockApi.getCouponsSync());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 500,
    maxDiscount: 200,
    expiryDate: '2026-12-31',
    isActive: true,
  });

  const loadCoupons = async () => {
    try {
      const list = await mockApi.getCoupons();
      if (list && list.length > 0) setCoupons(list);
    } catch (_) {}
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await mockApi.createCoupon(formData);
    setShowModal(false);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 500,
      maxDiscount: 200,
      expiryDate: '2026-12-31',
      isActive: true,
    });
    loadCoupons();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this coupon?')) {
      await mockApi.deleteCoupon(id);
      loadCoupons();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Coupon & Discount Rules</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Create promo codes, minimum basket conditions, and percentage/fixed discount limits.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {coupons.map((c) => (
          <div key={c.id} className="card" style={{ borderLeft: '4px solid var(--color-primary-orange)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    color: 'var(--color-primary-orange)',
                  }}
                >
                  {c.code}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
                  {c.description}
                </p>
              </div>
              <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                {c.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--color-cream-bg)', borderRadius: 'var(--radius-md)', fontSize: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Discount:</span>
                <strong>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Min Basket Value:</span>
                <strong>₹{c.minOrderValue}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Expires:</span>
                <strong>{c.expiryDate}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-danger" onClick={() => handleDelete(c.id)}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Create New Promo Coupon</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE25"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. 25% off on whole spices above ₹600"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-select"
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Value</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Min Order Value (₹)</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

