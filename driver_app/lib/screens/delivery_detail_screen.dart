import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../core/services/api_service.dart';
import '../models/driver_model.dart';
import '../models/delivery_model.dart';
import '../widgets/live_map_widget.dart';

class DeliveryDetailScreen extends StatefulWidget {
  final DeliveryOrder order;
  final DriverModel driver;

  const DeliveryDetailScreen({super.key, required this.order, required this.driver});

  @override
  State<DeliveryDetailScreen> createState() => _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends State<DeliveryDetailScreen> {
  late double _currentLat;
  late double _currentLng;
  late double _heading;
  late double _speed;
  bool _isSimulating = false;
  Timer? _simulationTimer;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _currentLat = widget.driver.currentLat;
    _currentLng = widget.driver.currentLng;
    _heading = widget.driver.heading > 0 ? widget.driver.heading : 45.0;
    _speed = widget.driver.speed > 0 ? widget.driver.speed : 24.0;
  }

  @override
  void dispose() {
    _simulationTimer?.cancel();
    super.dispose();
  }

  // Live Vehicle Movement Simulation (Ola / Uber Style)
  void _toggleSimulation() {
    if (_isSimulating) {
      _simulationTimer?.cancel();
      setState(() => _isSimulating = false);
    } else {
      setState(() => _isSimulating = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🚗 Live moving vehicle simulation started! Coordinates updating every 3s.'),
          backgroundColor: AppColors.onlineGreen,
          duration: Duration(seconds: 2),
        ),
      );

      // Step towards destination
      _simulationTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
        final dLat = widget.order.destLat - _currentLat;
        final dLng = widget.order.destLng - _currentLng;

        if (dLat.abs() < 0.0005 && dLng.abs() < 0.0005) {
          timer.cancel();
          setState(() {
            _isSimulating = false;
            _speed = 0.0;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('📍 Arrived at customer delivery destination!'),
              backgroundColor: AppColors.primaryOrange,
            ),
          );
          return;
        }

        // Move 8% closer each step
        setState(() {
          _currentLat += dLat * 0.08;
          _currentLng += dLng * 0.08;
          _heading = 45.0 + (timer.tick % 4) * 5.0;
          _speed = 28.0 + (timer.tick % 5) * 3.0;
        });

        widget.driver.currentLat = _currentLat;
        widget.driver.currentLng = _currentLng;
        widget.driver.heading = _heading;
        widget.driver.speed = _speed;

        // Stream live GPS heartbeat to backend
        await ApiService().sendLocationHeartbeat(
          driverId: widget.driver.id,
          lat: _currentLat,
          lng: _currentLng,
          heading: _heading,
          speed: _speed,
        );
      });
    }
  }

  Future<void> _handleMarkStatus(String newStatus) async {
    setState(() => _isSubmitting = true);
    final res = await ApiService().updateDeliveryStatus(
      orderId: widget.order.id,
      status: newStatus,
      driverId: widget.driver.id,
    );
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (res['success'] == true) {
      setState(() => widget.order.status = newStatus);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Order status updated to $newStatus'),
          backgroundColor: AppColors.onlineGreen,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Failed to update status'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Complete Delivery with Customer OTP Dialog
  Future<void> _openOtpVerificationDialog() async {
    final otpController = TextEditingController();
    String error = '';

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                children: [
                  const Icon(Icons.shield_rounded, color: AppColors.primaryOrange),
                  const SizedBox(width: 8),
                  Text('Verify Delivery OTP', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700)),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ask the customer for the 4-digit Delivery OTP shown in their Naturale App.',
                    style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 16),
                  if (error.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.all(8),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(8)),
                      child: Text(error, style: GoogleFonts.inter(color: Colors.red.shade900, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  TextField(
                    controller: otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 4,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 8),
                    decoration: InputDecoration(
                      hintText: '• • • •',
                      hintStyle: const TextStyle(letterSpacing: 8),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                  if (widget.order.deliveryOtp != null)
                    Center(
                      child: Text(
                        'Demo Customer OTP: ${widget.order.deliveryOtp}',
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.primaryOrange, fontWeight: FontWeight.w600),
                      ),
                    ),
                ],
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                ElevatedButton(
                  onPressed: () async {
                    final enteredOtp = otpController.text.trim();
                    if (enteredOtp.length != 4) {
                      setDialogState(() => error = 'Please enter full 4-digit OTP');
                      return;
                    }

                    final res = await ApiService().updateDeliveryStatus(
                      orderId: widget.order.id,
                      status: 'Delivered',
                      otp: enteredOtp,
                      driverId: widget.driver.id,
                      cashCollected: true,
                    );

                    if (res['success'] == true) {
                      Navigator.pop(ctx);
                      setState(() {
                        widget.order.status = 'Delivered';
                        widget.order.paymentStatus = 'Paid';
                      });
                      _showSuccessDialog();
                    } else {
                      setDialogState(() => error = res['message'] ?? 'Incorrect OTP. Ask customer again.');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.onlineGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Confirm Delivery'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_rounded, color: AppColors.onlineGreen, size: 64),
            const SizedBox(height: 14),
            Text('Delivery Completed!', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(
              'Wholesale order #${widget.order.id} marked as Delivered.\nCash collected successfully.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryOrange,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(double.infinity, 44),
              ),
              child: const Text('Return to Deliveries'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order #${widget.order.id}', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
            Text(widget.order.customerName, style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 14, top: 10, bottom: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: widget.order.status.toLowerCase() == 'delivered'
                  ? AppColors.onlineGreen.withOpacity(0.15)
                  : AppColors.primaryOrange.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                widget.order.status,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: widget.order.status.toLowerCase() == 'delivered' ? AppColors.onlineGreen : AppColors.primaryOrange,
                ),
              ),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Live Free OpenStreetMap Navigation Widget (Ola/Uber Moving Map)
            LiveMapWidget(
              currentLat: _currentLat,
              currentLng: _currentLng,
              destLat: widget.order.destLat,
              destLng: widget.order.destLng,
              heading: _heading,
              speed: _speed,
              vehicleType: widget.driver.vehicleType,
              isSimulating: _isSimulating,
              onToggleSimulation: _toggleSimulation,
            ),
            const SizedBox(height: 20),

            // 2. Customer Details Card with 1-Click Call Button
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.borderLight),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('CUSTOMER DETAILS', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primaryOrange, letterSpacing: 0.5)),
                          const SizedBox(height: 2),
                          Text(widget.order.customerName, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                        ],
                      ),

                      // 1-Click Phone Call Action
                      Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('📞 Dialing customer phone: ${widget.order.customerPhone}...'),
                                backgroundColor: AppColors.primaryOrange,
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppColors.onlineGreen.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.onlineGreen.withOpacity(0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.call, size: 16, color: AppColors.onlineGreen),
                                const SizedBox(width: 6),
                                Text(
                                  'Call Customer',
                                  style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.onlineGreen),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  // Delivery Address
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on, color: AppColors.primaryOrange, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.order.fullAddress, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark)),
                            if (widget.order.deliveryInstructions.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(8)),
                                child: Text('Note: ${widget.order.deliveryInstructions}', style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF1E40AF))),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 3. Wholesale Dry Fruits Order Items List
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('PACKAGE ITEMS (${widget.order.items.length})', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
                  const SizedBox(height: 12),
                  ...widget.order.items.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(color: const Color(0xFFFFF7ED), borderRadius: BorderRadius.circular(8)),
                              child: const Icon(Icons.inventory_2_outlined, color: AppColors.primaryOrange, size: 16),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.productName, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                                Text('${item.variantTitle} • ${item.quantity} packs', style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted)),
                              ],
                            ),
                          ],
                        ),
                        Text('₹${(item.price * item.quantity).round()}', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                      ],
                    ),
                  )),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Amount to Collect:', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700)),
                      Text(
                        '₹${widget.order.totalAmount.round()} (${widget.order.paymentMethod})',
                        style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primaryOrange),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4. Action Buttons (Dispatch Lifecycle)
            if (widget.order.status.toLowerCase() != 'delivered') ...[
              if (widget.order.status.toLowerCase() != 'out for delivery')
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: _isSubmitting ? null : () => _handleMarkStatus('Out for Delivery'),
                      icon: const Icon(Icons.local_shipping_outlined, color: AppColors.primaryOrange),
                      label: Text('Mark Picked Up from Hub', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryOrange)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primaryOrange, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _openOtpVerificationDialog,
                  icon: const Icon(Icons.verified_user_rounded, color: Colors.white),
                  label: Text(
                    'Complete Delivery (Verify OTP)',
                    style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.onlineGreen,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),
            ] else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFF86EFAC))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle, color: AppColors.onlineGreen, size: 20),
                    const SizedBox(width: 8),
                    Text('Order Successfully Delivered & Verified', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: const Color(0xFF166534))),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
