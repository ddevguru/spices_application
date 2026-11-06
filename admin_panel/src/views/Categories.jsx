'use client';

import React, { useEffect, useState, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { Plus, Edit2, Trash2, Tag, Check, X, Download, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Categories() {
  const [categories, setCategories] = useState(() => mockApi.getCategoriesSync());
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newSubcategory, setNewSubcategory] = useState('');

  // Excel Import States
  const fileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewCategories, setPreviewCategories] = useState([]);
  const [fileName, setFileName] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
      if (data && data.length > 0) setCategories(data);
    } catch (err) {
      console.error(err);
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

  // -------------------------------------------------------------
  // EXCEL IMPORT & SAMPLE DOWNLOAD HANDLERS
  // -------------------------------------------------------------
  const downloadSampleExcel = () => {
    const sampleRows = [
      {
        'Category Name': 'Dry Fruits',
        'Description': 'Rich in essential nutrients, vitamins, and healthy fats.',
        'Subcategories (comma separated)': 'Almonds, Cashews, Pistachios, Walnuts, Dates, Raisins, Figs, Anjeer, Apricots, Mixed Dry Fruits',
        'Sort Order': 1,
        'Is Active (TRUE/FALSE)': 'TRUE',
        'Image URL / Path': '/assets/images/cat_dryfruits.jpg',
      },
      {
        'Category Name': 'Whole Spices',
        'Description': 'Aromatic, pure and hand-selected whole spices.',
        'Subcategories (comma separated)': 'Green Cardamom, Black Cardamom, Cinnamon Sticks, Cloves, Black Pepper, Cumin Seeds, Coriander Seeds, Star Anise',
        'Sort Order': 2,
        'Is Active (TRUE/FALSE)': 'TRUE',
        'Image URL / Path': '/assets/images/cat_wholespices.jpg',
      },
      {
        'Category Name': 'Blended Spices',
        'Description': 'Authentic heritage spice blends ground to perfection.',
        'Subcategories (comma separated)': 'Garam Masala, Kitchen King Masala, Biryani Masala, Chole Masala, Turmeric Powder, Red Chilli Powder',
        'Sort Order': 3,
        'Is Active (TRUE/FALSE)': 'TRUE',
        'Image URL / Path': '/assets/images/cat_blendedspices.jpg',
      },
      {
        'Category Name': 'Cereals',
        'Description': 'Nutritious whole grains, millets, oats and superfoods.',
        'Subcategories (comma separated)': 'Oats, Rolled Oats, Quinoa, Millets, Ragi, Jowar, Bajra, Multigrain Mix',
        'Sort Order': 4,
        'Is Active (TRUE/FALSE)': 'TRUE',
        'Image URL / Path': '/assets/images/cat_cereals.jpg',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 22 }, // Category Name
      { wch: 45 }, // Description
      { wch: 65 }, // Subcategories
      { wch: 12 }, // Sort Order
      { wch: 22 }, // Is Active
      { wch: 35 }, // Image URL
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categories_Sample');
    XLSX.writeFile(wb, 'categories_sample_template.xlsx');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          alert('The uploaded Excel file is empty.');
          return;
        }

        const parsed = json.map((row, idx) => {
          const name = String(row['Category Name'] || row['CategoryName'] || row['Name'] || row['name'] || '').trim();
          const desc = String(row['Description'] || row['description'] || '').trim();
          const subRaw = row['Subcategories (comma separated)'] || row['Subcategories'] || row['subcategories'] || '';
          const orderVal = parseInt(row['Sort Order'] || row['Order'] || row['order'] || (idx + 1));
          const activeRaw = String(row['Is Active (TRUE/FALSE)'] || row['Is Active'] || row['isActive'] || row['Active'] || 'TRUE').trim().toUpperCase();
          const isActive = activeRaw === 'TRUE' || activeRaw === '1' || activeRaw === 'YES';
          const image = String(row['Image URL / Path'] || row['Image'] || row['image'] || '/assets/images/cat_dryfruits.jpg').trim();

          const subcategories = typeof subRaw === 'string'
            ? subRaw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
            : Array.isArray(subRaw) ? subRaw : [];

          return {
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: desc,
            subcategories,
            order: isNaN(orderVal) ? idx + 1 : orderVal,
            isActive,
            image: image || '/assets/images/cat_dryfruits.jpg',
          };
        }).filter((c) => c.name.length > 0);

        if (parsed.length === 0) {
          alert('No valid categories found. Please ensure each row has a "Category Name".');
          return;
        }

        setPreviewCategories(parsed);
        setShowImportModal(true);
      } catch (err) {
        console.error('Failed to parse Excel:', err);
        alert('Failed to parse Excel file. Error: ' + err.message);
      } finally {
        e.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const confirmImport = async () => {
    try {
      setImporting(true);
      await mockApi.bulkImportCategories(previewCategories, replaceExisting);
      setShowImportModal(false);
      setPreviewCategories([]);
      await loadCategories();
      setSuccessMsg(`Successfully imported ${previewCategories.length} categories from Excel!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert('Error importing categories: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* Top Header & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Category Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Manage core store categories, dynamic subcategories, or import bulk data via Excel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Hidden File Input for Excel */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          {/* Download Sample Excel */}
          <button
            type="button"
            className="btn-secondary"
            onClick={downloadSampleExcel}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }}
            title="Download formatted sample Excel with example categories"
          >
            <Download size={16} color="var(--color-primary-orange)" />
            Download Sample Excel
          </button>

          {/* Import Excel */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }}
            title="Upload edited Excel sheet to import categories"
          >
            <Upload size={16} color="var(--color-primary-orange)" />
            Import Excel
          </button>

          {/* Add Category Manual */}
          <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13px' }}>
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#ECFDF5',
            border: '1.2px solid #A7F3D0',
            color: '#065F46',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={18} color="#10B981" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Categories Grid */}
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

      {/* EXCEL IMPORT PREVIEW MODAL */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--color-light-peach)', padding: '8px', borderRadius: '10px' }}>
                  <FileSpreadsheet size={20} color="var(--color-primary-orange)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Import Categories from Excel</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                    File: <span style={{ fontWeight: 600, color: 'var(--color-dark-text)' }}>{fileName}</span> •{' '}
                    <span style={{ color: 'var(--color-primary-orange)', fontWeight: 700 }}>{previewCategories.length} Categories</span> detected
                  </p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Import Options */}
              <div style={{ backgroundColor: '#FFF7ED', border: '1.2px solid #FED7AA', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
                <p style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-dark-text)', marginBottom: '8px' }}>
                  Import Mode:
                </p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={!replaceExisting}
                      onChange={() => setReplaceExisting(false)}
                    />
                    <span style={{ fontWeight: 600 }}>Merge & Update Existing</span> (Recommended)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={replaceExisting}
                      onChange={() => setReplaceExisting(true)}
                    />
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>Replace All Existing Categories</span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div style={{ border: '1px solid var(--color-light-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAF5ED', borderBottom: '1.5px solid var(--color-light-border)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>#</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Category Name</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Subcategories</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Order</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewCategories.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--color-light-border)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--color-secondary-text)' }}>{index + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-dark-text)' }}>
                          {item.name}
                          {item.description && (
                            <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', fontWeight: 400, marginTop: '2px' }}>
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary-orange)' }}>
                            {item.subcategories.length} subcategories
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                            {item.subcategories.slice(0, 4).map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                style={{
                                  fontSize: '10.5px',
                                  backgroundColor: 'var(--color-light-peach)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {sub}
                              </span>
                            ))}
                            {item.subcategories.length > 4 && (
                              <span style={{ fontSize: '10.5px', color: 'var(--color-secondary-text)', padding: '2px 4px' }}>
                                +{item.subcategories.length - 4} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.order}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                            {item.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                Please review before confirming.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={importing}
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={importing}
                  onClick={confirmImport}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Check size={16} />
                  {importing ? 'Importing...' : `Confirm & Import (${previewCategories.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit/Create Modal (Manual) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
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
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
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

