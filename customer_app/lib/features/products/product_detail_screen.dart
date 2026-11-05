import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/variant_model.dart';
import '../../providers/cart_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/wishlist_provider.dart';
import '../../widgets/app_image.dart';
import '../../widgets/weight_variant_selector.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  late ProductVariant _selectedVariant;
  int _quantity = 1;
  int _selectedImageIndex = 0;
  bool _initializedVariant = false;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));

    return Scaffold(
      backgroundColor: const Color(0xFFFDEEE3), // Warm peach top hero background
      body: productAsync.when(
        data: (product) {
          if (product == null) {
            return const Scaffold(
              body: Center(child: Text('Product not found')),
            );
          }

          if (!_initializedVariant) {
            _selectedVariant = product.defaultVariant;
            _initializedVariant = true;
          }

          final isWishlisted = ref.watch(wishlistProvider.notifier).isInWishlist(product.id);
          final allImages = [product.image, ...product.galleryImages].toSet().toList();
          final activeImage = allImages[_selectedImageIndex.clamp(0, allImages.length - 1)];

          return Column(
            children: [
              // Scrollable Details
              Expanded(
                child: CustomScrollView(
                  slivers: [
                    // Top Hero Section with Peach Curved Backdrop
                    SliverAppBar(
                      expandedHeight: 330,
                      pinned: true,
                      backgroundColor: const Color(0xFFFDEEE3),
                      leading: Padding(
                        padding: const EdgeInsets.only(left: 16, top: 8, bottom: 8),
                        child: GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.04),
                                  blurRadius: 8,
                                )
                              ],
                            ),
                            child: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.darkText, size: 18),
                          ),
                        ),
                      ),
                      actions: [
                        Padding(
                          padding: const EdgeInsets.only(right: 16, top: 8, bottom: 8),
                          child: GestureDetector(
                            onTap: () {
                              ref.read(wishlistProvider.notifier).toggleWishlist(product);
                            },
                            child: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.04),
                                    blurRadius: 8,
                                  )
                                ],
                              ),
                              child: Icon(
                                isWishlisted ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                color: isWishlisted ? Colors.red : AppColors.darkText,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                      ],
                      flexibleSpace: FlexibleSpaceBar(
                        background: Center(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 60, bottom: 20),
                            child: Hero(
                              tag: 'prod_img_${product.id}',
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(24),
                                child: AppImage(
                                  imagePath: activeImage,
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Main Sheet Card (Pure White with 36px top border radius)
                    SliverToBoxAdapter(
                      child: Container(
                        decoration: const BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(36),
                            topRight: Radius.circular(36),
                          ),
                        ),
                        padding: const EdgeInsets.fromLTRB(24, 28, 24, 40),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Product Title & Price Header
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Text(
                                    product.name,
                                    style: GoogleFonts.poppins(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.darkText,
                                      letterSpacing: -0.4,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                RichText(
                                  text: TextSpan(
                                    children: [
                                      TextSpan(
                                        text: CurrencyFormatter.format(_selectedVariant.price),
                                        style: GoogleFonts.poppins(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.darkText,
                                        ),
                                      ),
                                      TextSpan(
                                        text: '/${_selectedVariant.title}',
                                        style: GoogleFonts.inter(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.secondaryText,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 12),

                            // Product Health Description
                            Text(
                              product.description,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: AppColors.secondaryText,
                                height: 1.5,
                              ),
                            ),

                            const SizedBox(height: 18),

                            // 3 Quick Metrics Badges (Rating, Calories, Freshness)
                            Row(
                              children: [
                                _buildMetricPill(
                                  icon: Icons.star_rounded,
                                  iconColor: AppColors.accentYellow,
                                  text: product.rating.toStringAsFixed(1),
                                ),
                                const SizedBox(width: 12),
                                _buildMetricPill(
                                  icon: Icons.local_fire_department_rounded,
                                  iconColor: Colors.deepOrange,
                                  text: '100 Kcal',
                                ),
                                const SizedBox(width: 12),
                                _buildMetricPill(
                                  icon: Icons.access_time_rounded,
                                  iconColor: AppColors.primaryOrange,
                                  text: '20-30 Min',
                                ),
                              ],
                            ),

                            const SizedBox(height: 24),

                            // Weight Variants Section (100g, 250g, 500g, 1kg)
                            Text(
                              'Choose Package Size',
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.darkText,
                              ),
                            ),
                            const SizedBox(height: 12),
                            WeightVariantSelector(
                              variants: product.variants,
                              selectedVariant: _selectedVariant,
                              onVariantSelected: (v) {
                                setState(() {
                                  _selectedVariant = v;
                                });
                              },
                            ),

                            const SizedBox(height: 24),

                            // Ingredients Row with horizontal squircle cards
                            Text(
                              'Ingredients',
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.darkText,
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              height: 60,
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                children: [
                                  _buildIngredientCard('assets/images/cat_dryfruits.jpg', 'Almonds'),
                                  _buildIngredientCard('assets/images/cat_dryfruits.jpg', 'Cashews'),
                                  _buildIngredientCard('assets/images/cat_dryfruits.jpg', 'Pistachios'),
                                  _buildIngredientCard('assets/images/cat_dryfruits.jpg', 'Walnuts'),
                                  _buildIngredientCard('assets/images/cat_dryfruits.jpg', 'Raisins'),
                                ],
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Nutritional Table
                            if (product.nutritionFacts.isNotEmpty) ...[
                              Text(
                                'Nutrition Facts (per 100g)',
                                style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.darkText,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFAF5ED),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: AppColors.lightBorder),
                                ),
                                child: Column(
                                  children: product.nutritionFacts.entries.map((entry) {
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            entry.key,
                                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                                          ),
                                          Text(
                                            entry.value,
                                            style: GoogleFonts.inter(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                              color: AppColors.darkText,
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                            ],

                            const SizedBox(height: 60),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom Sticky Action Row: Stepper Pill Left + Black Chic "ADD TO CART" Pill Right
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: const Border(top: BorderSide(color: Color(0xFFF0E4D8), width: 1)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 16,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: Row(
                    children: [
                      // Quantity Stepper Pill with Soft Peach Background
                      Container(
                        height: 52,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFDE8D8),
                          borderRadius: BorderRadius.circular(26),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              onPressed: () {
                                if (_quantity > 1) {
                                  setState(() => _quantity--);
                                }
                              },
                              icon: const Icon(Icons.remove_rounded, color: AppColors.primaryOrange, size: 20),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              child: Text(
                                '$_quantity ${_selectedVariant.title}',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.darkText,
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                setState(() => _quantity++);
                              },
                              icon: const Icon(Icons.add_rounded, color: AppColors.primaryOrange, size: 20),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 14),

                      // Chic Charcoal/Black "ADD TO CART" Pill
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            ref.read(cartProvider.notifier).addToCart(
                                  product: product,
                                  variant: _selectedVariant,
                                  quantity: _quantity,
                                );
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Added $_quantity x ${product.name} to cart!',
                                  style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                                ),
                                duration: const Duration(seconds: 2),
                                backgroundColor: const Color(0xFF222222),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                            );
                          },
                          child: Container(
                            height: 52,
                            decoration: BoxDecoration(
                              color: const Color(0xFF222222),
                              borderRadius: BorderRadius.circular(26),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.2),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'ADD TO CART',
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.8,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Scaffold(
          body: Center(child: CircularProgressIndicator(color: AppColors.primaryOrange)),
        ),
        error: (err, _) => Scaffold(
          body: Center(child: Text('Error loading product: $err')),
        ),
      ),
    );
  }

  Widget _buildMetricPill({required IconData icon, required Color iconColor, required String text}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFFAF5ED),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor, size: 16),
          const SizedBox(width: 6),
          Text(
            text,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.darkText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIngredientCard(String imgPath, String name) {
    return Container(
      width: 54,
      height: 54,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFAF5ED),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder, width: 1),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: AppImage(
          imagePath: imgPath,
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}
