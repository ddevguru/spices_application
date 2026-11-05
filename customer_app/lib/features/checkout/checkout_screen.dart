import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/order_model.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../../services/mock_data_service.dart';
import '../../widgets/custom_button.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int _selectedAddressIndex = 0;
  String _selectedPaymentMethod = 'UPI'; // UPI, Card, NetBanking, COD
  final TextEditingController _instructionsController = TextEditingController();
  bool _isPlacingOrder = false;

  @override
  void dispose() {
    _instructionsController.dispose();
    super.dispose();
  }

  void _placeOrder() async {
    final cartState = ref.read(cartProvider);
    if (cartState.items.isEmpty) return;

    setState(() => _isPlacingOrder = true);

    final user = MockDataService().getProfile();
    final address = user.addresses[_selectedAddressIndex.clamp(0, user.addresses.length - 1)];

    final orderCustomer = OrderCustomer(
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: address,
    );

    final orderItems = cartState.items.map((i) {
      return OrderItemRecord(
        productId: i.productId,
        productName: i.productName,
        variantId: i.variant.id,
        variantTitle: i.variant.title,
        weightInGrams: i.variant.weightInGrams,
        price: i.variant.price,
        quantity: i.quantity,
        image: i.image,
      );
    }).toList();

    try {
      final order = await ref.read(orderProvider.notifier).placeOrder(
            customer: orderCustomer,
            items: orderItems,
            subtotal: cartState.subtotal,
            discount: cartState.couponDiscount,
            couponCode: cartState.appliedCoupon?.code ?? '',
            deliveryFee: cartState.deliveryFee,
            totalAmount: cartState.grandTotal,
            paymentMethod: _selectedPaymentMethod,
          );

      ref.read(cartProvider.notifier).clearCart();

      if (mounted) {
        setState(() => _isPlacingOrder = false);
        context.go('/order-success', extra: order);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isPlacingOrder = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to place order: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    final user = MockDataService().getProfile();

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text(
          'Checkout',
          style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Delivery Address Selection
            Text(
              '1. Delivery Address',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 10),
            ...user.addresses.asMap().entries.map((entry) {
              final idx = entry.key;
              final addr = entry.value;
              final isSelected = _selectedAddressIndex == idx;

              return GestureDetector(
                onTap: () => setState(() => _selectedAddressIndex = idx),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.creamBackground,
                    borderRadius: AppDimensions.roundedMedium,
                    border: Border.all(
                      color: isSelected ? AppColors.primaryOrange : AppColors.lightBorder,
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: AppDimensions.cardShadow,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                        color: isSelected ? AppColors.primaryOrange : AppColors.secondaryText,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  addr.label,
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.darkText,
                                  ),
                                ),
                                if (idx == 0) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.lightPeach,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      'DEFAULT',
                                      style: GoogleFonts.inter(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primaryOrange,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              addr.fullAddress,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: AppColors.darkText.withOpacity(0.8),
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 16),

            // Delivery instructions input
            TextField(
              controller: _instructionsController,
              decoration: const InputDecoration(
                hintText: 'Delivery instructions (optional, e.g. Ring bell)',
                prefixIcon: Icon(Icons.notes_rounded, color: AppColors.secondaryText),
              ),
            ),
            const SizedBox(height: 24),

            // 2. Payment Method Selection
            Text(
              '2. Payment Method',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.creamBackground,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                children: [
                  _buildPaymentRadio('UPI / QR (Google Pay, PhonePe, Paytm)', 'UPI', Icons.qr_code_rounded),
                  const Divider(color: AppColors.lightBorder),
                  _buildPaymentRadio('Credit / Debit Card (Visa, Mastercard)', 'Card', Icons.credit_card_rounded),
                  const Divider(color: AppColors.lightBorder),
                  _buildPaymentRadio('Net Banking (All Indian Banks)', 'NetBanking', Icons.account_balance_rounded),
                  const Divider(color: AppColors.lightBorder),
                  _buildPaymentRadio('Cash on Delivery (COD)', 'COD', Icons.payments_outlined),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 3. Order Summary Box
            Text(
              '3. Order Summary (${cartState.totalItemCount} items)',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.creamBackground,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                children: [
                  ...cartState.items.map((item) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${item.quantity}x ${item.productName} (${item.variant.title})',
                                style: GoogleFonts.inter(fontSize: 13, color: AppColors.darkText),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              CurrencyFormatter.format(item.itemTotal),
                              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      )),
                  const Divider(height: 20, color: AppColors.lightBorder),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Subtotal', style: GoogleFonts.inter(color: AppColors.secondaryText, fontSize: 13)),
                      Text(CurrencyFormatter.format(cartState.subtotal), style: GoogleFonts.inter(fontSize: 13)),
                    ],
                  ),
                  if (cartState.couponDiscount > 0) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Discount', style: GoogleFonts.inter(color: AppColors.successGreen, fontSize: 13)),
                        Text('-${CurrencyFormatter.format(cartState.couponDiscount)}',
                            style: GoogleFonts.inter(color: AppColors.successGreen, fontSize: 13, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Delivery', style: GoogleFonts.inter(color: AppColors.secondaryText, fontSize: 13)),
                      Text(
                        cartState.deliveryFee == 0 ? 'FREE' : CurrencyFormatter.format(cartState.deliveryFee),
                        style: GoogleFonts.inter(
                          color: cartState.deliveryFee == 0 ? AppColors.successGreen : AppColors.darkText,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 20, color: AppColors.lightBorder),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Payable',
                        style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800),
                      ),
                      Text(
                        CurrencyFormatter.format(cartState.grandTotal),
                        style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primaryOrange),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            // Confirm & Place Order Button
            CustomButton(
              text: 'Place Order (${CurrencyFormatter.format(cartState.grandTotal)})',
              isLoading: _isPlacingOrder,
              icon: Icons.check_circle_outline,
              onPressed: _placeOrder,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentRadio(String title, String method, IconData icon) {
    final isSelected = _selectedPaymentMethod == method;

    return InkWell(
      onTap: () => setState(() => _selectedPaymentMethod = method),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? AppColors.primaryOrange : AppColors.secondaryText,
              size: 20,
            ),
            const SizedBox(width: 12),
            Icon(icon, size: 20, color: AppColors.primaryOrange),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: AppColors.darkText,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
