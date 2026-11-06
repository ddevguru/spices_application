'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Products from '@/views/Products';

export default function ProductsPage() {
  return (
    <AdminShell>
      <Products />
    </AdminShell>
  );
}
