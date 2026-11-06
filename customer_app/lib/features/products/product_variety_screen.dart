import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/product_model.dart';
import '../../models/variant_model.dart';
import '../../providers/cart_provider.dart';
import '../../providers/product_provider.dart';
import '../../widgets/app_image.dart';

class ProductVarietyScreen extends ConsumerWidget {
  final String subcategoryId;
  final String? categoryId;
  final String? categoryName;

  const ProductVarietyScreen({
    super.key,
    required this.subcategoryId,
    this.categoryId,
    this.categoryName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final decodedSub = Uri.decodeComponent(subcategoryId);
    final catId = categoryId ?? 'cat_dry_fruits';
    final catName = categoryName ?? 'Dry Fruits';

    final varietiesAsync = ref.watch(
      subcategoryProductsFamily((categoryId: catId, subcategory: decodedSub)),
    );
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$decodedSub Varieties',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
              ),
            ),
            Text(
              '$catName  ›  $decodedSub',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
            ),
          ],
        ),
        actions: [
          // Cart Button in Header
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.darkText),
                onPressed: () => context.push('/cart'),
              ),
              if (cartState.totalItemCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.primaryOrange,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '${cartState.totalItemCount}',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          varietiesAsync.when(
            data: (products) {
              if (products.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.inventory_2_outlined, size: 60, color: AppColors.secondaryText),
                        const SizedBox(height: 16),
                        Text(
                          'No varieties found for $decodedSub',
                          style: GoogleFonts.poppins(fontSize: 17, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Please check another subcategory.',
                          style: GoogleFonts.inter(color: AppColors.secondaryText),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return ListView.separated(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.fromLTRB(
                  20,
                  14,
                  20,
                  cartState.totalItemCount > 0 ? 150 : 100,
                ),
                itemCount: products.length + 1,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _buildHeaderNotice(decodedSub, products.length);
                  }
                  final product = products[index - 1];
                  return ProductVarietyCard(product: product);
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Error loading varieties: $err')),
          ),

          // Floating Cart Bar if cart has items
          if (cartState.totalItemCount > 0)
            Positioned(
              left: 20,
              right: 20,
              bottom: 24,
              child: _buildFloatingCartBar(context, cartState),
            ),
        ],
      ),
    );
  }

  Widget _buildHeaderNotice(String subcategory, int count) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF7D5BF), width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: AppColors.primaryOrange,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.tune_rounded, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$count Varieties Available',
                  style: GoogleFonts.poppins(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                ),
                Text(
                  'Select preferred weight (100g - 1kg) directly on each card below',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingCartBar(BuildContext context, CartState cartState) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.darkText,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: const BoxDecoration(
                  color: AppColors.primaryOrange,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.shopping_bag_rounded, color: Colors.white, size: 16),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${cartState.totalItemCount} Items Added',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  Text(
                    CurrencyFormatter.format(cartState.subtotal),
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
          ElevatedButton(
            onPressed: () => context.push('/cart'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryOrange,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'View Cart',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.arrow_forward_rounded, size: 14, color: Colors.white),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// PRODUCT VARIETY CARD WITH INTERACTIVE WEIGHT DROPDOWN
// -------------------------------------------------------------
class ProductVarietyCard extends ConsumerStatefulWidget {
  final Product product;

  const ProductVarietyCard({super.key, required this.product});

  @override
  ConsumerState<ProductVarietyCard> createState() => _ProductVarietyCardState();
}

class _ProductVarietyCardState extends ConsumerState<ProductVarietyCard> {
  late ProductVariant _selectedVariant;
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    // Default to 250 GM if available or first variant
    _selectedVariant = widget.product.variants.firstWhere(
      (v) => v.weightInGrams == 250 && v.isAvailable,
      orElse: () => widget.product.variants.first,
    );
  }

  void _onAddToCart() {
    ref.read(cartProvider.notifier).addToCart(
      product: widget.product,
      variant: _selectedVariant,
      quantity: _quantity,
    );

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Added $_quantity x ${widget.product.name} (${_selectedVariant.title}) to Cart! 🛒',
        ),
        backgroundColor: AppColors.successGreen,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final isAvailable = _selectedVariant.isAvailable && _selectedVariant.stockQuantity > 0;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.lightBorder, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.035),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Top Section: Image + Badges
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                child: SizedBox(
                  height: 160,
                  width: double.infinity,
                  child: AppImage(
                    imagePath: product.image,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              // Rating Badge
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                      const SizedBox(width: 4),
                      Text(
                        '${product.rating}',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkText,
                        ),
                      ),
                      Text(
                        ' (${product.reviewCount})',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          color: AppColors.secondaryText,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Stock Availability Badge
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isAvailable ? const Color(0xFFEBF5EE) : const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.circle,
                        size: 7,
                        color: isAvailable ? const Color(0xFF16A34A) : Colors.red,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        isAvailable ? 'In Stock' : 'Out of Stock',
                        style: GoogleFonts.inter(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: isAvailable ? const Color(0xFF16A34A) : Colors.red,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // 2. Middle Section: Details, Interactive Weight Dropdown & Price
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Title
                Text(
                  product.name,
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                ),
                const SizedBox(height: 3),

                // Short Description
                Text(
                  product.shortDescription,
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    color: AppColors.secondaryText,
                    height: 1.35,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 14),

                // --------------------------------------------------------
                // WEIGHT SELECTION DROPDOWN (ESSENTIAL FEATURE)
                // --------------------------------------------------------
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF7C8A4), width: 1.2),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.scale_rounded, size: 16, color: AppColors.primaryOrange),
                          const SizedBox(width: 6),
                          Text(
                            'Select Weight:',
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.darkText,
                            ),
                          ),
                        ],
                      ),
                      // Dropdown Widget
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.primaryOrange.withOpacity(0.5)),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedVariant.id,
                            isDense: true,
                            icon: const Icon(
                              Icons.keyboard_arrow_down_rounded,
                              color: AppColors.primaryOrange,
                              size: 20,
                            ),
                            items: product.variants.map((v) {
                              return DropdownMenuItem<String>(
                                value: v.id,
                                child: Text(
                                  '${v.title}  (₹${v.price.toInt()})',
                                  style: GoogleFonts.poppins(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.darkText,
                                  ),
                                ),
                              );
                            }).toList(),
                            onChanged: (newVariantId) {
                              if (newVariantId != null) {
                                setState(() {
                                  _selectedVariant = product.variants.firstWhere(
                                    (v) => v.id == newVariantId,
                                  );
                                });
                              }
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // 3. Price & Stock Display
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Dynamic Price based on selected weight
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          CurrencyFormatter.format(_selectedVariant.price),
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: AppColors.darkText,
                          ),
                        ),
                        if (_selectedVariant.originalPrice > _selectedVariant.price) ...[
                          const SizedBox(width: 8),
                          Text(
                            CurrencyFormatter.format(_selectedVariant.originalPrice),
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              decoration: TextDecoration.lineThrough,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                      ],
                    ),

                    // Stock Info Tag
                    Text(
                      '${_selectedVariant.stockQuantity} packs left',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _selectedVariant.stockQuantity < 10
                            ? Colors.red
                            : AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // 4. Quantity Selector + Add To Cart Button Row
                Row(
                  children: [
                    // Stepper: [-] quantity [+]
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFFAF5ED),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.lightBorder, width: 1.2),
                      ),
                      child: Row(
                        children: [
                          InkWell(
                            onTap: _quantity > 1
                                ? () => setState(() => _quantity -= 1)
                                : null,
                            borderRadius: BorderRadius.circular(16),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              child: Icon(Icons.remove, size: 16, color: AppColors.darkText),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              '$_quantity',
                              style: GoogleFonts.poppins(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.darkText,
                              ),
                            ),
                          ),
                          InkWell(
                            onTap: _quantity < _selectedVariant.stockQuantity
                                ? () => setState(() => _quantity += 1)
                                : null,
                            borderRadius: BorderRadius.circular(16),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              child: Icon(Icons.add, size: 16, color: AppColors.primaryOrange),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),

                    // ADD TO CART BUTTON
                    Expanded(
                      child: SizedBox(
                        height: 46,
                        child: ElevatedButton(
                          onPressed: isAvailable ? _onAddToCart : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryOrange,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: Colors.grey.shade300,
                            elevation: 2,
                            shadowColor: AppColors.primaryOrange.withOpacity(0.35),
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.add_shopping_cart_rounded, size: 17, color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                'ADD TO CART',
                                style: GoogleFonts.poppins(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
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
}
