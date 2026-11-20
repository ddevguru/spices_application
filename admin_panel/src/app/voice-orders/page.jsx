'use client';

import React from 'react';
import AdminShell from '@/components/AdminShell';
import VoiceOrders from '@/views/VoiceOrders';

export default function VoiceOrdersPage() {
  return (
    <AdminShell>
      <VoiceOrders />
    </AdminShell>
  );
}
