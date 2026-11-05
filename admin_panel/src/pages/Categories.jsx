import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Plus, Edit2, Trash2, Tag, Check, X } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newSubcategory, setNewSubcategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '/assets/images/cat_dryfruits.jpg',
    order: 1,
    isActive: true,
    subcategories: [],
  });

  const loadCategories = async () => {
    try {
      const data = await mockApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '/assets/images/cat_dryfruits.jpg',
      order: categories.length + 1,
      isActive: true,
      subcategories: [],
    });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ ...cat });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await mockApi.updateCategory(editingCategory.id, formData);
      } else {
        await mockApi.createCategory(formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this category? Products in this category may be affected.')) {
      await mockApi.deleteCategory(id);
      loadCategories();
    }
  };

  const addSubcategoryTag = () => {
    if (!newSubcategory.trim()) return;
    if (formData.subcategories.includes(newSubcategory.trim())) return;
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, newSubcategory.trim()],
    });
    setNewSubcategory('');
  };

  const removeSubcategoryTag = (sub) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((s) => s !== sub),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Category Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Configure the 4 core departments and their dynamic subcategories.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {categories.map((cat) => (
          <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <img
                src={cat.image}
                alt={cat.name}
                style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/assets/images/cat_dryfruits.jpg';
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{cat.name}</h3>
                  <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
                  {cat.description}
                </p>
                <div style={{ fontSize: '11px', color: 'var(--color-primary-orange)', fontWeight: 600, marginTop: '4px' }}>
                  Sort Order: {cat.order}
                </div>
              </div>
            </div>

            {/* Subcategories Tags */}
            <div style={{ flex: 1, marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-dark-text)', marginBottom: '8px' }}>
                Subcategories ({cat.subcategories?.length || 0})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cat.subcategories?.map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      fontSize: '11px',
                      backgroundColor: 'var(--color-light-peach)',
                      color: 'var(--color-dark-text)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-light-border)', paddingTop: '14px' }}>
              <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => openEdit(cat)}>
                <Edit2 size={14} /> Edit
              </button>
              <button
                className="btn-danger"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Edit/Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Image Path</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                {/* Subcategories Management */}
                <div className="form-group">
                  <label className="form-label">Subcategories</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add subcategory (e.g. Cardamom)"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSubcategoryTag();
                        }
                      }}
                    />
                    <button type="button" className="btn-secondary" onClick={addSubcategoryTag}>
                      Add
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.subcategories.map((sub) => (
                      <span
                        key={sub}
                        style={{
                          backgroundColor: 'var(--color-light-peach)',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() => removeSubcategoryTag(sub)}
                          style={{ background: 'none', color: '#666' }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active & Visible in Mobile App
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

