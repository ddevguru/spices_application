import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/order_model.dart';
import '../../providers/order_provider.dart';
import '../../widgets/app_image.dart';

class MyOrdersScreen extends ConsumerWidget {
  const MyOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(orderProvider);

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text(
          'My Orders',
          style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
        ),
      ),
      body: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.receipt_long_outlined, size: 64, color: AppColors.secondaryText),
                  const SizedBox(height: 16),
                  Text(
                    'No orders placed yet',
                    style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your order history will appear here once you place an order.',
                    style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: orders.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final order = orders[index];
              return _buildOrderCard(context, order);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading orders: $err')),
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, CustomerOrder order) {
    Color statusColor;
    switch (order.status.toLowerCase()) {
      case 'delivered':
        statusColor = AppColors.successGreen;
        break;
      case 'cancelled':
        statusColor = Colors.red;
        break;
      default:
        statusColor = AppColors.primaryOrange;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.creamBackground,
        borderRadius: AppDimensions.roundedLarge,
        border: Border.all(color: AppColors.lightBorder),
        boxShadow: AppDimensions.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    order.id,
                    style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.darkText),
                  ),
                  Text(
                    'Placed on ${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year}',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  order.status,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: AppColors.lightBorder),

          // Items Preview
          ...order.items.map((item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: SizedBox(
                        width: 40,
                        height: 40,
                        child: AppImage(imagePath: item.image, fit: BoxFit.cover),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productName,
                            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${item.variantTitle} × ${item.quantity}',
                            style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      CurrencyFormatter.format(item.total),
                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              )),
          const Divider(height: 20, color: AppColors.lightBorder),

          // Footer Total & Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Total Amount', style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText)),
                  Text(
                    CurrencyFormatter.format(order.totalAmount),
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.darkText),
                  ),
                ],
              ),
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: () {
                      context.push('/order-receipt/${order.id}', extra: order);
                    },
                    icon: const Icon(Icons.receipt_rounded, size: 14, color: AppColors.primaryOrange),
                    label: Text(
                      'Bill Receipt',
                      style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.primaryOrange),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      backgroundColor: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () {
                      context.push('/order-tracking/${order.id}', extra: order);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryOrange,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(
                      'Track Order',
                      style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

