import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/cart_item_model.dart';
import '../../models/order_model.dart';
import '../../models/variant_model.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../../widgets/app_image.dart';

class _ReorderItemState {
  final String productId;
  final String productName;
  final String variantId;
  final String variantTitle;
  final int weightInGrams;
  final double price;
  final String image;
  int quantity;
  bool isSelected;
  int orderCount;
  DateTime lastOrderedAt;

  _ReorderItemState({
    required this.productId,
    required this.productName,
    required this.variantId,
    required this.variantTitle,
    required this.weightInGrams,
    required this.price,
    required this.image,
    this.quantity = 1,
    this.isSelected = true,
    this.orderCount = 1,
    required this.lastOrderedAt,
  });

  double get total => price * quantity;
}

class QuickReorderScreen extends ConsumerStatefulWidget {
  const QuickReorderScreen({super.key});

  @override
  ConsumerState<QuickReorderScreen> createState() => _QuickReorderScreenState();
}

class _QuickReorderScreenState extends ConsumerState<QuickReorderScreen> {
  final Map<String, _ReorderItemState> _itemsMap = {};
  bool _initialized = false;
  bool _selectAll = true;

  void _initItems(List<CustomerOrder> orders) {
    if (_initialized) return;

    if (orders.isNotEmpty) {
      for (final order in orders) {
        for (final item in order.items) {
          final key = '${item.productId}_${item.variantId}';
          if (_itemsMap.containsKey(key)) {
            final cur = _itemsMap[key]!;
            cur.orderCount += 1;
            if (order.createdAt.isAfter(cur.lastOrderedAt)) {
              cur.lastOrderedAt = order.createdAt;
            }
          } else {
            _itemsMap[key] = _ReorderItemState(
              productId: item.productId,
              productName: item.productName,
              variantId: item.variantId,
              variantTitle: item.variantTitle,
              weightInGrams: item.weightInGrams,
              price: item.price,
              image: item.image,
              quantity: item.quantity > 0 ? item.quantity : 1,
              isSelected: true,
              orderCount: 1,
              lastOrderedAt: order.createdAt,
            );
          }
        }
      }
    } else {
      // Sample essential dryfruits & spices if customer has no past orders yet
      final defaultItems = [
        _ReorderItemState(
          productId: 'p_walnut',
          productName: 'Kashmir Snow White Walnut Kernel',
          variantId: 'v_w250',
          variantTitle: '250 GM',
          weightInGrams: 250,
          price: 360,
          image: 'assets/images/prod_walnut.jpg',
          quantity: 1,
          isSelected: true,
          orderCount: 1,
          lastOrderedAt: DateTime.now().subtract(const Duration(days: 2)),
        ),
        _ReorderItemState(
          productId: 'p_pista',
          productName: 'Roasted & Salted Iranian Pistachio',
          variantId: 'v_p250',
          variantTitle: '250 GM',
          weightInGrams: 250,
          price: 380,
          image: 'assets/images/prod_cashews.jpg',
          quantity: 1,
          isSelected: true,
          orderCount: 2,
          lastOrderedAt: DateTime.now().subtract(const Duration(days: 4)),
        ),
        _ReorderItemState(
          productId: 'p_almonds',
          productName: 'Premium California Almonds',
          variantId: 'v_a500',
          variantTitle: '500 GM',
          weightInGrams: 500,
          price: 490,
          image: 'assets/images/prod_almonds.jpg',
          quantity: 1,
          isSelected: true,
          orderCount: 3,
          lastOrderedAt: DateTime.now().subtract(const Duration(days: 7)),
        ),
      ];
      for (final item in defaultItems) {
        _itemsMap['${item.productId}_${item.variantId}'] = item;
      }
    }

    _initialized = true;
  }

  void _toggleSelectAll() {
    setState(() {
      _selectAll = !_selectAll;
      for (final item in _itemsMap.values) {
        item.isSelected = _selectAll;
      }
    });
  }

  void _toggleItemSelection(String key) {
    setState(() {
      final item = _itemsMap[key];
      if (item != null) {
        item.isSelected = !item.isSelected;
        _selectAll = _itemsMap.values.every((i) => i.isSelected);
      }
    });
  }

  void _updateQuantity(String key, int newQty) {
    if (newQty < 1) return;
    setState(() {
      final item = _itemsMap[key];
      if (item != null) {
        item.quantity = newQty;
      }
    });
  }

  void _proceedToDirectOrder(List<_ReorderItemState> selectedItems) {
    if (selectedItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one item to place order'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    // Convert selected items to CartItem
    final cartItems = selectedItems.map((item) {
      final variant = ProductVariant(
        id: item.variantId,
        weightInGrams: item.weightInGrams,
        unit: 'GM',
        title: item.variantTitle,
        price: item.price,
        originalPrice: item.price * 1.15,
        stockQuantity: 100,
        sku: '${item.productId}-${item.variantId}',
        isAvailable: true,
      );

      return CartItem(
        productId: item.productId,
        productName: item.productName,
        brand: 'Naturale',
        image: item.image,
        variant: variant,
        quantity: item.quantity,
      );
    }).toList();

    // Add to cart
    ref.read(cartProvider.notifier).addMultipleItems(cartItems);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${selectedItems.length} items selected! Proceeding to Checkout...'),
        backgroundColor: AppColors.successGreen,
        duration: const Duration(seconds: 2),
      ),
    );

    // Directly navigate to checkout
    context.push('/checkout');
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(orderProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Reorder',
              style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            Text(
              'Select past ordered items & order directly in 1-tap',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'My Past Orders History',
            icon: const Icon(Icons.history_rounded),
            onPressed: () => context.push('/my-orders'),
          ),
        ],
      ),
      body: ordersAsync.when(
        data: (orders) {
          _initItems(orders);
          final itemsList = _itemsMap.values.toList();
          final selectedItems = itemsList.where((i) => i.isSelected).toList();
          final selectedTotal = selectedItems.fold(0.0, (sum, i) => sum + i.total);

          if (itemsList.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: AppColors.lightPeach,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(Icons.repeat_rounded, size: 40, color: AppColors.primaryOrange),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No past items to reorder',
                      style: GoogleFonts.poppins(fontSize: 17, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Once you place an order, all your ordered items will appear here for 1-click repeat orders!',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => context.go('/main'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryOrange,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: const Text('Explore Products'),
                    ),
                  ],
                ),
              ),
            );
          }

          return Column(
            children: [
              // Top Action Strip: Select All Toggle + Selection Counter
              Container(
                margin: const EdgeInsets.fromLTRB(16, 12, 16, 10),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.lightBorder),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    InkWell(
                      onTap: _toggleSelectAll,
                      borderRadius: BorderRadius.circular(8),
                      child: Row(
                        children: [
                          Icon(
                            _selectAll ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                            color: _selectAll ? AppColors.primaryOrange : AppColors.secondaryText,
                            size: 22,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _selectAll ? 'Deselect All' : 'Select All Items',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.darkText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.lightPeach,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${selectedItems.length}/${itemsList.length} Selected',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryOrange,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Scrollable Items List
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  itemCount: itemsList.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, idx) {
                    final item = itemsList[idx];
                    final key = '${item.productId}_${item.variantId}';

                    return _buildReorderCard(context, key, item);
                  },
                ),
              ),

              // Bottom Sticky Action Card: "X Items Selected | Total ₹Y" + "Direct Order Now"
              Container(
                margin: EdgeInsets.only(
                  left: 16,
                  right: 16,
                  bottom: (14.0 + MediaQuery.of(context).padding.bottom),
                  top: 8,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.09),
                      blurRadius: 18,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(color: AppColors.lightBorder, width: 1),
                ),
                child: Row(
                  children: [
                    // Amount and Items count
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${selectedItems.length} Items Selected',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                            color: AppColors.secondaryText,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          CurrencyFormatter.format(selectedTotal),
                          style: GoogleFonts.poppins(
                            fontSize: 19,
                            fontWeight: FontWeight.w800,
                            color: AppColors.darkText,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),

                    // Direct Order Placement Button
                    Expanded(
                      child: SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: selectedItems.isEmpty
                              ? null
                              : () => _proceedToDirectOrder(selectedItems),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryOrange,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: Colors.grey.shade300,
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
                                  'Direct Order Now',
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
                              const Icon(Icons.flash_on_rounded, size: 18, color: Colors.white),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildReorderCard(BuildContext context, String key, _ReorderItemState item) {
    final dateFormat = DateFormat('dd MMM yyyy');

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: item.isSelected ? AppColors.primaryOrange.withOpacity(0.4) : AppColors.lightBorder,
          width: item.isSelected ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(item.isSelected ? 0.05 : 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _toggleItemSelection(key),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Selection Checkbox
                Icon(
                  item.isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                  color: item.isSelected ? AppColors.primaryOrange : const Color(0xFFC7B8AD),
                  size: 24,
                ),
                const SizedBox(width: 10),

                // Product Image
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 68,
                    height: 68,
                    color: const Color(0xFFFBF4ED),
                    child: AppImage(imagePath: item.image, fit: BoxFit.cover),
                  ),
                ),
                const SizedBox(width: 12),

                // Details & Controls
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.productName,
                        style: GoogleFonts.poppins(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkText,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.lightPeach,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              item.variantTitle,
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryOrange,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Ordered ${item.orderCount}x • Last: ${dateFormat.format(item.lastOrderedAt)}',
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                color: AppColors.secondaryText,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Price and Quantity Stepper Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            CurrencyFormatter.format(item.price),
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.darkText,
                            ),
                          ),

                          // Quantity Stepper
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAF5ED),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: AppColors.lightBorder),
                            ),
                            child: Row(
                              children: [
                                InkWell(
                                  onTap: () => _updateQuantity(key, item.quantity - 1),
                                  borderRadius: BorderRadius.circular(18),
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    child: Icon(Icons.remove, size: 14, color: AppColors.darkText),
                                  ),
                                ),
                                Text(
                                  '${item.quantity}',
                                  style: GoogleFonts.poppins(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.darkText,
                                  ),
                                ),
                                InkWell(
                                  onTap: () => _updateQuantity(key, item.quantity + 1),
                                  borderRadius: BorderRadius.circular(18),
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    child: Icon(Icons.add, size: 14, color: AppColors.primaryOrange),
                                  ),
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
          ),
        ),
      ),
    );
  }
}
