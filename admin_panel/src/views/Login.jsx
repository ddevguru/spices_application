'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@naturale.com');
  const [password, setPassword] = useState('admin123');
  const auth = useAuth();
  const login = auth?.login || (async () => false);
  const loading = auth?.loading || false;
  const error = auth?.error || null;
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-peach-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px 32px',
        }}
      >
        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-primary-orange)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(255, 129, 46, 0.35)',
            }}
          >
            N
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
            NATURALE ADMIN
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
            Store Management & Inventory Portal
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                placeholder="admin@naturale.com"
              />
              <Mail
                size={18}
                color="var(--color-secondary-text)"
                style={{ position: 'absolute', left: '14px', top: '12px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
              />
              <Lock
                size={18}
                color="var(--color-secondary-text)"
                style={{ position: 'absolute', left: '14px', top: '12px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div
          style={{
            marginTop: '28px',
            padding: '14px',
            backgroundColor: 'var(--color-cream-bg)',
            border: '1px solid var(--color-light-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--color-secondary-text)',
            textAlign: 'center',
          }}
        >
          <strong style={{ color: 'var(--color-dark-text)' }}>Demo Login:</strong> admin@naturale.com / admin123
        </div>
      </div>
    </div>
  );
}

