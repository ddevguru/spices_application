import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../core/services/api_service.dart';
import '../models/driver_model.dart';
import '../models/delivery_model.dart';
import 'delivery_detail_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  final DriverModel driver;

  const HomeScreen({super.key, required this.driver});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late bool _isOnline;
  List<DeliveryOrder> _deliveries = [];
  bool _isLoading = true;
  Timer? _gpsTimer;

  @override
  void initState() {
    super.initState();
    _isOnline = widget.driver.isOnline;
    _loadDeliveries();

    // Start background GPS heartbeat streaming every 5 seconds if online
    if (_isOnline) {
      _startGpsHeartbeat();
    }
  }

  @override
  void dispose() {
    _gpsTimer?.cancel();
    super.dispose();
  }

  void _startGpsHeartbeat() {
    _gpsTimer?.cancel();
    _gpsTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      if (_isOnline) {
        await ApiService().sendLocationHeartbeat(
          driverId: widget.driver.id,
          lat: widget.driver.currentLat,
          lng: widget.driver.currentLng,
          heading: widget.driver.heading,
          speed: widget.driver.speed > 0 ? widget.driver.speed : 24.0,
        );
      }
    });
  }

  Future<void> _loadDeliveries() async {
    setState(() => _isLoading = true);
    final list = await ApiService().getAssignedDeliveries(widget.driver.id);
    if (!mounted) return;
    setState(() {
      _deliveries = list;
      _isLoading = false;
    });
  }

  Future<void> _toggleOnlineStatus(bool val) async {
    setState(() => _isOnline = val);
    widget.driver.isOnline = val;
    await ApiService().updateStatus(widget.driver.id, val);

    if (val) {
      _startGpsHeartbeat();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🟢 You are ONLINE on duty! GPS heartbeat streaming active.'),
          backgroundColor: AppColors.onlineGreen,
          duration: Duration(seconds: 2),
        ),
      );
    } else {
      _gpsTimer?.cancel();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚪ You are OFFLINE. Deliveries paused.'),
          backgroundColor: AppColors.darkCard,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Sign Out', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to end duty and sign out?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ApiService().logout();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeOrders = _deliveries.where((d) => d.status.toLowerCase() != 'delivered').toList();
    final completedOrders = _deliveries.where((d) => d.status.toLowerCase() == 'delivered').toList();
    final cashCollected = completedOrders
        .where((d) => d.paymentMethod.toLowerCase().contains('cod') || d.paymentMethod.toLowerCase().contains('cash'))
        .fold<double>(0.0, (acc, item) => acc + item.totalAmount);

    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppColors.primaryOrange.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.two_wheeler, color: AppColors.primaryOrange, size: 22),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.driver.name, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                Text('${widget.driver.vehicleType} • ${widget.driver.vehicleNumber}', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textDark),
            onPressed: _loadDeliveries,
            tooltip: 'Refresh Deliveries',
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.textMuted),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDeliveries,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Online / Offline Duty Switch Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: _isOnline ? AppColors.onlineGreen.withOpacity(0.3) : AppColors.borderLight,
                    width: _isOnline ? 1.5 : 1,
                  ),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3))
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: _isOnline ? AppColors.onlineGreen : AppColors.offlineGray,
                            shape: BoxShape.circle,
                            boxShadow: _isOnline
                                ? [BoxShadow(color: AppColors.onlineGreen.withOpacity(0.5), blurRadius: 8, spreadRadius: 2)]
                                : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isOnline ? 'Online (Ready for Dispatch)' : 'Offline (Off Duty)',
                              style: GoogleFonts.poppins(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w700,
                                color: _isOnline ? AppColors.onlineGreen : AppColors.textMuted,
                              ),
                            ),
                            Text(
                              _isOnline ? 'GPS Heartbeat streaming active' : 'Turn on duty switch to receive deliveries',
                              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Switch.adaptive(
                      value: _isOnline,
                      activeColor: AppColors.onlineGreen,
                      onChanged: _toggleOnlineStatus,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Metrics Row
              Row(
                children: [
                  Expanded(
                    child: _buildMetricTile(
                      label: 'Active Deliveries',
                      value: '${activeOrders.length}',
                      icon: Icons.local_shipping_outlined,
                      color: AppColors.primaryOrange,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricTile(
                      label: 'Completed',
                      value: '${completedOrders.length}',
                      icon: Icons.check_circle_outline,
                      color: AppColors.onlineGreen,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricTile(
                      label: 'Cash Collected',
                      value: '₹${cashCollected.round()}',
                      icon: Icons.currency_rupee,
                      color: AppColors.accentAmber,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Assigned Deliveries Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Assigned Wholesale Orders (${activeOrders.length})',
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark),
                  ),
                  if (activeOrders.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.primaryOrange.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
                      child: Text(
                        'Priority Delivery',
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),

              if (_isLoading)
                const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator(color: AppColors.primaryOrange)))
              else if (activeOrders.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.task_alt_rounded, size: 48, color: AppColors.onlineGreen),
                      const SizedBox(height: 12),
                      Text('No Pending Deliveries', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                      const SizedBox(height: 4),
                      Text('New wholesale orders assigned by admin will appear here instantly.', textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: activeOrders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final order = activeOrders[index];
                    return _buildOrderCard(order);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricTile({required String label, required String value, required IconData icon, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 8),
          Text(value, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textDark)),
          Text(label, style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildOrderCard(DeliveryOrder order) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 3))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            await Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => DeliveryDetailScreen(order: order, driver: widget.driver)),
            );
            _loadDeliveries();
          },
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Order ID + Status
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Order #${order.id}',
                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryOrange.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        order.status,
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Customer details
                Text(order.customerName, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                const SizedBox(height: 4),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on_outlined, size: 16, color: AppColors.primaryOrange),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        order.fullAddress,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF4B5563)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Items summary pill & Total Amount
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: const Color(0xFFFAF5ED), borderRadius: BorderRadius.circular(10)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${order.items.length} items (${order.items.fold<int>(0, (sum, i) => sum + i.quantity)} packs)',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textDark),
                      ),
                      Text(
                        'Total: ₹${order.totalAmount.round()} (${order.paymentMethod})',
                        style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primaryOrange),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Action Button: Open Live Navigation
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => DeliveryDetailScreen(order: order, driver: widget.driver)),
                      );
                      _loadDeliveries();
                    },
                    icon: const Icon(Icons.navigation, size: 16),
                    label: Text('Open Live Navigation & Deliver', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryOrange,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
