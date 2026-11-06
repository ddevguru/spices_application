'use client';

import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminShell({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}
