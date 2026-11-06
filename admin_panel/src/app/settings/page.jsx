'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Settings from '@/views/Settings';

export default function SettingsPage() {
  return (
    <AdminShell>
      <Settings />
    </AdminShell>
  );
}
