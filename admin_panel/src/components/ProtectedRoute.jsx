'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { adminUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !adminUser) {
      router.replace('/login');
    }
  }, [adminUser, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF5ED',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid #FDBA74',
            borderTopColor: '#EA580C',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#7C726F' }}>
          Verifying Naturale Admin Session...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF5ED',
          gap: '16px',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#EA580C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '24px',
          }}
        >
          N
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2B2321' }}>
          Please Sign In to Access Admin
        </h2>
        <a
          href="/login"
          style={{
            padding: '10px 24px',
            backgroundColor: '#EA580C',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Go to Login
        </a>
      </div>
    );
  }

  return children;
}

