'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Customers from '@/views/Customers';

export default function CustomersPage() {
  return (
    <AdminShell>
      <Customers />
    </AdminShell>
  );
}
