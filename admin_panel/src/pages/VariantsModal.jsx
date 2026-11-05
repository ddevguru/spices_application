import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { mockApi } from '../services/mockApi';

export default function VariantsModal({ product, onClose, onRefresh }) {
  const [variants, setVariants] = useState(product.variants || []);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    weightInGrams: 250,
    unit: 'GM',
    title: '250 GM',
    price: 250,
    originalPrice: 300,
    stockQuantity: 50,
    sku: '',
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    isAvailable: true,
  });

  const handleEdit = (v) => {
    setEditingId(v.id);
    setFormData(v);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await mockApi.updateVariant(product.id, editingId, formData);
      } else {
        await mockApi.addVariant(product.id, formData);
      }
      const updatedProducts = await mockApi.getProducts();
      const updatedP = updatedProducts.find((p) => p.id === product.id);
      if (updatedP) setVariants(updatedP.variants);
      setEditingId(null);
      setFormData({
        weightInGrams: 250,
        unit: 'GM',
        title: '250 GM',
        price: 250,
        originalPrice: 300,
        stockQuantity: 50,
        sku: '',
        minOrderQuantity: 1,
        maxOrderQuantity: 10,
        isAvailable: true,
      });
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (vId) => {
    if (variants.length <= 1) {
      alert('A product must have at least one weight variant.');
      return;
    }
    if (confirm('Delete this weight variant?')) {
      await mockApi.deleteVariant(product.id, vId);
      setVariants(variants.filter((v) => v.id !== vId));
      onRefresh();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Manage Weight Variants</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
              Product: <strong>{product.name}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Existing Variants Table */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              Configured Weight Variants ({variants.length})
            </h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Weight Pack</th>
                    <th>Selling Price</th>
                    <th>MRP / Original</th>
                    <th>Stock</th>
                    <th>SKU</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 700 }}>{v.title}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary-orange)' }}>₹{v.price}</td>
                      <td style={{ textDecoration: 'line-through', color: 'var(--color-secondary-text)' }}>
                        ₹{v.originalPrice}
                      </td>
                      <td>
                        <span className={`badge ${v.stockQuantity > 15 ? 'badge-success' : v.stockQuantity > 0 ? 'badge-warning' : 'badge-danger'}`}>
                          {v.stockQuantity} units
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>{v.sku || '-'}</td>
                      <td>
                        <span className={`badge ${v.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                          {v.isAvailable ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(v)}
                            style={{ background: 'none', color: 'var(--color-primary-orange)' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            style={{ background: 'none', color: 'var(--color-danger-red)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form to Add / Edit Variant */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-cream-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-light-border)',
            }}
          >
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
              {editingId ? 'Edit Weight Variant' : '+ Add New Weight Variant'}
            </h4>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Weight (Grams)</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={formData.weightInGrams}
                    onChange={(e) => {
                      const g = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        weightInGrams: g,
                        unit: g >= 1000 ? 'KG' : 'GM',
                        title: g >= 1000 ? `${g / 1000} KG` : `${g} GM`,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="GM">GM (Grams)</option>
                    <option value="KG">KG (Kilograms)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Display Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Original Price / MRP (₹)</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Variant SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. CAS-250G"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editingId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        weightInGrams: 250,
                        unit: 'GM',
                        title: '250 GM',
                        price: 250,
                        originalPrice: 300,
                        stockQuantity: 50,
                        sku: '',
                        minOrderQuantity: 1,
                        maxOrderQuantity: 10,
                        isAvailable: true,
                      });
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Variant' : 'Save Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

