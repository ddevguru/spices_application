'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Inventory from '@/views/Inventory';

export default function InventoryPage() {
  return (
    <AdminShell>
      <Inventory />
    </AdminShell>
  );
}
