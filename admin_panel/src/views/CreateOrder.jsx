'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockApi } from '../services/mockApi';
import {
  ShoppingBag,
  User,
  Building2,
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  Layers,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Receipt,
  CreditCard,
  Truck,
  IndianRupee,
  AlertCircle
} from 'lucide-react';

export default function CreateOrder() {
  const router = useRouter();

  // Master Data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State: Shopkeeper / Business Details
  const [customer, setCustomer] = useState({
    name: '',
    businessName: '',
    gstNumber: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  // Cascading Selection State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [customWeightQty, setCustomWeightQty] = useState(1);
  const [customWeightUnit, setCustomWeightUnit] = useState('KG'); // KG or GM

  // Added Order Items
  const [items, setItems] = useState([]);

  // Pricing & Payment
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [orderStatus, setOrderStatus] = useState('Confirmed');
  const [notes, setNotes] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [formError, setFormError] = useState('');

  // 1. Fetch Categories and Products on Load
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [cats, prods] = await Promise.all([
          mockApi.getCategories(),
          mockApi.getProducts()
        ]);
        setCategories(cats || []);
        setProducts(prods || []);
      } catch (err) {
        console.error('Failed to load catalogue data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // 2. Cascading: Subcategories based on Selected Category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.id === selectedCategory || c.name === selectedCategory);
    if (!cat) return [];
    if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
      return cat.subcategories;
    }
    // Fallback subcategories by category slug/id
    if (cat.id?.includes('dry') || cat.name?.toLowerCase().includes('dry')) {
      return ['Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Dates', 'Raisins', 'Figs', 'Anjeer', 'Apricots', 'Mixed Dry Fruits', 'Seeds & Nuts'];
    }
    if (cat.id?.includes('whole') || cat.name?.toLowerCase().includes('whole')) {
      return ['Green Cardamom', 'Black Cardamom', 'Cinnamon Sticks', 'Cloves', 'Black Pepper', 'Cumin Seeds', 'Coriander Seeds', 'Fennel Seeds', 'Mustard Seeds', 'Star Anise'];
    }
    if (cat.id?.includes('blended') || cat.name?.toLowerCase().includes('blended')) {
      return ['Garam Masala', 'Kitchen King', 'Biryani Masala', 'Chole Masala', 'Pav Bhaji Masala', 'Turmeric Powder', 'Red Chilli Powder', 'Coriander Powder'];
    }
    return ['Oats', 'Rolled Oats', 'Quinoa', 'Millets', 'Ragi', 'Jowar', 'Bajra', 'Barley', 'Multigrain Mix'];
  }, [selectedCategory, categories]);

  // Reset dependent dropdowns when category changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('');
    setSelectedProduct('');
    setSelectedVariantId('');
  };

  // 3. Cascading: Products based on Selected Category & Subcategory
  const availableProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((p) => {
      const matchCat = p.categoryId === selectedCategory || p.categoryName === selectedCategory;
      if (!selectedSubcategory) return matchCat;
      const sub = selectedSubcategory.toLowerCase();
      const matchSub =
        (p.subcategoryId && p.subcategoryId.toLowerCase().includes(sub)) ||
        (p.subcategoryName && p.subcategoryName.toLowerCase().includes(sub)) ||
        p.name.toLowerCase().includes(sub);
      return matchCat && matchSub;
    });
  }, [selectedCategory, selectedSubcategory, products]);

  // Reset product when subcategory changes
  const handleSubcategoryChange = (sub) => {
    setSelectedSubcategory(sub);
    setSelectedProduct('');
    setSelectedVariantId('');
  };

  // Selected Product Object
  const currentProduct = useMemo(() => {
    return availableProducts.find((p) => p.id === selectedProduct);
  }, [selectedProduct, availableProducts]);

  // Available Variants for Selected Product
  const availableVariants = useMemo(() => {
    if (!currentProduct || !Array.isArray(currentProduct.variants)) return [];
    return currentProduct.variants;
  }, [currentProduct]);

  // Automatically select first variant when product changes
  useEffect(() => {
    if (availableVariants.length > 0) {
      setSelectedVariantId(availableVariants[0].id);
    } else {
      setSelectedVariantId('');
    }
  }, [availableVariants]);

  // Current Selected Variant Object
  const currentVariant = useMemo(() => {
    return availableVariants.find((v) => v.id === selectedVariantId) || availableVariants[0];
  }, [selectedVariantId, availableVariants]);

  // Live item price calculation
  const currentItemPrice = useMemo(() => {
    if (!currentVariant) return 0;
    return Number(currentVariant.price || 0) * Number(customWeightQty || 1);
  }, [currentVariant, customWeightQty]);

  // Add Item to Order
  const handleAddItem = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedCategory) {
      setFormError('Please select a Category first.');
      return;
    }
    if (!currentProduct) {
      setFormError('Please select a Product / Variety.');
      return;
    }
    if (!currentVariant) {
      setFormError('Please select a Weight Variant.');
      return;
    }
    if (!customWeightQty || customWeightQty <= 0) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    const newItem = {
      productId: currentProduct.id,
      productName: currentProduct.name,
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      weightInGrams: currentVariant.weightInGrams,
      unit: currentVariant.unit,
      price: Number(currentVariant.price),
      quantity: Number(customWeightQty),
      image: currentProduct.image || '/assets/images/cat_dryfruits.jpg',
      categoryName: currentProduct.categoryName || selectedCategory,
      subcategoryName: selectedSubcategory || currentProduct.subcategoryName || 'General',
      total: Number(currentVariant.price) * Number(customWeightQty),
    };

    setItems((prev) => [...prev, newItem]);

    // Reset selection for quick next item entry
    setCustomWeightQty(1);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals Calculation
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    const total = subtotal - Number(discountAmount || 0) + Number(deliveryFee || 0);
    return Math.max(0, total);
  }, [subtotal, discountAmount, deliveryFee]);

  // Submit Order
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customer.name.trim()) {
      setFormError('Please enter the Shopkeeper / Customer Name.');
      return;
    }
    if (!customer.phone.trim()) {
      setFormError('Please enter a Contact Phone Number.');
      return;
    }
    if (!customer.city.trim()) {
      setFormError('Please enter the City.');
      return;
    }
    if (items.length === 0) {
      setFormError('Please add at least one product item to this order.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          name: customer.name.trim(),
          businessName: customer.businessName.trim(),
          gstNumber: customer.gstNumber.trim().toUpperCase(),
          phone: customer.phone.trim(),
          email: customer.email.trim() || `${customer.phone.trim()}@store.naturale.com`,
          address: {
            street: customer.street.trim() || 'Shop Address',
            area: customer.businessName.trim() || 'Market',
            city: customer.city.trim(),
            state: customer.state.trim() || 'Maharashtra',
            pincode: customer.pincode.trim() || '400001',
          },
        },
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          variantId: it.variantId,
          variantTitle: it.variantTitle,
          weightInGrams: it.weightInGrams,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
        subtotal,
        discount: Number(discountAmount || 0),
        couponCode: discountAmount > 0 ? 'WHOLESALE_DISCOUNT' : '',
        deliveryFee: Number(deliveryFee || 0),
        tax: 0,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus,
        status: orderStatus,
        deliveryInstructions: notes.trim(),
      };

      const created = await mockApi.createManualOrder(orderPayload);
      setConfirmedOrder(created);
    } catch (err) {
      console.error('Order creation error:', err);
      setFormError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForNewOrder = () => {
    setCustomer({
      name: '',
      businessName: '',
      gstNumber: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
    });
    setItems([]);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedProduct('');
    setSelectedVariantId('');
    setCustomWeightQty(1);
    setDiscountAmount(0);
    setDeliveryFee(0);
    setNotes('');
    setConfirmedOrder(null);
    setFormError('');
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-primary-orange)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-light-peach)',
              }}
            >
              <ArrowLeft size={14} /> Back to Orders
            </Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-dark-text)', marginTop: '8px' }}>
            Take Manual Order
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
            Record shopkeeper wholesale orders, counter sales, and telephone bookings directly into the system.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResetForNewOrder}
            style={{ fontSize: '13px', padding: '10px 16px' }}
          >
            Clear Form
          </button>
        </div>
      </div>

      {formError && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #F87171',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#B91C1C',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} />
          {formError}
        </div>
      )}

      {/* Main Form Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '24px' }}>
        {/* Left Column: Customer Details & Product Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: Shopkeeper & Business Information */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--color-light-border)', paddingBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-light-peach)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-orange)',
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                  1. Shopkeeper & Store Details
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-secondary-text)' }}>
                  Enter merchant name, store identity, GST number, and delivery destination.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Shopkeeper / Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Bhai Sharma"
                  className="form-input"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Business Name / Store Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Kirana & Dry Fruits Mart"
                  className="form-input"
                  value={customer.businessName}
                  onChange={(e) => setCustomer({ ...customer, businessName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Contact Phone / Mobile *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9820012345"
                  className="form-input"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27AAACS1234A1Z5"
                  className="form-input"
                  value={customer.gstNumber}
                  onChange={(e) => setCustomer({ ...customer, gstNumber: e.target.value.toUpperCase() })}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Store / Delivery Address (Street & Market)
                </label>
                <input
                  type="text"
                  placeholder="Shop No. 12, APMC Grain Market, Sector 19"
                  className="form-input"
                  value={customer.street}
                  onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Navi Mumbai / Pune"
                  className="form-input"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    className="form-input"
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    className="form-input"
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Cascading Product Selection */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--color-light-border)', paddingBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-light-peach)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-orange)',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                  2. Select Products (Cascading Category & Variety)
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-secondary-text)' }}>
                  Pick Category → Filter Subcategory → Select Variety → Choose Weight & Pack Quantity.
                </p>
              </div>
            </div>

            {/* Cascading Dropdowns Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Step 1: Category Dropdown */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--color-primary-orange)' }}>
                  Step 1: Select Main Category *
                </label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{ border: '1.5px solid var(--color-primary-orange)' }}
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Subcategory Dropdown */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--color-primary-orange)' }}>
                  Step 2: Select Subcategory *
                </label>
                <select
                  className="form-select"
                  value={selectedSubcategory}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  disabled={!selectedCategory}
                  style={{ backgroundColor: !selectedCategory ? '#F5F5F5' : '#FFFFFF' }}
                >
                  <option value="">
                    {!selectedCategory ? '-- First select category --' : '-- Choose Subcategory --'}
                  </option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Product / Variety Dropdown */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--color-primary-orange)' }}>
                  Step 3: Select Product Variety *
                </label>
                <select
                  className="form-select"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={!selectedCategory}
                  style={{ backgroundColor: !selectedCategory ? '#F5F5F5' : '#FFFFFF' }}
                >
                  <option value="">
                    {!selectedCategory
                      ? '-- First select category & subcategory --'
                      : availableProducts.length === 0
                      ? '-- No matching varieties found --'
                      : '-- Choose Product Variety --'}
                  </option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.brand ? `(${p.brand})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Weight Variant Dropdown */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px' }}>
                  Step 4: Select Weight Variant *
                </label>
                <select
                  className="form-select"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  disabled={!currentProduct}
                >
                  {availableVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} — ₹{v.price} ({v.stockQuantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 5: Quantity in Packs / Numbers */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px' }}>
                  Step 5: Quantity (Packs / Units) *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className="form-input"
                    value={customWeightQty}
                    onChange={(e) => setCustomWeightQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{ fontWeight: 700, fontSize: '15px' }}
                  />
                  <div
                    style={{
                      padding: '0 16px',
                      backgroundColor: 'var(--color-light-peach)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 700,
                      color: 'var(--color-primary-orange)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    = ₹{currentItemPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Item Button */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddItem}
                disabled={!currentProduct}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                <Plus size={18} /> Add Product to Order
              </button>
            </div>
          </div>

          {/* Card 3: Added Items Table */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                3. Order Items ({items.length})
              </h3>
              {items.length > 0 && (
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  Subtotal: ₹{subtotal.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {items.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Variety</th>
                      <th>Category</th>
                      <th>Weight</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-dark-text)' }}>
                          {it.productName}
                        </td>
                        <td>
                          <span className="badge badge-peach">{it.categoryName}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{it.variantTitle}</td>
                        <td>₹{it.price.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ fontWeight: 800, fontSize: '14px' }}>{it.quantity}</span>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                          ₹{it.total.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-secondary-text)' }}>
                <ShoppingBag size={36} color="var(--color-secondary-text)" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: 600 }}>No items added yet.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  Use the cascading dropdowns above to select Category, Subcategory, Variety, and Weight to add products.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing Summary & Payment Confirmation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 4: Order Summary & Pricing */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)', marginBottom: '18px' }}>
              4. Order Bill Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px dashed var(--color-light-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Items Subtotal ({items.length} lines):</span>
                <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Wholesale Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  style={{ width: '100px', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Delivery / Freight Fee (₹):</span>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  style={{ width: '100px', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>

            {/* Grand Total */}
            <div
              style={{
                backgroundColor: 'var(--color-light-peach)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--color-secondary-text)' }}>
                  Payable Grand Total
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </h2>
              </div>
              <span className="badge badge-success" style={{ fontWeight: 700 }}>
                {paymentStatus}
              </span>
            </div>

            {/* Card 5: Payment & Order Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Payment Method *
                </label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash on Delivery (COD) / Counter Cash</option>
                  <option value="UPI">UPI / QR Code (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                  <option value="Cheque">Cheque Payment</option>
                  <option value="Store Credit">Store Credit / 15-Day Khata (Pay Later)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Payment Status
                  </label>
                  <select
                    className="form-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending / Unpaid</option>
                    <option value="Partial">Partial Payment</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Order Dispatch Status
                  </label>
                  <select
                    className="form-select"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Delivery Instructions / Special Notes
                </label>
                <textarea
                  rows="2"
                  className="form-input"
                  placeholder="e.g. Deliver via APMC Gate No. 2, call before unloading..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm & Place Order Button */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmOrder}
              disabled={submitting || items.length === 0}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              }}
            >
              <FileCheck2 size={20} />
              {submitting ? 'Creating Order in System...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {confirmedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-dark-text)', marginBottom: '6px' }}>
              Manual Order Placed Successfully!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '20px' }}>
              Order has been confirmed, assigned an ID, and registered under Customer records.
            </p>

            <div
              style={{
                backgroundColor: '#FAF5ED',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Order ID:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary-orange)' }}>{confirmedOrder.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Shopkeeper:</span>
                <span style={{ fontWeight: 700 }}>{confirmedOrder.customer?.name}</span>
              </div>
              {confirmedOrder.customer?.businessName && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-secondary-text)' }}>Store Name:</span>
                  <span style={{ fontWeight: 700 }}>{confirmedOrder.customer?.businessName}</span>
                </div>
              )}
              {confirmedOrder.customer?.gstNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-secondary-text)' }}>GST Number:</span>
                  <span style={{ fontWeight: 700 }}>{confirmedOrder.customer?.gstNumber}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Items Ordered:</span>
                <span style={{ fontWeight: 700 }}>{confirmedOrder.items?.length || 0} product lines</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E7DAC9', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontWeight: 800 }}>Total Amount:</span>
                <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-primary-orange)' }}>
                  ₹{Number(confirmedOrder.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push('/orders')}
                style={{ padding: '12px', fontSize: '13.5px', fontWeight: 700 }}
              >
                View in All Orders
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleResetForNewOrder}
                style={{ padding: '12px', fontSize: '13.5px', fontWeight: 700 }}
              >
                Take Another Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
