import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../models/order_model.dart';

class OrderTrackingScreen extends StatelessWidget {
  final CustomerOrder? order;
  final String orderId;

  const OrderTrackingScreen({
    super.key,
    required this.orderId,
    this.order,
  });

  static const List<String> _stages = [
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

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
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = order?.status ?? 'Processing';
    final currentIdx = _getCurrentStageIndex(status);

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text('Track Order', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Header Banner
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.creamBackground,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        orderId,
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.darkText,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryOrange.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          status,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryOrange,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Estimated Delivery: Within 24-48 Hours',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Timeline Card
            Text(
              'Delivery Timeline',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(20),
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
                      // Step Indicator (Circle + Line)
                      Column(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
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
                              size: isPassed ? 16 : 8,
                              color: isPassed ? Colors.white : Colors.grey.shade500,
                            ),
                          ),
                          if (!isLast)
                            Container(
                              width: 3,
                              height: 44,
                              color: isPassed && index < currentIdx
                                  ? AppColors.primaryOrange
                                  : Colors.grey.shade300,
                            ),
                        ],
                      ),
                      const SizedBox(width: 16),

                      // Text
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 4, bottom: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                stage,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: isPassed ? FontWeight.w700 : FontWeight.w500,
                                  color: isPassed ? AppColors.darkText : AppColors.secondaryText,
                                ),
                              ),
                              Text(
                                isPassed
                                    ? (isCurrent ? 'Currently active stage' : 'Completed')
                                    : 'Pending dispatch checkpoint',
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
            const SizedBox(height: 24),

            // Delivery Address Box
            if (order != null) ...[
              Text(
                'Shipping To',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
              ),
              const SizedBox(height: 10),
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
                      order!.customer.name,
                      style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      order!.customer.address.fullAddress,
                      style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText, height: 1.4),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Phone: ${order!.customer.phone}',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () {
                    context.push('/order-receipt/$orderId', extra: order);
                  },
                  icon: const Icon(Icons.receipt_long_rounded, color: AppColors.primaryOrange),
                  label: Text(
                    'View Bill Receipt / Tax Invoice',
                    style: GoogleFonts.poppins(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryOrange,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primaryOrange, width: 1.5),
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
