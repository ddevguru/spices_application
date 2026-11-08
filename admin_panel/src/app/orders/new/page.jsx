'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import CreateOrder from '@/views/CreateOrder';

export default function NewOrderPage() {
  return (
    <AdminShell>
      <CreateOrder />
    </AdminShell>
  );
}
