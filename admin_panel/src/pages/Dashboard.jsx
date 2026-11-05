import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await mockApi.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !metrics) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard analytics...</div>;
  }

  const kpis = [
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      change: '+18.4% vs last mo',
      icon: DollarSign,
      color: '#FF812E',
      bg: 'rgba(255, 129, 46, 0.1)',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      change: '+12% new orders',
      icon: ShoppingCart,
      color: '#27865F',
      bg: 'rgba(39, 134, 95, 0.1)',
    },
    {
      title: 'Active Products',
      value: metrics.totalProducts,
      change: '4 Categories',
      icon: Package,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      title: 'Customers',
      value: metrics.totalCustomers,
      change: '+4 new this week',
      icon: Users,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
      title: 'Pending Fulfillment',
      value: metrics.pendingOrders,
      change: 'Requires dispatch',
      icon: Clock,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Low Stock Alert',
      value: metrics.lowStockCount,
      change: 'Below 15 units threshold',
      icon: AlertTriangle,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  return (
    <div>
      {/* Title & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Store Performance Overview</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Real-time sales, order volume, and weight inventory metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-info" style={{ padding: '8px 14px', fontSize: '12px' }}>
            Updated Just Now
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)' }}>
                  {kpi.title}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: kpi.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: kpi.color,
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} color="var(--color-success-green)" />
                {kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Sales Trend Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Sales Revenue Trend (₹)</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>Monthly performance metrics</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-success">Growth: +22%</span>
            </div>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.salesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF812E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF812E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E3D8" />
                <XAxis dataKey="month" stroke="#898078" fontSize={12} />
                <YAxis stroke="#898078" fontSize={12} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#FFF8EF', borderColor: '#F0E3D8', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#FF812E" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Sales Distribution */}
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Sales by Category</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>Market share breakdown</p>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categorySales}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {metrics.categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Orders</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>Latest orders placed across channels</p>
          </div>
          <a href="/orders" className="btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
            View All Orders
          </a>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Purchased Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 700 }}>{ord.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.customer?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>{ord.customer?.address?.city}</div>
                  </td>
                  <td>
                    {ord.items?.map((i, idx) => (
                      <span key={idx} style={{ display: 'block', fontSize: '12px' }}>
                        {i.quantity}x {i.productName} ({i.variantTitle})
                      </span>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{ord.totalAmount}</td>
                  <td>
                    <span className={`badge ${ord.status === 'Delivered' ? 'badge-success' : ord.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{ord.paymentMethod}</span>
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

