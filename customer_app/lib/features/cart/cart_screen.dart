import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/cart_item_model.dart';
import '../../providers/cart_provider.dart';
import '../../widgets/app_image.dart';
import '../../widgets/custom_button.dart';

class CartScreen extends ConsumerStatefulWidget {
  final bool isInBottomNav;

  const CartScreen({super.key, this.isInBottomNav = true});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final TextEditingController _couponController = TextEditingController();
  String? _couponError;

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  void _applyCoupon() async {
    final code = _couponController.text.trim();
    if (code.isEmpty) return;

    final err = await ref.read(cartProvider.notifier).applyCoupon(code);
    setState(() {
      _couponError = err;
    });
    if (err == null) {
      _couponController.clear();
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text(
          'Shopping Cart (${cartState.totalItemCount})',
          style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
        ),
        automaticallyImplyLeading: !widget.isInBottomNav,
        actions: [
          if (cartState.items.isNotEmpty)
            TextButton(
              onPressed: () {
                ref.read(cartProvider.notifier).clearCart();
              },
              child: Text(
                'Clear',
                style: GoogleFonts.inter(
                  color: Colors.redAccent,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
      body: cartState.items.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        color: AppColors.lightPeach,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(Icons.shopping_bag_outlined, size: 48, color: AppColors.primaryOrange),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Your Cart is Empty',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.darkText,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Add handpicked dry fruits, authentic whole spices, or cereals to begin.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => context.go('/main'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryOrange,
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                      ),
                      child: Text(
                        'Start Shopping',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : Column(
              children: [
                // Cart Items List
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      // Free Delivery progress bar
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.lightPeach,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.lightBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.local_shipping, size: 18, color: AppColors.primaryOrange),
                                const SizedBox(width: 8),
                                Text(
                                  cartState.subtotal >= cartState.deliveryThreshold
                                      ? 'You unlocked FREE Express Delivery!'
                                      : 'Add ${CurrencyFormatter.format(cartState.deliveryThreshold - cartState.subtotal)} more for FREE Delivery',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.darkText,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: (cartState.subtotal / cartState.deliveryThreshold).clamp(0.0, 1.0),
                                backgroundColor: Colors.white,
                                color: AppColors.primaryOrange,
                                minHeight: 6,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Cart Items
                      ...cartState.items.map((item) => _buildCartItemTile(context, item)),

                      const SizedBox(height: 20),

                      // Coupon Code Input Card
                      Container(
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
                            Row(
                              children: [
                                const Icon(Icons.discount_outlined, color: AppColors.primaryOrange, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Apply Coupon Code',
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.darkText,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            if (cartState.appliedCoupon != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: AppColors.successGreen.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.successGreen.withOpacity(0.3)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          cartState.appliedCoupon!.code,
                                          style: GoogleFonts.poppins(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.successGreen,
                                          ),
                                        ),
                                        Text(
                                          cartState.appliedCoupon!.description,
                                          style: GoogleFonts.inter(
                                            fontSize: 11,
                                            color: AppColors.darkText,
                                          ),
                                        ),
                                      ],
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.close, color: Colors.red, size: 18),
                                      onPressed: () => ref.read(cartProvider.notifier).removeCoupon(),
                                    ),
                                  ],
                                ),
                              )
                            else
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _couponController,
                                      textCapitalization: TextCapitalization.characters,
                                      decoration: InputDecoration(
                                        hintText: 'e.g. WELCOME20',
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                        errorText: _couponError,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  ElevatedButton(
                                    onPressed: _applyCoupon,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primaryOrange,
                                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    child: Text(
                                      'Apply',
                                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Order Bill Summary Card
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
                            Text(
                              'Bill Details',
                              style: GoogleFonts.poppins(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.darkText,
                              ),
                            ),
                            const SizedBox(height: 14),
                            _buildBillRow('Item Total (MRP)', CurrencyFormatter.format(cartState.originalSubtotal)),
                            if (cartState.productSavings > 0)
                              _buildBillRow(
                                'Product Discount',
                                '-${CurrencyFormatter.format(cartState.productSavings)}',
                                isGreen: true,
                              ),
                            _buildBillRow('Subtotal', CurrencyFormatter.format(cartState.subtotal)),
                            if (cartState.couponDiscount > 0)
                              _buildBillRow(
                                'Coupon Discount (${cartState.appliedCoupon!.code})',
                                '-${CurrencyFormatter.format(cartState.couponDiscount)}',
                                isGreen: true,
                              ),
                            _buildBillRow(
                              'Delivery Fee',
                              cartState.deliveryFee == 0 ? 'FREE' : CurrencyFormatter.format(cartState.deliveryFee),
                              isGreen: cartState.deliveryFee == 0,
                            ),
                            const Divider(height: 24, color: AppColors.lightBorder),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Grand Total',
                                  style: GoogleFonts.poppins(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.darkText,
                                  ),
                                ),
                                Text(
                                  CurrencyFormatter.format(cartState.grandTotal),
                                  style: GoogleFonts.poppins(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primaryOrange,
                                  ),
                                ),
                              ],
                            ),
                            if (cartState.totalSavings > 0) ...[
                              const SizedBox(height: 8),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
                                decoration: BoxDecoration(
                                  color: AppColors.successGreen.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'You will save ${CurrencyFormatter.format(cartState.totalSavings)} on this order!',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.successGreen,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),

                // Bottom Checkout Bar - Floating above CustomBottomNav when in main nav
                Container(
                  margin: EdgeInsets.only(
                    left: 16,
                    right: 16,
                    bottom: widget.isInBottomNav
                        ? (84.0 + MediaQuery.of(context).padding.bottom)
                        : (16.0 + MediaQuery.of(context).padding.bottom),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      )
                    ],
                    border: Border.all(color: AppColors.lightBorder, width: 1),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Payable Amount',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: AppColors.secondaryText,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            CurrencyFormatter.format(cartState.grandTotal),
                            style: GoogleFonts.poppins(
                              fontSize: 19,
                              fontWeight: FontWeight.w800,
                              color: AppColors.darkText,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            onPressed: () => context.push('/checkout'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryOrange,
                              foregroundColor: Colors.white,
                              elevation: 2,
                              shadowColor: AppColors.primaryOrange.withOpacity(0.35),
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(24),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Flexible(
                                  child: Text(
                                    'Proceed to Checkout',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.poppins(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Icon(Icons.arrow_forward_rounded, size: 18, color: Colors.white),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildCartItemTile(BuildContext context, CartItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.creamBackground,
        borderRadius: AppDimensions.roundedLarge,
        border: Border.all(color: AppColors.lightBorder),
        boxShadow: AppDimensions.cardShadow,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 80,
              height: 80,
              color: const Color(0xFFFBF4ED),
              child: AppImage(imagePath: item.image, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(width: 14),

          // Info & Weight
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                // Weight badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.lightPeach,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    item.variant.title,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryOrange,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                // Price and Quantity Controller Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          CurrencyFormatter.format(item.itemTotal),
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.darkText,
                          ),
                        ),
                        if (item.savings > 0)
                          Text(
                            CurrencyFormatter.format(item.originalTotal),
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              decoration: TextDecoration.lineThrough,
                              color: AppColors.secondaryText,
                            ),
                          ),
                      ],
                    ),

                    // Increment / Decrement
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.lightBorder),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove, size: 16),
                            padding: const EdgeInsets.all(4),
                            constraints: const BoxConstraints(),
                            onPressed: () {
                              ref.read(cartProvider.notifier).updateQuantity(item.cartItemId, item.quantity - 1);
                            },
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              '${item.quantity}',
                              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w700),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add, size: 16),
                            padding: const EdgeInsets.all(4),
                            constraints: const BoxConstraints(),
                            onPressed: () {
                              ref.read(cartProvider.notifier).updateQuantity(item.cartItemId, item.quantity + 1);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBillRow(String label, String value, {bool isGreen = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isGreen ? AppColors.successGreen : AppColors.darkText,
            ),
          ),
        ],
      ),
    );
  }
}
