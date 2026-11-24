'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import {
  Truck,
  Users,
  Navigation,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Bike,
  Car,
  Key,
  X,
  Send,
  Eye,
  Radio,
  Clock,
  Compass,
  Edit2,
  Trash2,
  ShieldAlert,
  Ban,
  Check,
  SlidersHorizontal,
  Package,
  Calendar,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, online, offline
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Manage Driver state (combines assigned orders and profile/vehicle editing)
  const [showManageModal, setShowManageModal] = useState(false);
  const [managingDriver, setManagingDriver] = useState(null);
  const [manageTab, setManageTab] = useState('orders'); // 'orders' or 'edit'
  const [manageAssignOrderId, setManageAssignOrderId] = useState('');
  const [manageAssignLoading, setManageAssignLoading] = useState(false);
  const [orderActionLoading, setOrderActionLoading] = useState(null);
  const [manageSuccessMsg, setManageSuccessMsg] = useState('');

  // Edit Driver state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    licenseNumber: '',
    password: '',
    isActive: true,
    isOnline: false
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Driver state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state for new driver
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    licenseNumber: '',
    password: 'driver123'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 19.0760, lng: 72.8777, zoom: 12 });
  const [activeMarker, setActiveMarker] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [driversData, ordersData] = await Promise.all([
        mockApi.getDrivers(),
        mockApi.getOrders()
      ]);
      setDrivers(driversData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Live polling for driver GPS location heartbeat every 4 seconds (Ola/Uber style)
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newDriver.name || !newDriver.phone || !newDriver.vehicleNumber) {
      setFormError('Please fill in Name, Phone, and Vehicle Number.');
      return;
    }

    try {
      setFormLoading(true);
      await mockApi.createDriver(newDriver);
      setShowAddModal(false);
      setNewDriver({
        name: '',
        phone: '',
        email: '',
        vehicleType: 'Bike',
        vehicleNumber: '',
        licenseNumber: '',
        password: 'driver123'
      });
      await loadData();
    } catch (err) {
      setFormError(typeof err === 'string' ? err : err.message || 'Failed to create driver');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleOnline = async (driver) => {
    try {
      await mockApi.updateDriver(driver.id, { isOnline: !driver.isOnline });
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, isOnline: !d.isOnline } : d));
    } catch (err) {
      alert('Failed to update driver status');
    }
  };

  const handleOpenAssignModal = (driver) => {
    setAssigningDriver(driver);
    setSelectedOrderId('');
    setShowAssignModal(true);
  };

  const handleAssignOrder = async () => {
    if (!selectedOrderId || !assigningDriver) return;
    try {
      setAssignLoading(true);
      const res = await mockApi.assignOrderToDriver(selectedOrderId, assigningDriver.id);
      alert(`Success! Order #${selectedOrderId} assigned to ${assigningDriver.name}.\nCustomer Delivery OTP: ${res.deliveryOtp || 'Generated'}`);
      setShowAssignModal(false);
      await loadData();
    } catch (err) {
      alert('Failed to assign order: ' + err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleOpenManageModal = (driver, initialTab = 'orders') => {
    setManagingDriver(driver);
    setEditingDriver(driver);
    setManageTab(initialTab);
    setManageAssignOrderId('');
    setManageSuccessMsg('');
    setEditError('');
    setEditForm({
      name: driver.name || '',
      phone: driver.phone || '',
      email: driver.email || '',
      vehicleType: driver.vehicleType || driver.vehicle_type || 'Bike',
      vehicleNumber: driver.vehicleNumber || driver.vehicle_number || '',
      licenseNumber: driver.licenseNumber || driver.license_number || '',
      password: '',
      isActive: driver.isActive !== false,
      isOnline: driver.isOnline === true
    });
    setShowManageModal(true);
  };

  const handleOpenEditModal = (driver) => {
    handleOpenManageModal(driver, 'edit');
  };

  const handleUpdateDriverFromManage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setEditError('');
    setManageSuccessMsg('');
    if (!editForm.name || !editForm.phone || !editForm.vehicleNumber) {
      setEditError('Please fill in Name, Phone, and Vehicle Number.');
      return;
    }
    try {
      setEditLoading(true);
      await mockApi.updateDriver(managingDriver.id, editForm);
      setManageSuccessMsg('Driver profile & vehicle details updated successfully!');
      setManagingDriver(prev => ({ ...prev, ...editForm }));
      setDrivers(prev => prev.map(d => d.id === managingDriver.id ? { ...d, ...editForm } : d));
      await loadData();
      setTimeout(() => setManageSuccessMsg(''), 4000);
    } catch (err) {
      setEditError(typeof err === 'string' ? err : err.message || 'Failed to update driver');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAssignOrderInManage = async () => {
    if (!manageAssignOrderId || !managingDriver) return;
    try {
      setManageAssignLoading(true);
      const res = await mockApi.assignOrderToDriver(manageAssignOrderId, managingDriver.id);
      setManageSuccessMsg(`Order #${manageAssignOrderId} dispatched to ${managingDriver.name}! OTP: ${res?.deliveryOtp || '8421'}`);
      setManageAssignOrderId('');
      await loadData();
      setTimeout(() => setManageSuccessMsg(''), 5000);
    } catch (err) {
      alert('Failed to assign order: ' + err);
    } finally {
      setManageAssignLoading(false);
    }
  };

  const handleMarkOrderDelivered = async (orderId) => {
    try {
      setOrderActionLoading(orderId);
      await mockApi.updateOrderStatus(orderId, 'Delivered');
      setManageSuccessMsg(`Order #${orderId} marked as Delivered!`);
      await loadData();
      setTimeout(() => setManageSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to update status: ' + err);
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleUnassignOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to unassign Order #${orderId} from ${managingDriver?.name || 'driver'}?`)) return;
    try {
      setOrderActionLoading(orderId);
      await mockApi.unassignOrderFromDriver(orderId);
      setManageSuccessMsg(`Order #${orderId} unassigned from driver.`);
      await loadData();
      setTimeout(() => setManageSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to unassign order: ' + err);
    } finally {
      setOrderActionLoading(null);
    }
  };

  const getCustomerName = (o) => o?.customer?.name || o?.customer_name || (typeof o?.customer === 'string' ? o.customer : 'Valued Customer');
  const getCustomerPhone = (o) => o?.customer?.phone || o?.customer_phone || '';
  const getCustomerAddress = (o) => {
    const addr = o?.customer?.address || o?.shipping_address || o?.address;
    if (!addr) return 'Address not provided';
    if (typeof addr === 'string') return addr;
    return [addr.street, addr.city, addr.pincode].filter(Boolean).join(', ');
  };
  const getOrderTotal = (o) => o?.totalAmount || o?.total_amount || o?.total || 0;

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.name || !editForm.phone || !editForm.vehicleNumber) {
      setEditError('Please fill in Name, Phone, and Vehicle Number.');
      return;
    }
    try {
      setEditLoading(true);
      await mockApi.updateDriver(editingDriver.id, editForm);
      setShowEditModal(false);
      await loadData();
    } catch (err) {
      setEditError(typeof err === 'string' ? err : err.message || 'Failed to update driver');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDeleteModal = (driver) => {
    setDeletingDriver(driver);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDriver) return;
    try {
      setDeleteLoading(true);
      await mockApi.deleteDriver(deletingDriver.id);
      if (selectedDriver?.id === deletingDriver.id) {
        setSelectedDriver(null);
      }
      setShowDeleteModal(false);
      await loadData();
    } catch (err) {
      alert('Failed to delete driver: ' + err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (driver) => {
    try {
      const nextStatus = driver.isActive === false ? true : false;
      await mockApi.updateDriver(driver.id, { isActive: nextStatus });
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, isActive: nextStatus } : d));
    } catch (err) {
      alert('Failed to update account status');
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.phone.includes(search) ||
                          (d.vehicleNumber && d.vehicleNumber.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterStatus === 'online') return d.isOnline;
    if (filterStatus === 'offline') return !d.isOnline;
    return true;
  });

  const onlineDriversCount = drivers.filter(d => d.isOnline).length;
  const totalActiveDeliveries = drivers.reduce((acc, d) => acc + (d.activeDeliveries || 0), 0);

  // Unassigned orders eligible for dispatch
  const assignableOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status) && !o.driver_id && !o.driverId);

  return (
    <div style={{ padding: '24px 32px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#EA580C', padding: '10px', borderRadius: '12px', color: 'white' }}>
              <Truck size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Delivery Fleet & Drivers Management
              </h1>
              <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '3px 0 0' }}>
                Track live delivery partner GPS locations, monitor status, and assign wholesale orders.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <RefreshCw size={15} /> Refresh Fleet GPS
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
            }}
          >
            <Plus size={16} /> Add New Driver
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #F3EAE0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Total Drivers</span>
            <Users size={20} color="#EA580C" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>{drivers.length}</div>
          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>Registered Fleet Accounts</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #F3EAE0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Online & On Duty</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
              <Radio size={18} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>{onlineDriversCount}</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Active GPS heartbeat streaming</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #F3EAE0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Active Deliveries</span>
            <Navigation size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#3B82F6' }}>{totalActiveDeliveries}</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>In Transit to Customers</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #F3EAE0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Live Map Engine</span>
            <ShieldCheck size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>OpenStreetMap</div>
          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '4px', fontWeight: 700 }}>100% Free • ₹0 API Cost</div>
        </div>
      </div>

      {/* Interactive Free OpenStreetMap Live Radar */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #F3EAE0', padding: '20px', marginBottom: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} color="#EA580C" />
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Live Fleet Radar Map (Real-Time Moving Coordinates)
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>
              Showing live positions of delivery drivers. Click any driver to view current speed, vehicle and route.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Online Driver
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#9CA3AF' }} /> Offline Driver
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EA580C', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA580C' }} /> Store / Drop Point
            </span>
          </div>
        </div>

        {/* Free Map Canvas / Interactive Tile Frame */}
        <div style={{ position: 'relative', height: '420px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', backgroundColor: '#F8F9FA' }}>
          {/* OpenStreetMap Tile Background Frame */}
          <iframe
            title="OpenStreetMap Live Fleet View"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.12}%2C${mapCenter.lat - 0.08}%2C${mapCenter.lng + 0.12}%2C${mapCenter.lat + 0.08}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lng}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />

          {/* Live Overlay Marker HUD */}
          <div style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB',
            maxWidth: '280px',
            zIndex: 10
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              LIVE RADAR TRACKING
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '4px 0' }}>
              {selectedDriver ? selectedDriver.name : `${onlineDriversCount} Drivers Active on Road`}
            </div>
            {selectedDriver ? (
              <div style={{ fontSize: '11.5px', color: '#4B5563', lineHeight: '1.4' }}>
                <div><strong>Vehicle:</strong> {selectedDriver.vehicleType} ({selectedDriver.vehicleNumber})</div>
                <div><strong>Speed:</strong> {selectedDriver.speed || '24'} km/h</div>
                <div><strong>Coords:</strong> {selectedDriver.currentLat?.toFixed(4)}, {selectedDriver.currentLng?.toFixed(4)}</div>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenAssignModal(selectedDriver)}
                    style={{
                      width: '100%',
                      padding: '7px',
                      backgroundColor: '#EA580C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Truck size={13} /> Assign Delivery Order
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenManageModal(selectedDriver)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#1D4ED8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <SlidersHorizontal size={12} /> Manage
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(selectedDriver)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        backgroundColor: '#FEE2E2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                Click any driver from the list below to focus on their live vehicle movement on the map.
              </div>
            )}
          </div>

          {/* Live Driver Floating HUD Chips on bottom */}
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            zIndex: 10
          }}>
            {drivers.map(drv => (
              <div
                key={drv.id}
                onClick={() => {
                  setSelectedDriver(drv);
                  setMapCenter({ lat: drv.currentLat || 19.0760, lng: drv.currentLng || 72.8777, zoom: 14 });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: selectedDriver?.id === drv.id ? '#111827' : 'rgba(255, 255, 255, 0.95)',
                  color: selectedDriver?.id === drv.id ? '#FFFFFF' : '#111827',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: drv.isOnline ? '#10B981' : '#9CA3AF'
                }} />
                <span>{drv.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>({drv.vehicleNumber})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drivers List & Management Section */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #F3EAE0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {/* Table Filters & Search */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3EAE0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
              All Delivery Partners ({filteredDrivers.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '3px 0 0' }}>
              ↔️ Scroll table horizontally to view all driver management columns and actions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search driver by name, phone, plate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '8px 14px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '13px',
                  width: '260px',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline Only</option>
            </select>
          </div>
        </div>

        {/* Drivers Table with Full Smooth Horizontal Scrolling */}
        <div style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          scrollbarWidth: 'thin',
          display: 'block'
        }}>
          <table style={{
            width: '100%',
            minWidth: '1380px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF5ED', borderBottom: '1px solid #F3EAE0', color: '#6B7280', fontWeight: 700, whiteSpace: 'nowrap' }}>
                <th style={{ padding: '14px 20px', minWidth: '220px' }}>Driver Profile</th>
                <th style={{ padding: '14px 20px', minWidth: '200px' }}>Contact Details</th>
                <th style={{ padding: '14px 20px', minWidth: '200px' }}>Vehicle Info</th>
                <th style={{ padding: '14px 20px', minWidth: '150px' }}>Duty Status</th>
                <th style={{ padding: '14px 20px', minWidth: '140px' }}>Account Access</th>
                <th style={{ padding: '14px 20px', minWidth: '130px' }}>Active Orders</th>
                <th style={{ padding: '14px 20px', minWidth: '180px' }}>Live GPS Coordinates</th>
                <th style={{ padding: '14px 24px', minWidth: '340px', textAlign: 'right' }}>Management Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No drivers found. Click "+ Add New Driver" to register a driver account.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    style={{
                      borderBottom: '1px solid #F3EAE0',
                      backgroundColor: selectedDriver?.id === driver.id ? '#FFF9F5' : 'transparent',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#FFEDD5',
                          color: '#EA580C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '15px',
                          flexShrink: 0
                        }}>
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#111827', fontSize: '13.5px' }}>{driver.name}</div>
                          <div style={{ fontSize: '11px', color: '#EA580C', fontWeight: 700, fontFamily: 'monospace' }}>
                            ID: {driver.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <a
                        href={`tel:${driver.phone}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#111827', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}
                      >
                        <Phone size={14} color="#EA580C" /> {driver.phone}
                      </a>
                      {driver.email && (
                        <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '3px' }}>
                          {driver.email}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#374151' }}>
                        {driver.vehicleType === 'Van' || driver.vehicleType === 'Tata Ace' ? <Car size={15} color="#4B5563" /> : <Bike size={15} color="#4B5563" />}
                        {driver.vehicleType}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        fontSize: '11.5px',
                        color: '#C2410C',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        backgroundColor: '#FFF7ED',
                        border: '1px solid #FFEDD5',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        marginTop: '3px'
                      }}>
                        {driver.vehicleNumber}
                      </div>
                      {driver.licenseNumber && (
                        <div style={{ fontSize: '10.5px', color: '#9CA3AF', marginTop: '2px' }}>DL: {driver.licenseNumber}</div>
                      )}
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleToggleOnline(driver)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: driver.isOnline ? '#DCFCE7' : '#F3F4F6',
                          color: driver.isOnline ? '#166534' : '#6B7280'
                        }}
                      >
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: driver.isOnline ? '#10B981' : '#9CA3AF'
                        }} />
                        {driver.isOnline ? 'Online (On Duty)' : 'Offline'}
                      </button>
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleToggleActive(driver)}
                        title="Click to toggle Active / Suspended access"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: driver.isActive !== false ? '#EFF6FF' : '#FEE2E2',
                          color: driver.isActive !== false ? '#1E40AF' : '#991B1B'
                        }}
                      >
                        {driver.isActive !== false ? <ShieldCheck size={14} color="#2563EB" /> : <Ban size={14} color="#DC2626" />}
                        {driver.isActive !== false ? 'Active' : 'Suspended'}
                      </button>
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        backgroundColor: driver.activeDeliveries > 0 ? '#EFF6FF' : '#F3F4F6',
                        color: driver.activeDeliveries > 0 ? '#1D4ED8' : '#6B7280',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '12.5px',
                        display: 'inline-block'
                      }}>
                        {driver.activeDeliveries || 0} Orders
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '12.5px', color: '#111827', fontFamily: 'monospace', fontWeight: 600 }}>
                        {driver.currentLat ? `${driver.currentLat.toFixed(4)}, ${driver.currentLng.toFixed(4)}` : '19.0760, 72.8777'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        Speed: {driver.speed || '24'} km/h
                      </div>
                    </td>

                    <td style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setMapCenter({ lat: driver.currentLat || 19.0760, lng: driver.currentLng || 72.8777, zoom: 14 });
                          }}
                          title="Focus on Map"
                          style={{
                            padding: '7px 12px',
                            backgroundColor: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#374151',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Navigation size={13} /> Track
                        </button>

                        <button
                          onClick={() => handleOpenAssignModal(driver)}
                          title="Assign Delivery Order"
                          style={{
                            padding: '7px 14px',
                            backgroundColor: '#EA580C',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.2)'
                          }}
                        >
                          <Truck size={13} /> Assign
                        </button>

                        <button
                          onClick={() => handleOpenManageModal(driver)}
                          title="Manage Driver Profile & Assigned Orders"
                          style={{
                            padding: '7px 12px',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#1D4ED8',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <SlidersHorizontal size={13} /> Manage
                        </button>

                        <button
                          onClick={() => handleOpenDeleteModal(driver)}
                          title="Delete Driver Account"
                          style={{
                            padding: '7px 12px',
                            backgroundColor: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW DRIVER */}
      {showAddModal && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #F3EAE0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF5ED'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#EA580C" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  Create Delivery Driver Account
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} style={{ padding: '24px' }}>
              {formError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  marginBottom: '16px',
                  fontWeight: 600
                }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Full Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="driver@naturale.com"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Vehicle Type *
                  </label>
                  <select
                    value={newDriver.vehicleType}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', backgroundColor: 'white' }}
                  >
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="Scooter">Scooter / Activa</option>
                    <option value="Electric Bike">EV 2-Wheeler</option>
                    <option value="Tata Ace">Tata Ace / Chhota Hathi</option>
                    <option value="Van">Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-04-AB-1234"
                    value={newDriver.vehicleNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleNumber: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Driving License No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-MH0420210089"
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    App Login Password
                  </label>
                  <input
                    type="password"
                    placeholder="Initial password"
                    value={newDriver.password}
                    onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#EA580C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                  }}
                >
                  {formLoading ? 'Creating Driver...' : 'Create Driver Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN ORDER TO DRIVER */}
      {showAssignModal && assigningDriver && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #F3EAE0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF5ED'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  Assign Wholesale Delivery
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Assigning to: <strong>{assigningDriver.name}</strong> ({assigningDriver.vehicleType} • {assigningDriver.vehicleNumber})
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  Select Order for Dispatch:
                </label>

                {assignableOrders.length === 0 ? (
                  <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px', fontSize: '12.5px', color: '#6B7280', textAlign: 'center' }}>
                    No unassigned pending orders available at this moment.
                  </div>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    {assignableOrders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOrderId(o.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F3F4F6',
                          backgroundColor: selectedOrderId === o.id ? '#FFF7ED' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                            Order #{o.id}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {o.customer?.name} ({o.customer?.phone}) • ₹{o.totalAmount}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                            {o.customer?.address?.street || o.customer?.address?.city || 'Navi Mumbai'}
                          </div>
                        </div>

                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: selectedOrderId === o.id ? '5px solid #EA580C' : '2px solid #D1D5DB'
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '12px', color: '#1E40AF', marginBottom: '20px' }}>
                ℹ️ Once assigned, a 4-digit Delivery OTP will be generated. The customer will see the driver's vehicle and OTP in their app.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!selectedOrderId || assignLoading}
                  onClick={handleAssignOrder}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedOrderId ? '#EA580C' : '#9CA3AF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: selectedOrderId ? 'pointer' : 'not-allowed',
                    boxShadow: selectedOrderId ? '0 4px 12px rgba(234, 88, 12, 0.25)' : 'none'
                  }}
                >
                  {assignLoading ? 'Dispatching...' : 'Confirm & Dispatch to Driver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE DRIVER (ASSIGNED ORDERS + EDIT PROFILE & VEHICLE) */}
      {(showManageModal && managingDriver) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '860px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #F3EAE0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#FAF5ED',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#EA580C',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                }}>
                  {managingDriver.name ? managingDriver.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                      {managingDriver.name}
                    </h3>
                    <span style={{
                      fontSize: '11.5px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      backgroundColor: '#F3F4F6',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      color: '#4B5563'
                    }}>
                      ID: {managingDriver.id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: managingDriver.isOnline ? '#DEF7EC' : '#F3F4F6',
                      color: managingDriver.isOnline ? '#03543F' : '#6B7280',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: managingDriver.isOnline ? '#10B981' : '#9CA3AF'
                      }} />
                      {managingDriver.isOnline ? 'Online (On Duty)' : 'Offline'}
                    </span>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: managingDriver.isActive !== false ? '#E0F2FE' : '#FEE2E2',
                      color: managingDriver.isActive !== false ? '#0369A1' : '#991B1B'
                    }}>
                      {managingDriver.isActive !== false ? 'Active' : 'Suspended'}
                    </span>

                    <span style={{ fontSize: '12px', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Bike size={13} /> {managingDriver.vehicleType || 'Bike'} • <strong>{managingDriver.vehicleNumber || 'No plate'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowManageModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              padding: '0 24px',
              gap: '12px',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => { setManageTab('orders'); setManageSuccessMsg(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: manageTab === 'orders' ? '#EA580C' : '#6B7280',
                  borderBottom: manageTab === 'orders' ? '3px solid #EA580C' : '3px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Package size={17} />
                <span>Assigned Orders & Deliveries</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: manageTab === 'orders' ? '#FFF7ED' : '#F3F4F6',
                  color: manageTab === 'orders' ? '#EA580C' : '#6B7280'
                }}>
                  {orders.filter(o => o.driver_id === managingDriver.id || o.driverId === managingDriver.id).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setManageTab('edit'); setManageSuccessMsg(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: manageTab === 'edit' ? '#EA580C' : '#6B7280',
                  borderBottom: manageTab === 'edit' ? '3px solid #EA580C' : '3px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Edit2 size={16} />
                <span>Edit Profile & Vehicle</span>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, backgroundColor: '#FAFAF9' }}>
              {manageSuccessMsg && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#DEF7EC',
                  border: '1px solid #84E1BC',
                  color: '#03543F',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} color="#0E9F6E" />
                  <span>{manageSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: ASSIGNED ORDERS */}
              {manageTab === 'orders' && (
                <div>
                  {/* Summary Metric Cards */}
                  {(() => {
                    const myOrders = orders.filter(o => o.driver_id === managingDriver.id || o.driverId === managingDriver.id);
                    const activeCount = myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
                    const deliveredCount = myOrders.filter(o => o.status === 'Delivered').length;

                    return (
                      <>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '12px',
                          marginBottom: '20px'
                        }}>
                          <div style={{ backgroundColor: '#FFFFFF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Total Assigned Orders</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{myOrders.length}</div>
                          </div>

                          <div style={{ backgroundColor: '#FFFFFF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>In Transit / Active</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>{activeCount}</div>
                          </div>

                          <div style={{ backgroundColor: '#FFFFFF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Completed Deliveries</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{deliveredCount}</div>
                          </div>
                        </div>

                        {/* Quick Assign Dropdown */}
                        <div style={{
                          backgroundColor: '#FFFFFF',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid #E5E7EB',
                          marginBottom: '20px'
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                            ⚡ Quick Assign Order to {managingDriver.name}:
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <select
                              value={manageAssignOrderId}
                              onChange={(e) => setManageAssignOrderId(e.target.value)}
                              style={{
                                flex: 1,
                                minWidth: '240px',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                border: '1px solid #D1D5DB',
                                fontSize: '13px',
                                backgroundColor: 'white'
                              }}
                            >
                              <option value="">-- Select an unassigned pending order --</option>
                              {assignableOrders.map(o => (
                                <option key={o.id} value={o.id}>
                                  Order #{o.id} • {getCustomerName(o)} • ₹{getOrderTotal(o)} ({o.status || 'Pending'})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              disabled={!manageAssignOrderId || manageAssignLoading}
                              onClick={handleAssignOrderInManage}
                              style={{
                                padding: '9px 18px',
                                backgroundColor: manageAssignOrderId ? '#EA580C' : '#9CA3AF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: manageAssignOrderId ? 'pointer' : 'not-allowed',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Truck size={14} />
                              {manageAssignLoading ? 'Assigning...' : 'Assign to Driver'}
                            </button>
                          </div>
                          {assignableOrders.length === 0 && (
                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                              All active customer orders are currently assigned to drivers.
                            </div>
                          )}
                        </div>

                        {/* List of Orders assigned to this Driver */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                            Assigned Deliveries List ({myOrders.length}):
                          </div>

                          {myOrders.length === 0 ? (
                            <div style={{
                              backgroundColor: '#FFFFFF',
                              padding: '36px 20px',
                              borderRadius: '12px',
                              border: '1px dashed #D1D5DB',
                              textAlign: 'center',
                              color: '#6B7280'
                            }}>
                              <Package size={36} color="#9CA3AF" style={{ margin: '0 auto 10px' }} />
                              <div style={{ fontWeight: 700, fontSize: '14px', color: '#374151' }}>No orders currently assigned</div>
                              <div style={{ fontSize: '12.5px', marginTop: '4px' }}>
                                Use the selector above to assign a pending customer order to this driver.
                              </div>
                            </div>
                          ) : (
                            myOrders.map(ord => {
                              const isDelivered = ord.status === 'Delivered';
                              const custName = getCustomerName(ord);
                              const custPhone = getCustomerPhone(ord);
                              const custAddr = getCustomerAddress(ord);
                              const total = getOrderTotal(ord);
                              const otp = ord.delivery_otp || ord.deliveryOtp || '8421';

                              return (
                                <div
                                  key={ord.id}
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    padding: '16px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                  }}
                                >
                                  {/* Order Header */}
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                    borderBottom: '1px solid #F3F4F6',
                                    paddingBottom: '10px',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                                        Order #{ord.id}
                                      </span>
                                      <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '3px 9px',
                                        borderRadius: '999px',
                                        backgroundColor: isDelivered ? '#DEF7EC' : '#E0F2FE',
                                        color: isDelivered ? '#03543F' : '#1E429F'
                                      }}>
                                        {ord.status || 'Out for Delivery'}
                                      </span>
                                    </div>

                                    {/* Delivery OTP Badge */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      backgroundColor: '#FEF3C7',
                                      padding: '4px 10px',
                                      borderRadius: '8px',
                                      border: '1px solid #FDE68A'
                                    }}>
                                      <Key size={13} color="#B45309" />
                                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', letterSpacing: '0.5px' }}>
                                        Delivery OTP: {otp}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Order Details Body */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '12.5px' }}>
                                    <div>
                                      <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700 }}>CUSTOMER</div>
                                      <div style={{ fontWeight: 700, color: '#111827', marginTop: '2px' }}>{custName}</div>
                                      {custPhone && (
                                        <div style={{ color: '#4B5563', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Phone size={11} color="#6B7280" />
                                          <a href={`tel:${custPhone}`} style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 600 }}>
                                            {custPhone}
                                          </a>
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700 }}>DELIVERY ADDRESS</div>
                                      <div style={{ color: '#374151', marginTop: '2px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                        <MapPin size={12} color="#6B7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span>{custAddr}</span>
                                      </div>
                                    </div>

                                    <div>
                                      <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700 }}>TOTAL AMOUNT</div>
                                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                                        ₹{total}
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                                        {ord.payment_method || ord.paymentMethod || 'COD'} • {ord.payment_status || 'Pending'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Items Summary */}
                                  {Array.isArray(ord.items) && ord.items.length > 0 && (
                                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #F3F4F6', fontSize: '12px', color: '#4B5563' }}>
                                      <span style={{ fontWeight: 700, color: '#374151' }}>Items: </span>
                                      {ord.items.map((it, idx) => (
                                        <span key={idx}>
                                          {it.title || it.name || 'Item'} (x{it.quantity || 1})
                                          {idx < ord.items.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Action Buttons for this Order */}
                                  <div style={{
                                    marginTop: '14px',
                                    paddingTop: '10px',
                                    borderTop: '1px solid #F3F4F6',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '8px',
                                    alignItems: 'center'
                                  }}>
                                    {!isDelivered ? (
                                      <>
                                        <button
                                          type="button"
                                          disabled={orderActionLoading === ord.id}
                                          onClick={() => handleUnassignOrder(ord.id)}
                                          style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid #FCA5A5',
                                            color: '#DC2626',
                                            borderRadius: '6px',
                                            fontSize: '11.5px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                        >
                                          <X size={12} />
                                          {orderActionLoading === ord.id ? 'Updating...' : 'Unassign'}
                                        </button>

                                        <button
                                          type="button"
                                          disabled={orderActionLoading === ord.id}
                                          onClick={() => handleMarkOrderDelivered(ord.id)}
                                          style={{
                                            padding: '6px 14px',
                                            backgroundColor: '#10B981',
                                            border: 'none',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '11.5px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)'
                                          }}
                                        >
                                          <CheckCircle2 size={13} />
                                          {orderActionLoading === ord.id ? 'Marking...' : 'Mark Delivered'}
                                        </button>
                                      </>
                                    ) : (
                                      <span style={{
                                        fontSize: '11.5px',
                                        fontWeight: 700,
                                        color: '#059669',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <CheckCircle2 size={13} /> Order Delivered Successfully
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: EDIT PROFILE & VEHICLE */}
              {manageTab === 'edit' && (
                <form onSubmit={handleUpdateDriverFromManage}>
                  {editError && (
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: '#FEE2E2',
                      border: '1px solid #FCA5A5',
                      color: '#991B1B',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      marginBottom: '16px',
                      fontWeight: 600
                    }}>
                      {editError}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Driver Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Vehicle Type *
                      </label>
                      <select
                        value={editForm.vehicleType}
                        onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', backgroundColor: 'white' }}
                      >
                        <option value="Bike">Motorcycle / Bike</option>
                        <option value="Scooter">Scooter / Activa</option>
                        <option value="Electric Bike">EV 2-Wheeler</option>
                        <option value="Tata Ace">Tata Ace / Chhota Hathi</option>
                        <option value="Van">Delivery Van</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Vehicle Plate Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.vehicleNumber}
                        onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        License Number (DL)
                      </label>
                      <input
                        type="text"
                        value={editForm.licenseNumber}
                        onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Reset App Password (Leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Account Status
                      </label>
                      <select
                        value={editForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', backgroundColor: 'white' }}
                      >
                        <option value="true">Active (Allowed to Login & Deliver)</option>
                        <option value="false">Suspended / Blocked (Access Denied)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        Duty Status
                      </label>
                      <select
                        value={editForm.isOnline ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isOnline: e.target.value === 'true' })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', backgroundColor: 'white' }}
                      >
                        <option value="true">Online (On Duty)</option>
                        <option value="false">Offline (Off Duty)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setShowManageModal(false)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={editLoading}
                      style={{
                        padding: '10px 22px',
                        backgroundColor: '#EA580C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                      }}
                    >
                      {editLoading ? 'Saving Changes...' : 'Save Driver Details'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE DRIVER CONFIRMATION */}
      {showDeleteModal && deletingDriver && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={28} />
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                Delete Driver Account?
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{deletingDriver.name}</strong> ({deletingDriver.vehicleType} • {deletingDriver.vehicleNumber})?
              </p>

              <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#9A3412', marginBottom: '20px', textAlign: 'left' }}>
                ⚠️ This driver will be permanently removed from the fleet system and will no longer be able to log in to the Naturale Driver App.
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleConfirmDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

