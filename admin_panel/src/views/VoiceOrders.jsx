'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockApi } from '../services/mockApi';
import {
  Headphones,
  PhoneCall,
  PhoneIncoming,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShoppingBag,
  ArrowRight,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Play,
  Volume2,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export default function VoiceOrders() {
  const router = useRouter();

  // Data States
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    draftOrdersGenerated: 0,
    ordersAwaitingReview: 0,
    callsRequiringHumanIntervention: 0
  });
  const [drafts, setDrafts] = useState([]);
  const [calls, setCalls] = useState([]);
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' or 'calls'
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load Metrics & Drafts
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, draftsList] = await Promise.all([
        mockApi.getVoiceDashboardMetrics(),
        mockApi.getVoiceDraftOrders('all')
      ]);

      if (dashRes && dashRes.metrics) {
        setMetrics(dashRes.metrics);
        setCalls(dashRes.calls || []);
      }
      if (Array.isArray(draftsList)) {
        setDrafts(draftsList);
      }
    } catch (err) {
      console.error('Failed to load voice orders dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Poll every 5 seconds for new incoming AI calls
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Drafts
  const filteredDrafts = drafts.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      d.customerName?.toLowerCase().includes(term) ||
      d.customerPhone?.includes(term) ||
      d.businessName?.toLowerCase().includes(term) ||
      d.id?.toLowerCase().includes(term);

    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered Calls
  const filteredCalls = calls.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.callerPhone?.includes(term) ||
      c.customerName?.toLowerCase().includes(term) ||
      c.businessName?.toLowerCase().includes(term) ||
      c.id?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#FFF7ED',
                border: '1px solid #FED7AA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-orange)'
              }}
            >
              <Headphones size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                AI Voice Orders & Wholesale Calls
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                Self-Hosted Asterisk PBX + AI Voice Agent • Automated Draft Orders Awaiting Admin Confirmation
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadDashboardData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-dark-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <Link
            href="/create-order"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary-orange)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(255, 129, 46, 0.3)'
            }}
          >
            Take Manual Order
          </Link>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {/* Metric 1: Total Calls */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>
              Total AI Calls
            </span>
            <PhoneIncoming size={16} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-dark-text)', marginTop: '8px' }}>
            {metrics.totalCalls}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Inbound wholesale phone calls
          </div>
        </div>

        {/* Metric 2: Successful Calls */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>
              Successful Calls
            </span>
            <CheckCircle2 size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>
            {metrics.successfulCalls}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Completed conversations
          </div>
        </div>

        {/* Metric 3: Failed / Incomplete */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>
              Failed / Incomplete
            </span>
            <AlertCircle size={16} color="#EF4444" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#EF4444', marginTop: '8px' }}>
            {metrics.failedCalls}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Dropped / silent calls
          </div>
        </div>

        {/* Metric 4: Draft Orders Generated */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>
              Drafts Generated
            </span>
            <FileText size={16} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#8B5CF6', marginTop: '8px' }}>
            {metrics.draftOrdersGenerated}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Auto-created by AI voice agent
          </div>
        </div>

        {/* Metric 5: Awaiting Admin Review */}
        <div style={{ ...metricCardStyle, border: '1.5px solid var(--color-primary-orange)', backgroundColor: '#FFFDF9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-orange)', textTransform: 'uppercase' }}>
              Awaiting Review
            </span>
            <Clock size={16} color="var(--color-primary-orange)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-orange)', marginTop: '8px' }}>
            {metrics.ordersAwaitingReview}
          </div>
          <div style={{ fontSize: '11px', color: '#C2410C', marginTop: '4px', fontWeight: 600 }}>
            ⚡ Requires Admin 1-Click Approval
          </div>
        </div>

        {/* Metric 6: Human Intervention Required */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary-text)', textTransform: 'uppercase' }}>
              Human Help Needed
            </span>
            <AlertTriangle size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#F59E0B', marginTop: '8px' }}>
            {metrics.callsRequiringHumanIntervention}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Transferred / flagged calls
          </div>
        </div>
      </div>

      {/* Main Tabs: AI Draft Orders vs Call History */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        {/* Navigation Tabs Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FAFAFA',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('drafts')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'drafts' ? 'var(--color-primary-orange)' : 'transparent',
                color: activeTab === 'drafts' ? '#FFFFFF' : 'var(--color-dark-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={15} /> AI Draft Orders ({drafts.length})
            </button>

            <button
              onClick={() => setActiveTab('calls')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'calls' ? 'var(--color-primary-orange)' : 'transparent',
                color: activeTab === 'calls' ? '#FFFFFF' : 'var(--color-dark-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PhoneCall size={15} /> Telephony Call Log ({calls.length})
            </button>
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '6px 12px'
              }}
            >
              <Search size={14} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Search by customer, phone, shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
                  width: '220px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Content 1: Draft Orders */}
        {activeTab === 'drafts' && (
          <div>
            {filteredDrafts.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
                <Headphones size={42} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>No AI Draft Orders Found</h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  When customer phone calls are received, the AI agent will transcribe order details and place drafts here for admin review.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '11.5px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 20px' }}>Draft ID & Source</th>
                      <th style={{ padding: '12px 16px' }}>Shopkeeper & Store</th>
                      <th style={{ padding: '12px 16px' }}>Contact Phone</th>
                      <th style={{ padding: '12px 16px' }}>Order Items</th>
                      <th style={{ padding: '12px 16px' }}>Grand Total</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrafts.map((draft) => {
                      const isPending = draft.status === 'pending_admin_review';
                      return (
                        <tr
                          key={draft.id}
                          style={{
                            borderBottom: '1px solid #F3F4F6',
                            backgroundColor: isPending ? '#FFFDF9' : '#FFFFFF'
                          }}
                        >
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-dark-text)' }}>{draft.id}</div>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                marginTop: '4px'
                              }}
                            >
                              <Sparkles size={10} /> AI Voice Call
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#111827' }}>{draft.customerName}</div>
                            <div style={{ fontSize: '11.5px', color: '#6B7280' }}>{draft.businessName || 'Kirana Store'}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{draft.shippingAddress?.city || 'Navi Mumbai'}</div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>
                              +91 {draft.customerPhone}
                            </div>
                            {draft.gstNumber && (
                              <div style={{ fontSize: '10.5px', color: '#6B7280', marginTop: '2px' }}>
                                GST: {draft.gstNumber}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#1F2937' }}>
                              {draft.items?.length || 0} product(s)
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#6B7280', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {draft.items?.map((it) => `${it.productName} (${it.variantTitle || it.weightInGrams + 'g'} x ${it.quantity})`).join(', ')}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                              ₹{draft.totalAmount || draft.subtotal || 0}
                            </div>
                            {draft.discount > 0 && (
                              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                                -₹{draft.discount} wholesale discount
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            {isPending ? (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Clock size={11} /> Pending Review
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#DCFCE7',
                                  color: '#15803D',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <CheckCircle2 size={11} /> Confirmed (#{draft.orderId || 'Order'})
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => router.push(`/create-order?draftId=${draft.id}`)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                backgroundColor: isPending ? 'var(--color-primary-orange)' : '#F3F4F6',
                                color: isPending ? '#FFFFFF' : '#374151',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {isPending ? (
                                <>
                                  Review & Confirm <ArrowRight size={13} />
                                </>
                              ) : (
                                <>
                                  View Form <ChevronRight size={13} />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Call Log History */}
        {activeTab === 'calls' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '11.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 20px' }}>Call ID</th>
                  <th style={{ padding: '12px 16px' }}>Caller Phone</th>
                  <th style={{ padding: '12px 16px' }}>Identified Customer</th>
                  <th style={{ padding: '12px 16px' }}>Duration</th>
                  <th style={{ padding: '12px 16px' }}>Call Status</th>
                  <th style={{ padding: '12px 16px' }}>Transcript</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Draft Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((call) => (
                  <tr key={call.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, fontFamily: 'monospace' }}>
                      {call.id}
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      +91 {call.callerPhone}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{call.customerName || 'Shopkeeper'}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{call.businessName || 'Wholesale Inquirer'}</div>
                    </td>

                    <td style={{ padding: '12px 16px', color: '#4B5563' }}>
                      {call.durationSeconds ? `${call.durationSeconds}s` : 'In Progress'}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: call.status === 'completed' ? '#DCFCE7' : call.status === 'in_progress' ? '#DBEAFE' : '#FEE2E2',
                          color: call.status === 'completed' ? '#15803D' : call.status === 'in_progress' ? '#1E40AF' : '#991B1B'
                        }}
                      >
                        {call.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {call.transcript ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTranscript({ caller: call.callerPhone, text: call.transcript })}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary-orange)',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MessageSquare size={13} /> View Transcript
                        </button>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: '11px' }}>No transcript</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      {call.draftOrderId ? (
                        <button
                          onClick={() => router.push(`/create-order?draftId=${call.draftOrderId}`)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#F3F4F6',
                            border: '1px solid #D1D5DB',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Open Draft (#{call.draftOrderId.slice(-6)})
                        </button>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: '11px' }}>No draft</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {selectedTranscript && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                Call Transcript (+91 {selectedTranscript.caller})
              </h3>
              <button
                onClick={() => setSelectedTranscript(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#F9FAFB',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                maxHeight: '350px',
                overflowY: 'auto',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#1F2937'
              }}
            >
              {selectedTranscript.text}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setSelectedTranscript(null)}
                className="btn-primary"
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const metricCardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  padding: '18px 20px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
};
