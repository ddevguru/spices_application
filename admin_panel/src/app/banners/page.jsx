'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Banners from '@/views/Banners';

export default function BannersPage() {
  return (
    <AdminShell>
      <Banners />
    </AdminShell>
  );
}
