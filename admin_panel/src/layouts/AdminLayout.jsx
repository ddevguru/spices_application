'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Grid,
  ShoppingCart,
  Users,
  Ticket,
  Image as ImageIcon,
  Settings,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { adminUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: Grid },
    { label: 'Inventory', path: '/inventory', icon: Boxes },
    { label: 'Orders', path: '/orders', icon: ShoppingCart },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Coupons', path: '/coupons', icon: Ticket },
    { label: 'Banners', path: '/banners', icon: ImageIcon },
    { label: 'Store Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF4ED' }}>
      {/* Fixed Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--color-light-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--color-light-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '20px',
            }}
          >
            N
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-dark-text)', letterSpacing: '0.5px' }}>
              NATURALE
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', fontWeight: 500 }}>
              Admin Management Console
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-secondary-text)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '8px 12px',
            }}
          >
            Core Operations
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '4px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary-orange)' : 'var(--color-dark-text)',
                  backgroundColor: isActive ? 'var(--color-light-peach)' : 'transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Session Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--color-light-border)',
            backgroundColor: '#FFFDFB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
              SM
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {adminUser?.name || 'Store Manager'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                {adminUser?.email || 'admin@naturale.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header
          style={{
            height: 'var(--header-height)',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-light-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Header Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '360px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FAF4ED',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                width: '100%',
                border: '1px solid var(--color-light-border)',
              }}
            >
              <Search size={16} color="var(--color-secondary-text)" />
              <input
                type="text"
                placeholder="Search orders, products, SKUs..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Right Header Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'rgba(39, 134, 95, 0.1)',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                color: 'var(--color-success-green)',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={14} />
              Live Store Connected
            </div>

            {/* Notification Bell */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#FAF4ED',
                border: '1px solid var(--color-light-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <Bell size={18} color="var(--color-dark-text)" />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-orange)',
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main style={{ padding: '32px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

