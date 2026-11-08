'use client';

import React, { useEffect, useState, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { Plus, Search, Edit3, Trash2, Layers, CheckCircle2, XCircle, Download, Upload, FileSpreadsheet, CheckCircle, Check, Share2, Copy, QrCode, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import VariantsModal from './VariantsModal';
import * as XLSX from 'xlsx';

export default function Products() {
  const [products, setProducts] = useState(() => mockApi.getProductsSync());
  const [categories, setCategories] = useState(() => mockApi.getCategoriesSync());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);
  const [copiedSku, setCopiedSku] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Excel Import States
  const fileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewProducts, setPreviewProducts] = useState([]);
  const [fileName, setFileName] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Naturale Pure',
    categoryId: 'cat_dry_fruits',
    categoryName: 'Dry Fruits',
    subcategoryId: 'Almonds',
    subcategoryName: 'Almonds',
    shortDescription: '',
    description: '',
    image: '/assets/images/prod_almonds.jpg',
    origin: 'India',
    ingredients: '',
    storageInstructions: 'Store in airtight jar.',
    isFeatured: false,
    isBestSeller: false,
    allowCustomWeight: true,
  });

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([mockApi.getProducts(), mockApi.getCategories()]);
      if (prods && prods.length > 0) setProducts(prods);
      if (cats && cats.length > 0) setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: 'Naturale Pure',
      categoryId: categories[0]?.id || 'cat_dry_fruits',
      categoryName: categories[0]?.name || 'Dry Fruits',
      subcategoryId: categories[0]?.subcategories[0] || 'Almonds',
      subcategoryName: categories[0]?.subcategories[0] || 'Almonds',
      shortDescription: '',
      description: '',
      image: '/assets/images/prod_almonds.jpg',
      origin: 'India',
      ingredients: '',
      storageInstructions: 'Store in airtight jar.',
      isFeatured: false,
      isBestSeller: false,
      allowCustomWeight: true,
    });
    setShowProductModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      brand: p.brand || 'Naturale Pure',
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      subcategoryId: p.subcategoryId,
      subcategoryName: p.subcategoryName,
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      image: p.image || '/assets/images/prod_almonds.jpg',
      origin: p.origin || 'India',
      ingredients: p.ingredients || '',
      storageInstructions: p.storageInstructions || '',
      isFeatured: !!p.isFeatured,
      isBestSeller: !!p.isBestSeller,
      allowCustomWeight: !!p.allowCustomWeight,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await mockApi.updateProduct(editingProduct.id, formData);
      } else {
        await mockApi.createProduct(formData);
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await mockApi.deleteProduct(id);
      loadData();
    }
  };

  // -------------------------------------------------------------
  // EXCEL IMPORT & SAMPLE DOWNLOAD FOR PRODUCTS
  // -------------------------------------------------------------
  const downloadSampleExcel = () => {
    const sampleRows = [
      {
        'Product Name': 'California Whole Almonds (Almond Nut)',
        'Category': 'Dry Fruits',
        'Subcategory': 'Almonds',
        'Brand': 'Naturale Royal',
        '100g Price': 120,
        '250g Price': 280,
        '500g Price': 540,
        '1kg Price': 1050,
        'Stock per variant': 50,
        'Short Description': 'Jumbo California almonds, crisp & rich in Vitamin E.',
        'Origin': 'California, USA',
        'Image Path': '/assets/images/prod_almonds.jpg',
        'Best Seller': 'TRUE',
        'Featured': 'TRUE',
      },
      {
        'Product Name': 'Iranian Mamra Almonds',
        'Category': 'Dry Fruits',
        'Subcategory': 'Almonds',
        'Brand': 'Naturale Royal',
        '100g Price': 260,
        '250g Price': 620,
        '500g Price': 1180,
        '1kg Price': 2250,
        'Stock per variant': 40,
        'Short Description': '100% authentic Mamra almonds with high natural almond oil.',
        'Origin': 'Iran',
        'Image Path': '/assets/images/prod_almonds.jpg',
        'Best Seller': 'TRUE',
        'Featured': 'FALSE',
      },
      {
        'Product Name': 'Alleppey Green Cardamom (8mm Bold)',
        'Category': 'Whole Spices',
        'Subcategory': 'Green Cardamom',
        'Brand': 'Naturale Spices',
        '100g Price': 380,
        '250g Price': 920,
        '500g Price': 1800,
        '1kg Price': 3500,
        'Stock per variant': 30,
        'Short Description': 'Extra bold 8mm emerald green cardamom pods directly from Idukki.',
        'Origin': 'Kerala, India',
        'Image Path': '/assets/images/cat_wholespices.jpg',
        'Best Seller': 'TRUE',
        'Featured': 'TRUE',
      },
      {
        'Product Name': 'Royal Shahi Garam Masala',
        'Category': 'Blended Spices',
        'Subcategory': 'Garam Masala',
        'Brand': 'Naturale Heritage',
        '100g Price': 95,
        '250g Price': 220,
        '500g Price': 420,
        '1kg Price': 800,
        'Stock per variant': 60,
        'Short Description': 'Stone-ground blend of 16 whole roasted royal heritage spices.',
        'Origin': 'Lucknow, India',
        'Image Path': '/assets/images/cat_blendedspices.jpg',
        'Best Seller': 'FALSE',
        'Featured': 'TRUE',
      },
      {
        'Product Name': 'Organic Rolled Oats',
        'Category': 'Cereals',
        'Subcategory': 'Rolled Oats',
        'Brand': 'Naturale Daily',
        '100g Price': 45,
        '250g Price': 95,
        '500g Price': 180,
        '1kg Price': 340,
        'Stock per variant': 80,
        'Short Description': 'Thick rolled gluten-free nutritious whole oats.',
        'Origin': 'Australia',
        'Image Path': '/assets/images/cat_cereals.jpg',
        'Best Seller': 'TRUE',
        'Featured': 'FALSE',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 36 }, // Product Name
      { wch: 18 }, // Category
      { wch: 20 }, // Subcategory
      { wch: 18 }, // Brand
      { wch: 12 }, // 100g Price
      { wch: 12 }, // 250g Price
      { wch: 12 }, // 500g Price
      { wch: 12 }, // 1kg Price
      { wch: 18 }, // Stock per variant
      { wch: 50 }, // Short Description
      { wch: 18 }, // Origin
      { wch: 32 }, // Image Path
      { wch: 14 }, // Best Seller
      { wch: 14 }, // Featured
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products_Sample');
    XLSX.writeFile(wb, 'products_sample_template.xlsx');
  };

  const mapCategory = (catRaw) => {
    const raw = String(catRaw || '').trim().toLowerCase();
    if (raw.includes('dry') || raw.includes('fruit') || raw.includes('cat_dry')) {
      return { id: 'cat_dry_fruits', name: 'Dry Fruits' };
    }
    if (raw.includes('whole') || raw.includes('cat_whole')) {
      return { id: 'cat_whole_spices', name: 'Whole Spices' };
    }
    if (raw.includes('blend') || raw.includes('masala') || raw.includes('cat_blend')) {
      return { id: 'cat_blended_spices', name: 'Blended Spices' };
    }
    if (raw.includes('cereal') || raw.includes('grain') || raw.includes('cat_cereal')) {
      return { id: 'cat_cereals', name: 'Cereals' };
    }
    const matched = categories.find((c) => c.name.toLowerCase() === raw || c.id.toLowerCase() === raw);
    if (matched) return { id: matched.id, name: matched.name };
    return { id: 'cat_dry_fruits', name: catRaw || 'Dry Fruits' };
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

        const now = Date.now();
        const parsed = json
          .map((row, idx) => {
            const name = String(row['Product Name'] || row['ProductName'] || row['Name'] || row['name'] || '').trim();
            if (!name) return null;

            const categoryInfo = mapCategory(row['Category'] || row['Category Name'] || row['category']);
            const subcategory = String(row['Subcategory'] || row['Subcategory Name'] || row['subcategory'] || 'General').trim();
            const brand = String(row['Brand'] || row['brand'] || 'Naturale Pure').trim();
            const shortDesc = String(row['Short Description'] || row['Description'] || row['shortDescription'] || '').trim();
            const origin = String(row['Origin'] || row['origin'] || 'India').trim();
            const image = String(row['Image Path'] || row['Image'] || row['image'] || '/assets/images/cat_dryfruits.jpg').trim();

            const bestSellerRaw = String(row['Best Seller'] || row['isBestSeller'] || row['bestseller'] || 'FALSE').toUpperCase();
            const isBestSeller = bestSellerRaw === 'TRUE' || bestSellerRaw === '1' || bestSellerRaw === 'YES';

            const featuredRaw = String(row['Featured'] || row['isFeatured'] || row['featured'] || 'FALSE').toUpperCase();
            const isFeatured = featuredRaw === 'TRUE' || featuredRaw === '1' || featuredRaw === 'YES';

            const stockPerVariant = parseInt(row['Stock per variant'] || row['Stock'] || row['stockQuantity'] || 40) || 40;

            const p100 = parseFloat(row['100g Price'] || row['100 GM Price'] || row['100g'] || 0);
            const p250 = parseFloat(row['250g Price'] || row['250 GM Price'] || row['250g'] || row['Price'] || 0);
            const p500 = parseFloat(row['500g Price'] || row['500 GM Price'] || row['500g'] || 0);
            const p1000 = parseFloat(row['1kg Price'] || row['1 KG Price'] || row['1000g Price'] || row['1kg'] || 0);

            const variants = [];
            const base250 = p250 > 0 ? p250 : 250;

            // 100g
            const final100 = p100 > 0 ? p100 : Math.round(base250 * 0.45);
            variants.push({
              id: `v_${now}_${idx}_100`,
              weightInGrams: 100,
              unit: 'GM',
              title: '100 GM',
              price: final100,
              originalPrice: Math.round(final100 * 1.25),
              stockQuantity: stockPerVariant,
              sku: `PRD-${idx + 1}-100`,
              isAvailable: true,
            });

            // 250g
            variants.push({
              id: `v_${now}_${idx}_250`,
              weightInGrams: 250,
              unit: 'GM',
              title: '250 GM',
              price: base250,
              originalPrice: Math.round(base250 * 1.25),
              stockQuantity: stockPerVariant,
              sku: `PRD-${idx + 1}-250`,
              isAvailable: true,
            });

            // 500g
            const final500 = p500 > 0 ? p500 : Math.round(base250 * 1.9);
            variants.push({
              id: `v_${now}_${idx}_500`,
              weightInGrams: 500,
              unit: 'GM',
              title: '500 GM',
              price: final500,
              originalPrice: Math.round(final500 * 1.25),
              stockQuantity: stockPerVariant,
              sku: `PRD-${idx + 1}-500`,
              isAvailable: true,
            });

            // 1kg
            const final1000 = p1000 > 0 ? p1000 : Math.round(base250 * 3.7);
            variants.push({
              id: `v_${now}_${idx}_1000`,
              weightInGrams: 1000,
              unit: 'KG',
              title: '1 KG',
              price: final1000,
              originalPrice: Math.round(final1000 * 1.25),
              stockQuantity: Math.max(10, Math.round(stockPerVariant * 0.5)),
              sku: `PRD-${idx + 1}-1000`,
              isAvailable: true,
            });

            return {
              id: `p_${now}_${idx}`,
              name,
              brand,
              categoryId: categoryInfo.id,
              categoryName: categoryInfo.name,
              subcategoryId: subcategory,
              subcategoryName: subcategory,
              shortDescription: shortDesc || `${brand} premium quality ${name}.`,
              description: `${name} sorted and packaged under hygienic conditions. Rich in taste and purity.`,
              origin,
              image: image || '/assets/images/cat_dryfruits.jpg',
              rating: 4.85,
              reviewCount: 20,
              isFeatured,
              isBestSeller,
              allowCustomWeight: true,
              variants,
            };
          })
          .filter(Boolean);

        if (parsed.length === 0) {
          alert('No valid products found. Make sure each row contains a "Product Name".');
          return;
        }

        setPreviewProducts(parsed);
        setShowImportModal(true);
      } catch (err) {
        console.error('Failed to parse Excel:', err);
        alert('Failed to parse Excel file: ' + err.message);
      } finally {
        e.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const confirmImport = async () => {
    try {
      setImporting(true);
      await mockApi.bulkImportProducts(previewProducts, replaceExisting);
      setShowImportModal(false);
      setPreviewProducts([]);
      await loadData();
      setSuccessMsg(`Successfully imported ${previewProducts.length} products from Excel!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert('Error importing products: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.subcategoryId && p.subcategoryId.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Product Catalog</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Manage dry fruits, whole spices, blended spices, cereals and multi-weight variants, or bulk import via Excel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Hidden File Input for Products Excel */}
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
            title="Download formatted sample Excel with example products & weight prices"
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
            title="Upload edited Excel sheet to import products with weight variants"
          >
            <Upload size={16} color="var(--color-primary-orange)" />
            Import Excel
          </button>

          {/* Manual Add Product */}
          <button className="btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13px' }}>
            <Plus size={16} />
            Add Product
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="var(--color-secondary-text)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by product name, category, or subcategory..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Weight Variants</th>
                <th>Base Price</th>
                <th>Stock Overview</th>
                <th>Badges</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
                const defaultVariant = p.variants?.[0];

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = '/assets/images/onboarding_dryfruits.jpg';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{p.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--color-secondary-text)', marginTop: '1px' }}>{p.brand}</div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#334155', padding: '3px 7px', borderRadius: '5px', fontFamily: 'monospace', fontWeight: 700, border: '1px solid #E2E8F0' }}>
                              SKU: {p.sku || p.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShareProduct(p)}
                              style={{
                                fontSize: '11px',
                                background: '#EEF2FF',
                                color: '#4338CA',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                border: '1px solid #C7D2FE',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600,
                              }}
                              title="View & Share Product QR Code"
                            >
                              <QrCode size={12} /> QR Code
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{p.categoryName}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.subcategoryId || '-'}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => setVariantProduct(p)}
                        style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}
                      >
                        <Layers size={14} color="var(--color-primary-orange)" />
                        <strong>{p.variants?.length || 0} Variants</strong>
                      </button>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{defaultVariant?.price || 0} <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>({defaultVariant?.title})</span>
                    </td>
                    <td>
                      <span className={`badge ${totalStock > 30 ? 'badge-success' : totalStock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {totalStock} units across variants
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {p.isBestSeller && <span className="badge badge-warning">Best Seller</span>}
                        {p.isFeatured && <span className="badge badge-success">Featured</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setShareProduct(p)}
                          style={{ background: 'none', color: '#2563EB', cursor: 'pointer' }}
                          title="Share Product (SKU / Barcode Link)"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          style={{ background: 'none', color: 'var(--color-primary-orange)' }}
                          title="Edit Product"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          style={{ background: 'none', color: 'var(--color-danger-red)' }}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none' }}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kashmiri Snow-White Walnut Halves"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.categoryId}
                      onChange={(e) => {
                        const cat = categories.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          categoryId: e.target.value,
                          categoryName: cat?.name || '',
                          subcategoryId: cat?.subcategories[0] || '',
                          subcategoryName: cat?.subcategories[0] || '',
                        });
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select
                      className="form-select"
                      value={formData.subcategoryId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subcategoryId: e.target.value,
                          subcategoryName: e.target.value,
                        })
                      }
                    >
                      {categories
                        .find((c) => c.id === formData.categoryId)
                        ?.subcategories?.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief 1-sentence product summary"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Detailed Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Image Path / Asset</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Origin</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    Mark as Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    />
                    Mark as Best Seller
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.allowCustomWeight}
                      onChange={(e) => setFormData({ ...formData, allowCustomWeight: e.target.checked })}
                    />
                    Allow Custom Grams
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT PREVIEW MODAL FOR PRODUCTS */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '880px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--color-light-peach)', padding: '8px', borderRadius: '10px' }}>
                  <FileSpreadsheet size={20} color="var(--color-primary-orange)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Import Products from Excel</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                    File: <span style={{ fontWeight: 600, color: 'var(--color-dark-text)' }}>{fileName}</span> •{' '}
                    <span style={{ color: 'var(--color-primary-orange)', fontWeight: 700 }}>{previewProducts.length} Products</span> detected
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
                      name="prodImportMode"
                      checked={!replaceExisting}
                      onChange={() => setReplaceExisting(false)}
                    />
                    <span style={{ fontWeight: 600 }}>Merge & Update Existing Products</span> (Recommended)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="prodImportMode"
                      checked={replaceExisting}
                      onChange={() => setReplaceExisting(true)}
                    />
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>Replace All Existing Products</span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div style={{ border: '1px solid var(--color-light-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAF5ED', borderBottom: '1.5px solid var(--color-light-border)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>#</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Product & Brand</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Category / Subcategory</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Weight Variants (Prices)</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Stock</th>
                      <th style={{ padding: '10px 12px', fontWeight: 700 }}>Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewProducts.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--color-light-border)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--color-secondary-text)' }}>{index + 1}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-dark-text)' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>{item.brand} • {item.origin}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className="badge badge-info" style={{ fontSize: '10.5px' }}>{item.categoryName}</span>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-dark-text)', marginTop: '3px' }}>
                            {item.subcategoryId}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {item.variants.map((v, vIdx) => (
                              <span
                                key={vIdx}
                                style={{
                                  fontSize: '11px',
                                  backgroundColor: 'var(--color-light-peach)',
                                  color: 'var(--color-dark-text)',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                }}
                              >
                                {v.title}: ₹{v.price}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                          {item.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)} units
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {item.isBestSeller && <span className="badge badge-warning" style={{ fontSize: '9.5px' }}>Best</span>}
                            {item.isFeatured && <span className="badge badge-success" style={{ fontSize: '9.5px' }}>Featured</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                Please review before confirming. Products and subcategories will be updated.
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
                  {importing ? 'Importing...' : `Confirm & Import (${previewProducts.length} Products)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weight Variants Manager Modal */}
      {variantProduct && (
        <VariantsModal
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
          onRefresh={loadData}
        />
      )}

      {/* Share Product (SKU / Barcode) Modal */}
      {shareProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Share2 size={20} color="var(--color-primary-orange)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Share Product (SKU Link & Barcode)</h3>
              </div>
              <button onClick={() => setShareProduct(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Product Info Card */}
              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  padding: '12px 14px',
                  backgroundColor: '#FAF5ED',
                  borderRadius: '12px',
                  marginBottom: '18px',
                  border: '1px solid #F3EAE0',
                }}
              >
                <img
                  src={shareProduct.image}
                  alt={shareProduct.name}
                  style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/assets/images/onboarding_dryfruits.jpg';
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--color-dark-text)' }}>
                    {shareProduct.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', margin: '2px 0 0' }}>
                    {shareProduct.categoryName} • {shareProduct.subcategoryId}
                  </p>
                </div>
              </div>

              {/* SKU Box */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-dark-text)', display: 'block', marginBottom: '6px' }}>
                  PRODUCT SKU (Unique Identifier)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={shareProduct.sku || shareProduct.id}
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(shareProduct.sku || shareProduct.id);
                      setCopiedSku(true);
                      setTimeout(() => setCopiedSku(false), 2000);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                  >
                    {copiedSku ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    {copiedSku ? 'Copied' : 'Copy SKU'}
                  </button>
                </div>
              </div>

              {/* Mobile App Deep-Link */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-dark-text)', display: 'block', marginBottom: '6px' }}>
                  DIRECT APPLICATION LINK (Opens exact product in Naturale App)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={`https://naturale.app/product?sku=${shareProduct.sku || shareProduct.id}`}
                    className="form-input"
                    style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://naturale.app/product?sku=${shareProduct.sku || shareProduct.id}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                  >
                    {copiedLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    {copiedLink ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <div style={{ marginBottom: '16px' }}>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🌿 Check out ${shareProduct.name} on Naturale App!\n\n` +
                    `📦 SKU: ${shareProduct.sku || shareProduct.id}\n` +
                    `🔗 Tap to Open in App: https://naturale.app/product?sku=${shareProduct.sku || shareProduct.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#25D366',
                    borderColor: '#25D366',
                    width: '100%',
                    padding: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    borderRadius: '10px',
                  }}
                >
                  Share on WhatsApp (Direct Link & SKU)
                </a>
              </div>

              {/* Live Scannable Product QR Code */}
              <div
                style={{
                  padding: '20px 16px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#4B5563', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  GENUINE SCANNABLE PRODUCT QR CODE
                </div>

                <div
                  style={{
                    padding: '14px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <QRCodeSVG
                    id="product-qr-svg"
                    value={`https://naturale.app/product?sku=${shareProduct.sku || shareProduct.id}`}
                    size={175}
                    level="H"
                    includeMargin={true}
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#111827' }}>
                    SKU: {shareProduct.sku || shareProduct.id}
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#4B5563', margin: '12px 0 14px', maxWidth: '380px', lineHeight: 1.5 }}>
                  Scan with mobile camera, Google Lens, or in-app QR scanner to open <strong>{shareProduct.name}</strong> immediately in the Naturale mobile app.
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      const svg = document.getElementById('product-qr-svg');
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      canvas.width = 350;
                      canvas.height = 350;
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      img.onload = () => {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, 350, 350);
                        const a = document.createElement('a');
                        a.download = `QR_${shareProduct.sku || shareProduct.id}.png`;
                        a.href = canvas.toDataURL('image/png');
                        a.click();
                      };
                      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px' }}
                  >
                    <Download size={14} /> Download High-Res QR
                  </button>
                  <a
                    href={`https://naturale.app/product?sku=${shareProduct.sku || shareProduct.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> Test Link in Browser
                  </a>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShareProduct(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

