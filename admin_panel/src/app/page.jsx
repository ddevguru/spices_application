'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Dashboard from '@/views/Dashboard';

export default function DashboardPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}
