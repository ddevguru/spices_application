'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import Coupons from '@/views/Coupons';

export default function CouponsPage() {
  return (
    <AdminShell>
      <Coupons />
    </AdminShell>
  );
}
