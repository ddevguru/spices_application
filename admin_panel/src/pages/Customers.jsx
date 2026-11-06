import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Search, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState(() => mockApi.getCustomersSync());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await mockApi.getCustomers();
        if (data) setCustomers(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Registered Customers</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Customer profiles, total spending, and lifetime order frequencies.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--color-secondary-text)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by customer name, email, or mobile..."
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
                  <th>Customer</th>
                  <th>Contact Details</th>
                  <th>Registration Date</th>
                  <th>City</th>
                  <th>Total Orders</th>
                  <th>Lifetime Spent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
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
                          {c.name[0]}
                        </div>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} color="var(--color-secondary-text)" /> {c.email}
                      </div>
                      <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Phone size={12} color="var(--color-secondary-text)" /> {c.mobile}
                      </div>
                    </td>
                    <td>{c.registeredDate}</td>
                    <td style={{ fontWeight: 600 }}>{c.city}</td>
                    <td>
                      <span className="badge badge-info">{c.totalOrders} Orders</span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="badge badge-success">Verified Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-secondary-text)' }}>
              <Users size={44} style={{ opacity: 0.35, marginBottom: '12px', color: 'var(--color-primary-orange)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-dark-text)', marginBottom: '6px' }}>
                No Registered Customers Yet
              </h3>
              <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto' }}>
                When customers download the Flutter mobile app and create their accounts or place dry fruits & spices orders, their profiles will automatically appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

