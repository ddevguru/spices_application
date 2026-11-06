'use client';

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF5ED',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '18px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#2B2625',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#7C726F',
                marginBottom: '20px',
              }}
            >
              {this.state.error?.message ||
                'An unexpected error occurred while rendering this page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                if (typeof window !== 'undefined') window.location.reload();
              }}
              style={{
                backgroundColor: '#FF7A00',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
