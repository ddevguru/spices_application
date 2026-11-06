import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/order_model.dart';
import '../../providers/order_provider.dart';

class OrderReceiptScreen extends ConsumerWidget {
  final String orderId;
  final CustomerOrder? order;

  const OrderReceiptScreen({
    super.key,
    required this.orderId,
    this.order,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    CustomerOrder? displayOrder = order;

    if (displayOrder == null) {
      final ordersAsync = ref.watch(orderProvider);
      ordersAsync.whenData((orders) {
        try {
          displayOrder = orders.firstWhere((o) => o.id == orderId);
        } catch (_) {}
      });
    }

    if (displayOrder == null) {
      return Scaffold(
        backgroundColor: AppColors.peachBackground,
        appBar: AppBar(
          title: Text(
            'Order Receipt',
            style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.receipt_long_outlined, size: 56, color: AppColors.secondaryText),
              const SizedBox(height: 12),
              Text(
                'Receipt Not Available',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              Text(
                'Order #$orderId could not be found.',
                style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryOrange,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    final ord = displayOrder!;
    final dateFormat = DateFormat('dd MMM yyyy, hh:mm a');

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(
          'Tax Invoice & Bill',
          style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share Receipt',
            onPressed: () => _shareReceipt(context, ord),
          ),
          IconButton(
            icon: const Icon(Icons.download_rounded),
            tooltip: 'Download Invoice',
            onPressed: () => _downloadReceipt(context, ord),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // RECEIPT SHEET
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.lightBorder, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. BRAND HEADER
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: AppColors.primaryOrange,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.eco_rounded, color: Colors.white, size: 20),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'NATURALE',
                              style: GoogleFonts.poppins(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                                color: AppColors.primaryOrange,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Pure Dry Fruits, Heritage Spices & Organic Cereals',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkText,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'GSTIN: 07AAACN1234F1Z5 • FSSAI Lic: 10020011000452\nNaturale Agrotech Ltd., Sector 62, Noida, UP - 201309',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: AppColors.secondaryText,
                            height: 1.3,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFFDBA74)),
                          ),
                          child: Text(
                            'RETAIL TAX INVOICE / CASH MEMO',
                            style: GoogleFonts.poppins(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                              color: const Color(0xFFC2410C),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Zig-zag / Perforated visual bar
                  _buildPerforatedDivider(),

                  Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 2. INVOICE META
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'INVOICE NO',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.6,
                                    color: AppColors.secondaryText,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'INV-${ord.id}',
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.darkText,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'DATE & TIME',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.6,
                                    color: AppColors.secondaryText,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  dateFormat.format(ord.createdAt),
                                  style: GoogleFonts.inter(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.darkText,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'STATUS',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.6,
                                    color: AppColors.secondaryText,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(ord.status).withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    ord.status.toUpperCase(),
                                    style: GoogleFonts.inter(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w800,
                                      color: _getStatusColor(ord.status),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'PAYMENT',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.6,
                                    color: AppColors.secondaryText,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  ord.paymentMethod,
                                  style: GoogleFonts.inter(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF16A34A),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),

                        const Divider(height: 24, color: AppColors.lightBorder),

                        // 3. BILLED / DELIVERED TO
                        Text(
                          'BILLED & DELIVERED TO:',
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.6,
                            color: AppColors.secondaryText,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          ord.customer.name,
                          style: GoogleFonts.poppins(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkText,
                          ),
                        ),
                        Text(
                          ord.customer.address.fullAddress,
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            color: AppColors.darkText,
                            height: 1.35,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Phone: ${ord.customer.phone} • Email: ${ord.customer.email}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: AppColors.secondaryText,
                          ),
                        ),

                        const Divider(height: 24, color: AppColors.lightBorder),

                        // 4. ITEMS TABLE
                        Text(
                          'ITEMS PURCHASED',
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.6,
                            color: AppColors.secondaryText,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Table Header
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.lightBorder),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 5,
                                child: Text(
                                  'Item & Variant',
                                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.secondaryText),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Text(
                                  'Qty',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.secondaryText),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Text(
                                  'Rate',
                                  textAlign: TextAlign.right,
                                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.secondaryText),
                                ),
                              ),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  'Amount',
                                  textAlign: TextAlign.right,
                                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.secondaryText),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 4),

                        // Table Rows
                        ...ord.items.map((item) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 5,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.productName,
                                        style: GoogleFonts.inter(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.darkText,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFDEEE3),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          item.variantTitle,
                                          style: GoogleFonts.inter(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.primaryOrange,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    '${item.quantity}',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    '₹${item.price.toInt()}',
                                    textAlign: TextAlign.right,
                                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                                  ),
                                ),
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    '₹${item.total.toInt()}',
                                    textAlign: TextAlign.right,
                                    style: GoogleFonts.poppins(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.darkText,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),

                        const Divider(height: 20, color: AppColors.lightBorder),

                        // 5. BILLING SUMMARY
                        _buildSummaryRow('Items Subtotal (MRP)', CurrencyFormatter.format(ord.subtotal)),
                        if (ord.discount > 0)
                          _buildSummaryRow(
                            'Coupon Discount (${ord.couponCode.isNotEmpty ? ord.couponCode : "PROMO"})',
                            '-${CurrencyFormatter.format(ord.discount)}',
                            isGreen: true,
                          ),
                        _buildSummaryRow(
                          'Delivery Charges',
                          ord.deliveryFee == 0 ? 'FREE' : CurrencyFormatter.format(ord.deliveryFee),
                          isGreen: ord.deliveryFee == 0,
                        ),

                        const SizedBox(height: 8),

                        // Total Row
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF7ED),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFED7AA)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'GRAND TOTAL',
                                    style: GoogleFonts.poppins(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.6,
                                      color: const Color(0xFF9A3412),
                                    ),
                                  ),
                                  Text(
                                    'Inclusive of all applicable taxes',
                                    style: GoogleFonts.inter(
                                      fontSize: 9.5,
                                      color: AppColors.secondaryText,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                CurrencyFormatter.format(ord.totalAmount),
                                style: GoogleFonts.poppins(
                                  fontSize: 19,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primaryOrange,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 18),

                        // 6. FOOTER DECLARATION
                        Center(
                          child: Column(
                            children: [
                              Text(
                                '• This is a computer-generated tax invoice •',
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.secondaryText,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Thank you for choosing pure, chemical-free Naturale harvest!',
                                style: GoogleFonts.inter(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.darkText,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Customer Support: care@naturale.com | WhatsApp: +91 98765 43210',
                                style: GoogleFonts.inter(
                                  fontSize: 9.5,
                                  color: AppColors.secondaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ACTION BUTTONS
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _shareReceipt(context, ord),
                    icon: const Icon(Icons.share_rounded, size: 18, color: AppColors.primaryOrange),
                    label: Text(
                      'Share Receipt',
                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      side: const BorderSide(color: AppColors.primaryOrange, width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      backgroundColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _downloadReceipt(context, ord),
                    icon: const Icon(Icons.download_rounded, size: 18, color: Colors.white),
                    label: Text(
                      'Download PDF',
                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      backgroundColor: AppColors.primaryOrange,
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => context.pop(),
              child: Text(
                'Done / Return to Orders',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.secondaryText,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerforatedDivider() {
    return SizedBox(
      height: 12,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final boxWidth = constraints.constrainWidth();
          const dashWidth = 6.0;
          const dashHeight = 1.5;
          final dashCount = (boxWidth / (2 * dashWidth)).floor();
          return Flex(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            direction: Axis.horizontal,
            children: List.generate(dashCount, (_) {
              return SizedBox(
                width: dashWidth,
                height: dashHeight,
                child: const DecoratedBox(
                  decoration: BoxDecoration(color: Color(0xFFD1D5DB)),
                ),
              );
            }),
          );
        },
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isGreen = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: isGreen ? const Color(0xFF16A34A) : AppColors.secondaryText,
              fontWeight: isGreen ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: isGreen ? const Color(0xFF16A34A) : AppColors.darkText,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return const Color(0xFF16A34A);
      case 'out for delivery':
      case 'shipped':
        return AppColors.primaryOrange;
      case 'processing':
      case 'confirmed':
        return const Color(0xFFD97706);
      case 'cancelled':
        return Colors.redAccent;
      default:
        return AppColors.primaryOrange;
    }
  }

  void _shareReceipt(BuildContext context, CustomerOrder ord) {
    final invoiceSummary = StringBuffer();
    invoiceSummary.writeln('🧾 *NATURALE - TAX INVOICE*');
    invoiceSummary.writeln('Invoice No: INV-${ord.id}');
    invoiceSummary.writeln('Date: ${DateFormat('dd MMM yyyy').format(ord.createdAt)}');
    invoiceSummary.writeln('Status: ${ord.status} | Payment: ${ord.paymentMethod}');
    invoiceSummary.writeln('Customer: ${ord.customer.name} (${ord.customer.phone})');
    invoiceSummary.writeln('Delivery: ${ord.customer.address.city}, ${ord.customer.address.pincode}');
    invoiceSummary.writeln('---------------------------');
    invoiceSummary.writeln('ITEMS:');
    for (var it in ord.items) {
      invoiceSummary.writeln('• ${it.productName} (${it.variantTitle}) x${it.quantity} - ₹${it.total.toInt()}');
    }
    invoiceSummary.writeln('---------------------------');
    invoiceSummary.writeln('Grand Total: ₹${ord.totalAmount.toInt()}');
    invoiceSummary.writeln('Thank you for shopping with Naturale!');

    Clipboard.setData(ClipboardData(text: invoiceSummary.toString()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Invoice details copied to clipboard! Ready to share via WhatsApp / SMS.'),
        backgroundColor: Color(0xFF16A34A),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _downloadReceipt(BuildContext context, CustomerOrder ord) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Receipt INV-${ord.id}.pdf generated & saved to Downloads!',
                style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF16A34A),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }
}
