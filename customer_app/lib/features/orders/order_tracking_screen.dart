import 'dart:async';
import 'dart:convert';
import 'dart:math' show pi;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../models/order_model.dart';

class OrderTrackingScreen extends StatefulWidget {
  final CustomerOrder? order;
  final String orderId;

  const OrderTrackingScreen({
    super.key,
    required this.orderId,
    this.order,
  });

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  static const List<String> _stages = [
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  Map<String, dynamic>? _trackingData;
  Timer? _pollingTimer;
  String _currentStatus = 'Out for Delivery';
  String _deliveryOtp = '4821';
  Map<String, dynamic>? _assignedDriver;
  double _driverLat = 19.0760;
  double _driverLng = 72.8777;
  double _destLat = 19.0896;
  double _destLng = 72.8656;
  double _driverHeading = 45.0;
  double _driverSpeed = 24.0;
  bool _isLoading = true;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.order?.status ?? 'Out for Delivery';
    _fetchTrackingInfo();

    // Poll live GPS tracking every 4 seconds (Ola/Uber style)
    _pollingTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      _fetchTrackingInfo();
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchTrackingInfo() async {
    try {
      final res = await http.get(
        Uri.parse('https://dryfruits-api.onrender.com/api/orders/${widget.orderId}/tracking'),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && mounted) {
          setState(() {
            _trackingData = data;
            if (data['status'] != null) _currentStatus = data['status'];
            if (data['deliveryOtp'] != null) _deliveryOtp = data['deliveryOtp'];
            if (data['destLat'] != null) _destLat = (data['destLat']).toDouble();
            if (data['destLng'] != null) _destLng = (data['destLng']).toDouble();
            if (data['assignedDriver'] != null) {
              _assignedDriver = data['assignedDriver'];
              _driverLat = (_assignedDriver!['currentLat'] ?? 19.0760).toDouble();
              _driverLng = (_assignedDriver!['currentLng'] ?? 72.8777).toDouble();
              _driverHeading = (_assignedDriver!['heading'] ?? 45.0).toDouble();
              _driverSpeed = (_assignedDriver!['speed'] ?? 24.0).toDouble();
            }
            _isLoading = false;
          });
          return;
        }
      }
    } catch (_) {}

    // Fallback default driver tracking if offline
    if (mounted && _assignedDriver == null) {
      setState(() {
        _assignedDriver = {
          'id': 'DRV-101',
          'name': 'Rajesh Kumar',
          'phone': '9876543210',
          'vehicleType': 'Bike',
          'vehicleNumber': 'MH-04-AB-1234',
          'isOnline': true,
        };
        _isLoading = false;
      });
    }
  }

  int _getCurrentStageIndex(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 0;
      case 'processing':
        return 1;
      case 'packed':
        return 2;
      case 'shipped':
        return 3;
      case 'out for delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 4;
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentIdx = _getCurrentStageIndex(_currentStatus);

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text('Live Order Tracking', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchTrackingInfo,
            tooltip: 'Refresh Tracking',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Order Status Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.creamBackground,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.orderId,
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.darkText,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Estimated Delivery: 15 - 25 Mins',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrange.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      _currentStatus,
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryOrange,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 2. Secret Delivery OTP Card (To share with driver upon arrival)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF7ED),
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: const Color(0xFFFDBA74)),
                boxShadow: [
                  BoxShadow(color: const Color(0xFFEA580C).withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 3)),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.shield_outlined, color: AppColors.primaryOrange, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        '4-DIGIT DELIVERY VERIFICATION OTP',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryOrange,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: _deliveryOtp.split('').map((digit) {
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 6),
                        width: 44,
                        height: 50,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.primaryOrange, width: 1.5),
                          boxShadow: [
                            BoxShadow(color: AppColors.primaryOrange.withOpacity(0.15), blurRadius: 4, offset: const Offset(0, 2))
                          ],
                        ),
                        child: Center(
                          child: Text(
                            digit,
                            style: GoogleFonts.poppins(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: AppColors.darkText,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'ðŸ”’ Share this OTP only with the delivery partner upon arrival to confirm package handover.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9A3412)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 3. Live Moving Vehicle Map (Ola / Uber Style)
            Text(
              'Live Delivery Partner Movement (Free Map)',
              style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 8),

            Container(
              height: 290,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: ClipRRect(
                borderRadius: AppDimensions.roundedLarge,
                child: Stack(
                  children: [
                    // Real Interactive OpenStreetMap (100% Free, Same as Admin Panel)
                    FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCenter: LatLng(
                          (_driverLat + _destLat) / 2,
                          (_driverLng + _destLng) / 2,
                        ),
                        initialZoom: 13.0,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.all,
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.dryfruits.customer_app',
                        ),
                        PolylineLayer(
                          polylines: [
                            Polyline(
                              points: [
                                LatLng(_driverLat, _driverLng),
                                LatLng(_destLat, _destLng),
                              ],
                              strokeWidth: 7.0,
                              color: const Color(0xFF9A3412),
                            ),
                            Polyline(
                              points: [
                                LatLng(_driverLat, _driverLng),
                                LatLng(_destLat, _destLng),
                              ],
                              strokeWidth: 4.5,
                              color: const Color(0xFFEA580C),
                            ),
                          ],
                        ),
                        MarkerLayer(
                          markers: [
                            // Customer Destination Pin
                            Marker(
                              point: LatLng(_destLat, _destLng),
                              width: 72,
                              height: 58,
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(8),
                                      boxShadow: [
                                        BoxShadow(color: Colors.black.withOpacity(0.18), blurRadius: 4),
                                      ],
                                    ),
                                    child: const Text(
                                      '📍 You',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF111827),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Container(
                                    width: 22,
                                    height: 22,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFDC2626),
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2.5),
                                      boxShadow: [
                                        BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 4),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Live Moving Driver Vehicle
                            Marker(
                              point: LatLng(_driverLat, _driverLng),
                              width: 48,
                              height: 48,
                              child: Transform.rotate(
                                angle: _driverHeading * pi / 180.0,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withOpacity(0.25),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Container(
                                      width: 30,
                                      height: 30,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF111827),
                                        shape: BoxShape.circle,
                                        border: Border.all(color: const Color(0xFF10B981), width: 2.5),
                                      ),
                                      child: const Icon(
                                        Icons.navigation_rounded,
                                        color: Colors.white,
                                        size: 16,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Recenter Button
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Material(
                        color: Colors.white,
                        elevation: 3,
                        shape: const CircleBorder(),
                        child: IconButton(
                          icon: const Icon(Icons.my_location, color: AppColors.primaryOrange, size: 18),
                          onPressed: () {
                            try {
                              final bounds = LatLngBounds.fromPoints([
                                LatLng(_driverLat, _driverLng),
                                LatLng(_destLat, _destLng),
                              ]);
                              _mapController.fitCamera(
                                CameraFit.bounds(
                                  bounds: bounds,
                                  padding: const EdgeInsets.all(56),
                                ),
                              );
                            } catch (_) {
                              _mapController.move(LatLng(_driverLat, _driverLng), 13.5);
                            }
                          },
                          tooltip: 'Recenter Map',
                          constraints: const BoxConstraints.tightFor(width: 36, height: 36),
                          padding: EdgeInsets.zero,
                        ),
                      ),
                    ),

                    // Top ETA Floating Pill
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF111827).withOpacity(0.92),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.two_wheeler, color: AppColors.primaryOrange, size: 16),
                            const SizedBox(width: 6),
                            Text(
                              'On the way â€¢ 12 mins away',
                              style: GoogleFonts.inter(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Bottom OpenStreetMap attribution badge
                    Positioned(
                      bottom: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Â© OpenStreetMap (100% Free)',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Color(0xFF4B5563)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),

            // 4. Assigned Driver Card with Call Button
            if (_assignedDriver != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.creamBackground,
                  borderRadius: AppDimensions.roundedLarge,
                  border: Border.all(color: AppColors.lightBorder),
                  boxShadow: AppDimensions.cardShadow,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: const BoxDecoration(
                        color: AppColors.primaryOrange,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(Icons.person, color: Colors.white, size: 26),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                _assignedDriver!['name'] ?? 'Rajesh Kumar',
                                style: GoogleFonts.poppins(fontSize: 14.5, fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.successGreen.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'Verified',
                                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.successGreen),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${_assignedDriver!['vehicleType'] ?? 'Bike'} â€¢ ${_assignedDriver!['vehicleNumber'] ?? 'MH-04-AB-1234'}',
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                          ),
                        ],
                      ),
                    ),
                    IconButton.filled(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('ðŸ“ž Calling delivery partner: ${_assignedDriver!['phone']}...'),
                            backgroundColor: AppColors.primaryOrange,
                          ),
                        );
                      },
                      icon: const Icon(Icons.call, size: 20),
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.successGreen,
                        foregroundColor: Colors.white,
                      ),
                      tooltip: 'Call Driver',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // 5. Timeline Card
            Text(
              'Delivery Timeline',
              style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.creamBackground,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                children: List.generate(_stages.length, (index) {
                  final stage = _stages[index];
                  final isPassed = index <= currentIdx;
                  final isCurrent = index == currentIdx;
                  final isLast = index == _stages.length - 1;

                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: isPassed ? AppColors.primaryOrange : Colors.grey.shade200,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isCurrent ? AppColors.primaryOrange : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: Icon(
                              isPassed ? Icons.check : Icons.circle,
                              size: isPassed ? 15 : 7,
                              color: isPassed ? Colors.white : Colors.grey.shade500,
                            ),
                          ),
                          if (!isLast)
                            Container(
                              width: 2.5,
                              height: 38,
                              color: isPassed && index < currentIdx
                                  ? AppColors.primaryOrange
                                  : Colors.grey.shade300,
                            ),
                        ],
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 3, bottom: 18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                stage,
                                style: GoogleFonts.poppins(
                                  fontSize: 13.5,
                                  fontWeight: isPassed ? FontWeight.w700 : FontWeight.w500,
                                  color: isPassed ? AppColors.darkText : AppColors.secondaryText,
                                ),
                              ),
                              Text(
                                isPassed
                                    ? (isCurrent ? 'Active stage â€¢ Live tracking enabled' : 'Completed')
                                    : 'Upcoming checkpoint',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  color: isCurrent ? AppColors.primaryOrange : AppColors.secondaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),
            const SizedBox(height: 20),

            // 6. Delivery Address Box
            if (widget.order != null) ...[
              Text(
                'Delivery Address',
                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.darkText),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.creamBackground,
                  borderRadius: AppDimensions.roundedLarge,
                  border: Border.all(color: AppColors.lightBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.order!.customer.name,
                      style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.order!.customer.address.fullAddress,
                      style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.secondaryText, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton.icon(
                  onPressed: () {
                    context.push('/order-receipt/${widget.orderId}', extra: widget.order);
                  },
                  icon: const Icon(Icons.receipt_long_rounded, color: AppColors.primaryOrange, size: 18),
                  label: Text(
                    'View Bill Receipt / Tax Invoice',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryOrange,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primaryOrange, width: 1.5),
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
