import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Plus, Trash2, Image, ExternalLink } from 'lucide-react';

export default function Banners() {
  const [banners, setBanners] = useState(() => mockApi.getBannersSync());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '/assets/banners/banner_discount.jpg',
    ctaText: 'Shop Now',
    targetCategory: 'cat_dry_fruits',
    isActive: true,
  });

  const loadBanners = async () => {
    try {
      const list = await mockApi.getBanners();
      if (list && list.length > 0) setBanners(list);
    } catch (_) {}
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await mockApi.createBanner(formData);
    setShowModal(false);
    loadBanners();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this banner?')) {
      await mockApi.deleteBanner(id);
      loadBanners();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Promotional Banners</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Control mobile app home carousels and festive offers.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Upload Banner
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {banners.map((b) => (
          <div key={b.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '170px', position: 'relative' }}>
              <img
                src={b.image}
                alt={b.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/assets/banners/banner_discount.jpg';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{b.title}</h3>
                <p style={{ fontSize: '12px', opacity: 0.9 }}>{b.subtitle}</p>
                <div style={{ marginTop: '10px' }}>
                  <span style={{ backgroundColor: 'var(--color-primary-orange)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                    {b.ctaText}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-success">Active on App</span>
                <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginLeft: '8px' }}>
                  Target: {b.targetCategory}
                </span>
              </div>
              <button className="btn-danger" onClick={() => handleDelete(b.id)}>
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
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Create Promotional Banner</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Banner Heading</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 20% Discount"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle / Description</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Premium Dry Fruits Collection"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Image Asset / URL</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">CTA Button Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Category ID</label>
                    <select
                      className="form-select"
                      value={formData.targetCategory}
                      onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                    >
                      <option value="cat_dry_fruits">Dry Fruits</option>
                      <option value="cat_whole_spices">Whole Spices</option>
                      <option value="cat_blended_spices">Blended Spices</option>
                      <option value="cat_cereals">Cereals</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

