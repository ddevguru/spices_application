'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Orders from '@/views/Orders';

export default function OrdersPage() {
  return (
    <AdminShell>
      <Orders />
    </AdminShell>
  );
}
