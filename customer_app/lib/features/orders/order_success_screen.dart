import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/order_model.dart';
import '../../widgets/custom_button.dart';

class OrderSuccessScreen extends StatelessWidget {
  final CustomerOrder? order;

  const OrderSuccessScreen({super.key, this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: const BoxDecoration(
                  color: AppColors.successGreen,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(Icons.check_rounded, color: Colors.white, size: 64),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Order Placed Successfully!',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: AppColors.darkText,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Order ID: ${order?.id ?? "ORD-849201"}',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryOrange,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Thank you for choosing pure, natural dry fruits & spices. We are preparing your order fresh for dispatch.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.secondaryText,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 28),

              // Summary Card
              if (order != null)
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.creamBackground,
                    borderRadius: AppDimensions.roundedLarge,
                    border: Border.all(color: AppColors.lightBorder),
                    boxShadow: AppDimensions.cardShadow,
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Total Paid', style: GoogleFonts.inter(color: AppColors.secondaryText)),
                          Text(
                            CurrencyFormatter.format(order!.totalAmount),
                            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                      const Divider(height: 16, color: AppColors.lightBorder),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Payment Mode', style: GoogleFonts.inter(color: AppColors.secondaryText)),
                          Text(order!.paymentMethod, style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const Divider(height: 16, color: AppColors.lightBorder),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Delivery To', style: GoogleFonts.inter(color: AppColors.secondaryText)),
                          Text(
                            '${order!.customer.address.city}, ${order!.customer.address.pincode}',
                            style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 32),

              CustomButton(
                text: 'View Bill Receipt / Tax Invoice',
                icon: Icons.receipt_long_rounded,
                isOutlined: true,
                onPressed: () {
                  context.push('/order-receipt/${order?.id ?? "ORD-849201"}', extra: order);
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Track Order',
                icon: Icons.timeline_rounded,
                onPressed: () {
                  context.push('/order-tracking/${order?.id ?? "ORD-849201"}', extra: order);
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Continue Shopping',
                isOutlined: true,
                onPressed: () => context.go('/main'),
              ),
              const SizedBox(height: 10),
              TextButton.icon(
                icon: const Icon(Icons.repeat_rounded, size: 18, color: AppColors.primaryOrange),
                label: Text(
                  'View Quick Reorder List →',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryOrange,
                  ),
                ),
                onPressed: () => context.push('/quick-reorder'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

