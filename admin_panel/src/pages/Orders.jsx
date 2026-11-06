import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Search, Eye, Printer, XCircle, CheckCircle2, Truck } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState(() => mockApi.getOrdersSync());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  const loadOrders = async () => {
    try {
      const data = await mockApi.getOrders();
      if (data) setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
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
    window.print();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.phone.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Customer Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Dispatch tracking, weight fulfillment, and customer invoices.
          </p>
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        style={{ background: 'none', color: 'var(--color-primary-orange)' }}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(ord)}
                        style={{ background: 'none', color: 'var(--color-secondary-text)' }}
                        title="Print Invoice"
                      >
                        <Printer size={18} />
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
              <button className="btn-secondary" onClick={() => handlePrintInvoice(selectedOrder)}>
                <Printer size={16} /> Print Demo Invoice
              </button>
              <button className="btn-primary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

