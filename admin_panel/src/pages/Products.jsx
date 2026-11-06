import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Plus, Search, Edit3, Trash2, Layers, CheckCircle2, XCircle } from 'lucide-react';
import VariantsModal from './VariantsModal';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Product Catalog</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Manage dry fruits, whole spices, blended spices, cereals and multi-weight variants.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

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
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>{p.brand}</div>
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

      {/* Weight Variants Manager Modal */}
      {variantProduct && (
        <VariantsModal
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}

