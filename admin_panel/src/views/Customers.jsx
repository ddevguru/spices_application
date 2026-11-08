'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { mockApi } from '../services/mockApi';
import { Search, Mail, Phone, Calendar, ShoppingBag, Users, RefreshCw, Plus, Building2 } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState(() => mockApi.getCustomersSync());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await mockApi.getCustomers();
      if (data && Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = (customers || []).filter((c) => {
    if (!c) return false;
    const name = String(c.name || '').toLowerCase();
    const email = String(c.email || '').toLowerCase();
    const phone = String(c.mobile || c.phone || '');
    const city = String(c.city || '').toLowerCase();
    const s = search.toLowerCase();

    return name.includes(s) || email.includes(s) || phone.includes(s) || city.includes(s);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Registered Customers</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Customer profiles, total spending, and lifetime order frequencies.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={load}
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
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: '8px',
            }}
          >
            <Plus size={15} /> Take Manual Order
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--color-secondary-text)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by customer name, email, city or phone..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {filtered.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer & Store</th>
                  <th>License No.</th>
                  <th>Contact Details</th>
                  <th>Registration Date</th>
                  <th>City</th>
                  <th>Total Orders</th>
                  <th>Lifetime Spent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => {
                  const initial = String(c.name || 'M').trim()[0]?.toUpperCase() || 'M';
                  const phoneDisplay = c.mobile || c.phone || 'N/A';
                  const emailDisplay = c.email || 'N/A';
                  const regDate = c.registeredDate || c.registered_date || 'Recent';
                  const ordersCount = c.totalOrders ?? c.total_orders ?? 0;
                  const spentVal = c.totalSpent ?? c.total_spent ?? 0;
                  const lic = c.licenseNumber || `NAT-LIC-2026-${(100000 + ((c.id ? c.id.length * 37419 : idx * 17931) % 900000))}`;

                  return (
                    <tr key={c.id || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-light-peach)',
                              color: 'var(--color-primary-orange)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{c.name || 'Member'}</div>
                            {(c.shopName || c.businessName) && (
                              <div style={{ fontSize: '11px', color: 'var(--color-primary-orange)', fontWeight: 600 }}>
                                🏪 {c.shopName || c.businessName}
                              </div>
                            )}
                            {c.gstNumber && (
                              <div style={{ fontSize: '10.5px', color: 'var(--color-secondary-text)' }}>
                                GST: {c.gstNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            backgroundColor: '#FAF5ED',
                            color: '#92400E',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #FDE68A',
                            display: 'inline-block',
                          }}
                        >
                          {lic}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} color="var(--color-secondary-text)" /> {emailDisplay}
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <Phone size={12} color="var(--color-secondary-text)" /> {phoneDisplay}
                        </div>
                      </td>
                      <td>{regDate}</td>
                      <td style={{ fontWeight: 600 }}>{c.city || 'India'}</td>
                      <td>
                        <span className="badge badge-info">{ordersCount} Orders</span>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                        ₹{Number(spentVal).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="badge badge-success">Verified Active</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-secondary-text)' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-light-peach)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Users size={36} color="var(--color-primary-orange)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-dark-text)', marginBottom: '8px' }}>
                {search ? 'No Matching Customers Found' : 'No Registered Customers Yet'}
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                {search
                  ? `No customer matches "${search}". Try searching with another name or phone number.`
                  : 'When customers download the Flutter mobile app and create their accounts, their profiles and order history will automatically appear here in real-time.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

