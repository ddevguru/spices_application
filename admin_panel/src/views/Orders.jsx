'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { mockApi } from '../services/mockApi';
import { Search, Eye, Printer, XCircle, CheckCircle2, Truck, FileText, Download, Check, Copy, Plus, RefreshCw } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState(() => mockApi.getOrdersSync());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [loading, setLoading] = useState(false);

  const statuses = [
    'Pending',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];

      // 1. Direct resilient fetch from live Render backend
      try {
        const res = await fetch('https://dryfruits-api.onrender.com/api/orders', {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const apiData = await res.json();
          if (Array.isArray(apiData)) {
            data = apiData;
          }
        }
      } catch (_) {}

      // 2. Fallback to mockApi if direct fetch was empty
      if (!data || data.length === 0) {
        data = await mockApi.getOrders();
      }

      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000); // Live poll every 15 seconds
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      try {
        await fetch(`https://dryfruits-api.onrender.com/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (_) {}

      await mockApi.updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePrintInvoice = (ord) => {
    setInvoiceOrder(ord);
  };

  const handleCopyInvoice = (ord) => {
    const text = `NATURALE TAX INVOICE\nInvoice: INV-${ord.id}\nDate: ${new Date(ord.createdAt).toLocaleDateString()}\nCustomer: ${ord.customer?.name} (${ord.customer?.phone})\nAddress: ${ord.customer?.address?.street || ''}, ${ord.customer?.address?.city || ''} - ${ord.customer?.address?.pincode || ''}\nTotal: ₹${ord.totalAmount}\nStatus: ${ord.status}`;
    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const s = search.toLowerCase().trim();
    if (!s) return matchesStatus;

    const id = String(o.id || '').toLowerCase();
    const custName = String(o.customer?.name || '').toLowerCase();
    const custPhone = String(o.customer?.phone || '').toLowerCase();
    const custEmail = String(o.customer?.email || '').toLowerCase();

    const matchesSearch = id.includes(s) || custName.includes(s) || custPhone.includes(s) || custEmail.includes(s);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Customer Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Dispatch tracking, weight fulfillment, and customer invoices.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadOrders}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            href="/create-order"
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: '10px',
            }}
          >
            <Plus size={16} /> Take Manual Order
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="var(--color-secondary-text)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by Order ID, customer name or phone..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Ordered Items & Weights</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-secondary-text)' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-dark-text)', marginBottom: '4px' }}>No Orders Found</div>
                    <div style={{ fontSize: '13px' }}>Customer orders from the mobile app will be displayed here in real-time.</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 700 }}>{ord.id}</td>
                  <td style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.customer?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                      {ord.customer?.phone}
                    </div>
                  </td>
                  <td>
                    {ord.items?.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '12px' }}>
                        <strong>{it.quantity}x</strong> {it.productName} (
                        <span style={{ color: 'var(--color-primary-orange)', fontWeight: 600 }}>
                          {it.variantTitle}
                        </span>
                        )
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{ord.totalAmount}</td>
                  <td>
                    <span className="badge badge-info">{ord.paymentMethod}</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor:
                          ord.status === 'Delivered'
                            ? 'rgba(39, 134, 95, 0.12)'
                            : ord.status === 'Cancelled'
                            ? '#fee2e2'
                            : 'rgba(255, 129, 46, 0.12)',
                        color:
                          ord.status === 'Delivered'
                            ? 'var(--color-success-green)'
                            : ord.status === 'Cancelled'
                            ? '#dc2626'
                            : 'var(--color-primary-orange)',
                      }}
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        style={{
                          background: 'none',
                          color: 'var(--color-primary-orange)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,129,46,0.25)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="View Details"
                      >
                        <Eye size={14} /> Details
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(ord)}
                        style={{
                          background: '#fff7ed',
                          color: '#ea580c',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #fed7aa',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="View & Print Bill Receipt"
                      >
                        <FileText size={14} /> Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Order Details: {selectedOrder.id}</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none' }}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Customer and Delivery info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  backgroundColor: 'var(--color-cream-bg)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Customer Contact</h4>
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>{selectedOrder.customer?.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{selectedOrder.customer?.phone}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{selectedOrder.customer?.email}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Shipping Address</h4>
                  <p style={{ fontSize: '12px', lineHeight: 1.4 }}>
                    {selectedOrder.customer?.address?.street}, {selectedOrder.customer?.address?.area},{' '}
                    {selectedOrder.customer?.address?.city} - {selectedOrder.customer?.address?.pincode}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Purchased Items</h4>
              <div style={{ border: '1px solid var(--color-light-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px' }}>
                {selectedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--color-light-border)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{it.productName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                        Variant: <strong>{it.variantTitle}</strong> | Qty: <strong>{it.quantity}</strong>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                      ₹{it.price * it.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div style={{ padding: '0 8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--color-success-green)' }}>
                    <span>Discount ({selectedOrder.couponCode || 'Promo'}):</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Delivery Fee:</span>
                  <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-light-border)',
                    fontWeight: 800,
                    fontSize: '16px',
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--color-primary-orange)' }}>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => handlePrintInvoice(selectedOrder)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={16} /> View Tax Invoice / Receipt
              </button>
              <button className="btn-primary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL BILL RECEIPT / TAX INVOICE MODAL (ADMIN) */}
      {invoiceOrder && (
        <div className="modal-overlay" style={{ zIndex: 1200, padding: '20px' }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '820px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              backgroundColor: '#fff',
              padding: '0',
              borderRadius: '16px',
            }}
          >
            {/* Modal Controls (Hidden in Print) */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-light-border)',
                backgroundColor: 'var(--color-cream-bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--color-primary-orange)" />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    Tax Invoice & Bill Receipt • INV-{invoiceOrder.id}
                  </h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--color-secondary-text)', margin: 0 }}>
                    Official retail tax invoice ready for print or customer dispatch
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleCopyInvoice(invoiceOrder)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
                >
                  {copiedInvoice ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  {copiedInvoice ? 'Copied!' : 'Copy Summary'}
                </button>
                <button
                  className="btn-primary"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
                >
                  <Printer size={15} /> Print / Download PDF
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: 'var(--color-secondary-text)',
                    marginLeft: '8px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Paper Layout */}
            <div
              className="printable-invoice"
              style={{
                padding: '36px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                color: '#1f2937',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Header: Company & Invoice Info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #ea580c',
                  paddingBottom: '20px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div
                      style={{
                        backgroundColor: '#ea580c',
                        color: 'white',
                        fontWeight: 900,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        letterSpacing: '1px',
                      }}
                    >
                      NATURALE
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                      Naturale Agrotech Ltd.
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0' }}>
                    Pure Dry Fruits, Heritage Spices & Certified Organic Cereals
                  </p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0' }}>
                    Sector 62, Electronic City, Noida, Uttar Pradesh - 201309
                  </p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0' }}>
                    <strong>GSTIN:</strong> 07AAACN1234F1Z5 | <strong>FSSAI Lic. No:</strong> 10020011000452
                  </p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0' }}>
                    Email: care@naturale.com | Support: +91 98765 43210
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.6px',
                      marginBottom: '8px',
                      border: '1px solid #fde68a',
                    }}
                  >
                    TAX INVOICE / CASH MEMO
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                    INV-{invoiceOrder.id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>
                    Date:{' '}
                    <strong>
                      {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Payment: <strong style={{ color: '#16a34a' }}>{invoiceOrder.paymentMethod} (PAID)</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Order Status: <strong>{invoiceOrder.status}</strong>
                  </div>
                </div>
              </div>

              {/* Customer Billing & Shipping Section */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  backgroundColor: '#f9fafb',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
                    Billed To:
                  </h4>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                    {invoiceOrder.customer?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '3px' }}>
                    Phone: {invoiceOrder.customer?.phone || 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4b5563' }}>
                    Email: {invoiceOrder.customer?.email || 'N/A'}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
                    Shipped & Delivered To:
                  </h4>
                  <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.45 }}>
                    {invoiceOrder.customer?.address?.street && (
                      <div>{invoiceOrder.customer.address.street}, {invoiceOrder.customer.address.area}</div>
                    )}
                    <div>
                      {invoiceOrder.customer?.address?.city || 'Delhi'}
                      {invoiceOrder.customer?.address?.state ? `, ${invoiceOrder.customer.address.state}` : ''} -{' '}
                      {invoiceOrder.customer?.address?.pincode || '110001'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                      Delivery Type: Standard Express (Naturale Logistics)
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '20px',
                  fontSize: '12.5px',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', width: '35px', fontWeight: 700 }}>#</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700 }}>Item Description</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Pack Size</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>HSN</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Unit Rate (₹)</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items?.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>
                        {item.productName}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span
                          style={{
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}
                        >
                          {item.variantTitle}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280', fontSize: '11px' }}>
                        0802
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#4b5563' }}>
                        ₹{item.price}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                        ₹{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation & Terms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
                {/* Terms and Declarations */}
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid #fef3c7',
                    fontSize: '11px',
                    color: '#78350f',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '4px', fontSize: '11.5px' }}>
                    Declaration & Terms of Sale:
                  </strong>
                  1. Goods once sold are backed by 48-hour fresh harvest replacement guarantee for seal breach.
                  <br />
                  2. All prices are inclusive of applicable GST (Dry fruits 5% / Spices 5%).
                  <br />
                  3. Store in cool, dry place away from direct sunlight.
                  <br />
                  4. This is a computer-generated tax invoice and does not require a physical signature.
                </div>

                {/* Calculation Table */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12.5px', color: '#4b5563' }}>
                    <span>Items Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>₹{invoiceOrder.subtotal}</span>
                  </div>

                  {invoiceOrder.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12.5px', color: '#16a34a' }}>
                      <span>Discount ({invoiceOrder.couponCode || 'Promo'}):</span>
                      <span style={{ fontWeight: 700 }}>-₹{invoiceOrder.discount}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12.5px', color: '#4b5563' }}>
                    <span>Delivery Charges:</span>
                    <span style={{ fontWeight: 600, color: invoiceOrder.deliveryFee === 0 ? '#16a34a' : '#4b5563' }}>
                      {invoiceOrder.deliveryFee === 0 ? 'FREE' : `₹${invoiceOrder.deliveryFee}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px', color: '#6b7280' }}>
                    <span>Taxes (Included):</span>
                    <span>CGST + SGST (5%)</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0 4px',
                      marginTop: '8px',
                      borderTop: '2px solid #ea580c',
                      fontSize: '16px',
                      fontWeight: 900,
                      color: '#111827',
                    }}
                  >
                    <span>Grand Total:</span>
                    <span style={{ color: '#ea580c' }}>₹{invoiceOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Signatory Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '36px',
                  paddingTop: '20px',
                  borderTop: '1px dashed #d1d5db',
                }}
              >
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  <strong>Naturale Agrotech Ltd.</strong> • Quality Assured Dry Fruits & Spices
                  <br />
                  For inquiries, contact care@naturale.com
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#ea580c',
                      border: '1.5px dashed #ea580c',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      marginBottom: '6px',
                    }}
                  >
                    NATURALE VERIFIED DISPATCH
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Authorized Signatory</div>
                </div>
              </div>
            </div>

            {/* Print Styles */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .printable-invoice, .printable-invoice * {
                  visibility: visible !important;
                }
                .printable-invoice {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  padding: 24px !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}

