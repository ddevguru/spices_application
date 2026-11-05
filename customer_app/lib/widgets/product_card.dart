import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_dimensions.dart';
import '../core/utils/currency_formatter.dart';
import '../models/product_model.dart';
import '../models/variant_model.dart';
import '../providers/cart_provider.dart';
import '../providers/wishlist_provider.dart';
import 'app_image.dart';

class ProductCard extends ConsumerStatefulWidget {
  final Product product;
  final VoidCallback? onTap;
  final double? width;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.width,
  });

  @override
  ConsumerState<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends ConsumerState<ProductCard> {
  late ProductVariant _selectedVariant;

  @override
  void initState() {
    super.initState();
    _selectedVariant = widget.product.defaultVariant;
  }

  @override
  Widget build(BuildContext context) {
    final isWishlisted = ref.watch(wishlistProvider.notifier).isInWishlist(widget.product.id);

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        width: widget.width,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.lightBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.035),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Action Row (Favorite Heart at Top Right)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Weight Pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.lightPeach,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      _selectedVariant.title,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryOrange,
                      ),
                    ),
                  ),
                  // Wishlist button
                  GestureDetector(
                    onTap: () {
                      ref.read(wishlistProvider.notifier).toggleWishlist(widget.product);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.lightPeach.withOpacity(0.5),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isWishlisted ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        size: 16,
                        color: isWishlisted ? Colors.red : AppColors.secondaryText,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 6),

              // Product Photography Centered
              Expanded(
                child: Center(
                  child: Hero(
                    tag: 'prod_img_${widget.product.id}',
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: AppImage(
                        imagePath: widget.product.image,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 8),

              // Product Name with Flame Icon
              Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.product.name,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.darkText,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text('🔥', style: TextStyle(fontSize: 12)),
                ],
              ),

              const SizedBox(height: 3),

              // Subline: Freshness/Delivery time + Star rating
              Row(
                children: [
                  Text(
                    'Fresh Stock',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppColors.secondaryText,
                    ),
                  ),
                  const Spacer(),
                  const Icon(Icons.star_rounded, size: 14, color: AppColors.accentYellow),
                  const SizedBox(width: 2),
                  Text(
                    widget.product.rating.toStringAsFixed(1),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.darkText,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // Bottom Row: Price & Circular Orange '+' Button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        CurrencyFormatter.format(_selectedVariant.price),
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.darkText,
                        ),
                      ),
                      if (_selectedVariant.originalPrice > _selectedVariant.price)
                        Text(
                          CurrencyFormatter.format(_selectedVariant.originalPrice),
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: AppColors.secondaryText,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                    ],
                  ),

                  // Circular Orange Add Button
                  GestureDetector(
                    onTap: () {
                      ref.read(cartProvider.notifier).addToCart(
                        product: widget.product,
                        variant: _selectedVariant,
                        quantity: 1,
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('${widget.product.name} (${_selectedVariant.title}) added to bag!'),
                          backgroundColor: AppColors.darkText,
                          behavior: SnackBarBehavior.floating,
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    },
                    child: Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: AppColors.primaryOrange,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryOrange.withOpacity(0.35),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.add_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
