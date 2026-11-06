'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Categories from '@/views/Categories';

export default function CategoriesPage() {
  return (
    <AdminShell>
      <Categories />
    </AdminShell>
  );
}
