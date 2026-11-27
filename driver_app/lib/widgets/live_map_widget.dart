import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import '../core/constants/app_colors.dart';

class LiveMapWidget extends StatefulWidget {
  final double currentLat;
  final double currentLng;
  final double destLat;
  final double destLng;
  final double heading;
  final double speed;
  final String vehicleType;
  final bool isSimulating;
  final VoidCallback? onToggleSimulation;

  const LiveMapWidget({
    super.key,
    required this.currentLat,
    required this.currentLng,
    required this.destLat,
    required this.destLng,
    this.heading = 45.0,
    this.speed = 24.0,
    this.vehicleType = 'Bike',
    this.isSimulating = false,
    this.onToggleSimulation,
  });

  @override
  State<LiveMapWidget> createState() => _LiveMapWidgetState();
}

class _LiveMapWidgetState extends State<LiveMapWidget> {
  final MapController _mapController = MapController();

  @override
  void didUpdateWidget(covariant LiveMapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSimulating &&
        (oldWidget.currentLat != widget.currentLat ||
            oldWidget.currentLng != widget.currentLng)) {
      try {
        _mapController.move(
          LatLng(widget.currentLat, widget.currentLng),
          _mapController.camera.zoom,
        );
      } catch (_) {}
    }
  }

  void _recenterMap() {
    try {
      final bounds = LatLngBounds.fromPoints([
        LatLng(widget.currentLat, widget.currentLng),
        LatLng(widget.destLat, widget.destLng),
      ]);
      _mapController.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.all(64),
        ),
      );
    } catch (_) {
      _mapController.move(LatLng(widget.currentLat, widget.currentLng), 13.5);
    }
  }

  // Calculate distance in KM using Haversine formula
  double _calculateDistance() {
    const p = 0.017453292519943295; // Pi / 180
    final a = 0.5 -
        cos((widget.destLat - widget.currentLat) * p) / 2 +
        cos(widget.currentLat * p) *
            cos(widget.destLat * p) *
            (1 - cos((widget.destLng - widget.currentLng) * p)) /
            2;
    return 12742 * asin(sqrt(a));
  }

  @override
  Widget build(BuildContext context) {
    final distanceKm = _calculateDistance();
    final etaMinutes = (distanceKm / 25 * 60).round().clamp(2, 60);
    final driverPoint = LatLng(widget.currentLat, widget.currentLng);
    final destPoint = LatLng(widget.destLat, widget.destLng);
    final midLat = (widget.currentLat + widget.destLat) / 2;
    final midLng = (widget.currentLng + widget.destLng) / 2;

    return Container(
      height: 340,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFE5E7EB),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            // Real Interactive OpenStreetMap (100% Free, Same as Admin Panel)
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: LatLng(midLat, midLng),
                initialZoom: 12.8,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.all,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.dryfruits.driver_app',
                ),
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: [driverPoint, destPoint],
                      strokeWidth: 7.0,
                      color: const Color(0xFF9A3412),
                    ),
                    Polyline(
                      points: [driverPoint, destPoint],
                      strokeWidth: 4.5,
                      color: const Color(0xFFEA580C),
                    ),
                  ],
                ),
                MarkerLayer(
                  markers: [
                    // Customer Destination Pin
                    Marker(
                      point: destPoint,
                      width: 110,
                      height: 64,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withOpacity(0.18), blurRadius: 4),
                              ],
                            ),
                            child: const Text(
                              'Customer Shop',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF111827),
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: const Color(0xFFDC2626),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2.5),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 4),
                              ],
                            ),
                            child: const Center(
                              child: Icon(Icons.storefront, size: 12, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Live Moving Driver Vehicle Marker
                    Marker(
                      point: driverPoint,
                      width: 52,
                      height: 52,
                      child: Transform.rotate(
                        angle: widget.heading * pi / 180.0,
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.25),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: const Color(0xFF111827),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF10B981), width: 2.5),
                                boxShadow: [
                                  BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 6),
                                ],
                              ),
                              child: const Icon(
                                Icons.navigation_rounded,
                                color: Colors.white,
                                size: 18,
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

            // Recenter Map Button
            Positioned(
              bottom: 44,
              right: 12,
              child: Material(
                color: Colors.white,
                elevation: 3,
                shape: const CircleBorder(),
                child: IconButton(
                  icon: const Icon(Icons.my_location, color: AppColors.primaryOrange, size: 20),
                  onPressed: _recenterMap,
                  tooltip: 'Recenter Map',
                  constraints: const BoxConstraints.tightFor(width: 40, height: 40),
                  padding: EdgeInsets.zero,
                ),
              ),
            ),

            // Free Map Watermark Badge (100% Free OpenStreetMap)
            Positioned(
              bottom: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.92),
                  borderRadius: BorderRadius.circular(6),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.map_outlined, size: 12, color: AppColors.primaryOrange),
                    SizedBox(width: 4),
                    Text(
                      '© OpenStreetMap',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF374151)),
                    ),
                  ],
                ),
              ),
            ),

            // Top HUD: Speed & Distance Banner (Ola/Uber Style)
            Positioned(
              top: 14,
              left: 14,
              right: 14,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.darkBackground.withOpacity(0.92),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10)
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.primaryOrange.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.navigation, color: AppColors.primaryOrange, size: 18),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '$etaMinutes MINS AWAY',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              '${distanceKm.toStringAsFixed(1)} KM to customer store',
                              style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 11),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.onlineGreen.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.onlineGreen.withOpacity(0.4)),
                      ),
                      child: Text(
                        '${widget.speed.round()} km/h',
                        style: const TextStyle(
                          color: AppColors.onlineGreen,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Simulation Control Floating Action Button
            if (widget.onToggleSimulation != null)
              Positioned(
                bottom: 12,
                left: 12,
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: widget.onToggleSimulation,
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: widget.isSimulating ? AppColors.onlineGreen : AppColors.primaryOrange,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: (widget.isSimulating ? AppColors.onlineGreen : AppColors.primaryOrange).withOpacity(0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          )
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            widget.isSimulating ? Icons.pause_circle_filled : Icons.play_circle_fill,
                            color: Colors.white,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            widget.isSimulating ? 'Vehicle Moving Live...' : 'Simulate Drive (Ola Style)',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
