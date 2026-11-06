import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Search, AlertTriangle, CheckCircle, Plus, Minus } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState(() => mockApi.getProductsSync());
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, oos
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const data = await mockApi.getProducts();
      if (data && data.length > 0) setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustStock = async (productId, variantId, delta) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const v = prod.variants.find((item) => item.id === variantId);
    if (!v) return;

    const newStock = Math.max(0, (v.stockQuantity || 0) + delta);
    await mockApi.updateVariant(productId, variantId, { stockQuantity: newStock });
    loadData();
  };

  // Flatten products into variant rows
  const variantRows = [];
  products.forEach((p) => {
    (p.variants || []).forEach((v) => {
      variantRows.push({
        productId: p.id,
        productName: p.name,
        categoryName: p.categoryName,
        variantId: v.id,
        variantTitle: v.title,
        weightInGrams: v.weightInGrams,
        sku: v.sku || `${p.id.slice(0, 4).toUpperCase()}-${v.weightInGrams}G`,
        stockQuantity: v.stockQuantity,
        price: v.price,
      });
    });
  });

  const filtered = variantRows.filter((r) => {
    const matchesSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.sku.toLowerCase().includes(search.toLowerCase());
    if (stockFilter === 'low') return matchesSearch && r.stockQuantity <= 15 && r.stockQuantity > 0;
    if (stockFilter === 'oos') return matchesSearch && r.stockQuantity === 0;
    return matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Variant-Wise Inventory</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Track and adjust granular gram stock levels across all packaging variants.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="var(--color-secondary-text)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
          <div style={{ width: '200px' }}>
            <select
              className="form-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Inventory</option>
              <option value="low">Low Stock (&le; 15 units)</option>
              <option value="oos">Out of Stock (0 units)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Variant Pack</th>
                <th>Variant SKU</th>
                <th>Available Stock</th>
                <th>Health Status</th>
                <th>Stock Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.productId}_${r.variantId}`}>
                  <td style={{ fontWeight: 700 }}>{r.productName}</td>
                  <td>
                    <span className="badge badge-info">{r.categoryName}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary-orange)' }}>{r.variantTitle}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.sku}</td>
                  <td style={{ fontWeight: 800, fontSize: '15px' }}>{r.stockQuantity} units</td>
                  <td>
                    {r.stockQuantity === 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : r.stockQuantity <= 15 ? (
                      <span className="badge badge-warning">Low Stock Warning</span>
                    ) : (
                      <span className="badge badge-success">Optimal Stock</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 8px' }}
                        onClick={() => handleAdjustStock(r.productId, r.variantId, -5)}
                        title="Reduce 5 units"
                      >
                        <Minus size={12} /> 5
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 8px' }}
                        onClick={() => handleAdjustStock(r.productId, r.variantId, +10)}
                        title="Add 10 units"
                      >
                        <Plus size={12} /> 10
                      </button>
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleAdjustStock(r.productId, r.variantId, +50)}
                        title="Restock 50 units"
                      >
                        Restock +50
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

