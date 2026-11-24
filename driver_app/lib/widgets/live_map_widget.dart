import 'dart:math';
import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

class LiveMapWidget extends StatelessWidget {
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

  // Calculate distance in KM using Haversine formula
  double _calculateDistance() {
    const p = 0.017453292519943295; // Pi / 180
    final a = 0.5 -
        cos((destLat - currentLat) * p) / 2 +
        cos(currentLat * p) * cos(destLat * p) * (1 - cos((destLng - currentLng) * p)) / 2;
    return 12742 * asin(sqrt(a)); // 2 * R * asin...
  }

  @override
  Widget build(BuildContext context) {
    final distanceKm = _calculateDistance();
    final etaMinutes = (distanceKm / 25 * 60).round().clamp(2, 60);

    return Container(
      height: 320,
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
            // Interactive OpenStreetMap Canvas
            CustomPaint(
              size: Size.infinite,
              painter: _MapCanvasPainter(
                currentLat: currentLat,
                currentLng: currentLng,
                destLat: destLat,
                destLng: destLng,
                heading: heading,
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
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.map_outlined, size: 12, color: AppColors.primaryOrange),
                    SizedBox(width: 4),
                    Text(
                      '© OpenStreetMap (Free API)',
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
                        '${speed.round()} km/h',
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
            if (onToggleSimulation != null)
              Positioned(
                bottom: 12,
                left: 12,
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: onToggleSimulation,
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSimulating ? AppColors.onlineGreen : AppColors.primaryOrange,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: (isSimulating ? AppColors.onlineGreen : AppColors.primaryOrange).withOpacity(0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          )
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isSimulating ? Icons.pause_circle_filled : Icons.play_circle_fill,
                            color: Colors.white,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            isSimulating ? 'Vehicle Moving Live...' : 'Simulate Drive (Ola Style)',
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

class _MapCanvasPainter extends CustomPainter {
  final double currentLat;
  final double currentLng;
  final double destLat;
  final double destLng;
  final double heading;

  _MapCanvasPainter({
    required this.currentLat,
    required this.currentLng,
    required this.destLat,
    required this.destLng,
    required this.heading,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Map Background with realistic terrain & streets
    final bgPaint = Paint()..color = const Color(0xFFF4F1EA);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Green terrain park zones
    final parkPaint = Paint()..color = const Color(0xFFDCEAD4);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(20, 20, 100, 70), const Radius.circular(16)), parkPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width - 120, size.height - 110, 100, 80), const Radius.circular(20)), parkPaint);

    // Secondary streets (Light Gray)
    final secondaryRoadPaint = Paint()
      ..color = const Color(0xFFFFFFFF)
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke;

    final roadBorderPaint = Paint()
      ..color = const Color(0xFFE2DDD5)
      ..strokeWidth = 16
      ..style = PaintingStyle.stroke;

    final roadPath1 = Path()
      ..moveTo(0, size.height * 0.4)
      ..lineTo(size.width, size.height * 0.4);

    final roadPath2 = Path()
      ..moveTo(size.width * 0.3, 0)
      ..lineTo(size.width * 0.3, size.height);

    canvas.drawPath(roadPath1, roadBorderPaint);
    canvas.drawPath(roadPath1, secondaryRoadPaint);
    canvas.drawPath(roadPath2, roadBorderPaint);
    canvas.drawPath(roadPath2, secondaryRoadPaint);

    // Calculate screen points for Driver and Customer
    // Driver starts near bottom-left/center, Customer at top-right
    final driverPoint = Offset(size.width * 0.28, size.height * 0.68);
    final destPoint = Offset(size.width * 0.75, size.height * 0.28);

    // 2. Main Highway / Transit Route Polyline (Ola / Uber Orange Route)
    final routeBorderPaint = Paint()
      ..color = const Color(0xFF9A3412)
      ..strokeWidth = 9
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final routePaint = Paint()
      ..color = const Color(0xFFEA580C)
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final routePath = Path()
      ..moveTo(driverPoint.dx, driverPoint.dy)
      ..cubicTo(
        driverPoint.dx + 40, driverPoint.dy - 60,
        destPoint.dx - 60, destPoint.dy + 80,
        destPoint.dx, destPoint.dy,
      );

    canvas.drawPath(routePath, routeBorderPaint);
    canvas.drawPath(routePath, routePaint);

    // 3. Draw Customer Destination Pin (Red/Orange Map Pin)
    final pinCirclePaint = Paint()..color = const Color(0xFFDC2626);
    final pinInnerPaint = Paint()..color = Colors.white;

    // Destination Pulse ring
    final pulsePaint = Paint()
      ..color = const Color(0xFFDC2626).withOpacity(0.25)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(destPoint, 22, pulsePaint);

    canvas.drawCircle(destPoint, 12, pinCirclePaint);
    canvas.drawCircle(destPoint, 5, pinInnerPaint);

    // Destination Label Tag
    final textPainter = TextPainter(
      text: const TextSpan(
        text: '📍 Customer Shop',
        style: TextStyle(color: Color(0xFF111827), fontSize: 10, fontWeight: FontWeight.w800),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(canvas, Offset(destPoint.dx - 36, destPoint.dy - 30));

    // 4. Draw Driver Live Moving Vehicle (Bike/Car)
    canvas.save();
    canvas.translate(driverPoint.dx, driverPoint.dy);
    canvas.rotate((heading * pi / 180.0));

    // Vehicle radar pulse
    final vehiclePulse = Paint()
      ..color = const Color(0xFF10B981).withOpacity(0.3)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset.zero, 24, vehiclePulse);

    // Vehicle base circle
    final vehicleBg = Paint()..color = const Color(0xFF111827);
    canvas.drawCircle(Offset.zero, 16, vehicleBg);

    // Vehicle border (Green for online)
    final vehicleRing = Paint()
      ..color = const Color(0xFF10B981)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(Offset.zero, 16, vehicleRing);

    // Vehicle Arrow Indicator pointing towards direction of movement
    final arrowPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    final arrowPath = Path()
      ..moveTo(0, -9)
      ..lineTo(7, 7)
      ..lineTo(0, 3)
      ..lineTo(-7, 7)
      ..close();
    canvas.drawPath(arrowPath, arrowPaint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _MapCanvasPainter oldDelegate) {
    return oldDelegate.currentLat != currentLat ||
        oldDelegate.currentLng != currentLng ||
        oldDelegate.heading != heading ||
        oldDelegate.destLat != destLat ||
        oldDelegate.destLng != destLng;
  }
}

