import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../models/product_model.dart';
import '../../providers/product_provider.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/product_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _searchController = TextEditingController();
  final PageController _bannerController = PageController();
  int _activeBannerIndex = 0;
  Timer? _bannerTimer;

  // 3 Rows x 3 Columns = 9 Circular Category Items
  final List<Map<String, String>> _circularCategories = [
    {
      'name': 'Dry Fruits',
      'image': 'assets/images/cat_dryfruits.jpg',
      'categoryId': 'cat_dry_fruits',
      'subcategoryId': '',
    },
    {
      'name': 'Whole Spices',
      'image': 'assets/images/cat_wholespices.jpg',
      'categoryId': 'cat_whole_spices',
      'subcategoryId': '',
    },
    {
      'name': 'Blended Spices',
      'image': 'assets/images/cat_blendedspices.jpg',
      'categoryId': 'cat_blended_spices',
      'subcategoryId': '',
    },
    {
      'name': 'Cereals',
      'image': 'assets/images/cat_cereals.jpg',
      'categoryId': 'cat_cereals',
      'subcategoryId': '',
    },
    {
      'name': 'Ajwa Dates',
      'image': 'assets/images/cat_dryfruits.jpg',
      'categoryId': 'cat_dry_fruits',
      'subcategoryId': 'Dates',
    },
    {
      'name': 'Almonds',
      'image': 'assets/images/prod_almonds.jpg',
      'categoryId': 'cat_dry_fruits',
      'subcategoryId': 'Almonds',
    },
    {
      'name': 'Cardamom',
      'image': 'assets/images/prod_cardamom.jpg',
      'categoryId': 'cat_whole_spices',
      'subcategoryId': 'Cardamom',
    },
    {
      'name': 'Shahi Masala',
      'image': 'assets/images/prod_garammasala.jpg',
      'categoryId': 'cat_blended_spices',
      'subcategoryId': 'Garam Masala',
    },
    {
      'name': 'Rolled Oats',
      'image': 'assets/images/prod_oats.jpg',
      'categoryId': 'cat_cereals',
      'subcategoryId': 'Rolled Oats',
    },
  ];

  final List<Map<String, String>> _bannerSlides = [
    {
      'badge': '🔥 20% DISCOUNT',
      'title': 'Royal Dry Fruits',
      'subtitle': 'California Almonds, Cashews & Royal Ajwa Dates',
      'image': 'assets/banners/banner_discount.jpg',
      'categoryId': 'cat_dry_fruits',
    },
    {
      'badge': '🌿 100% PURE HARVEST',
      'title': 'Aromatic Spices',
      'subtitle': 'Emerald Cardamom, Black Pepper & Heritage Blends',
      'image': 'assets/banners/banner_collection.jpg',
      'categoryId': 'cat_whole_spices',
    },
    {
      'badge': '🌾 HEALTHY MORNINGS',
      'title': 'Organic Cereals',
      'subtitle': 'Gluten-Free Rolled Oats, Royal Quinoa & Millets',
      'image': 'assets/banners/banner_cereals.jpg',
      'categoryId': 'cat_cereals',
    },
  ];

  @override
  void initState() {
    super.initState();
    _startBannerAutoScroll();
  }

  void _startBannerAutoScroll() {
    _bannerTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_bannerController.hasClients) {
        final next = (_activeBannerIndex + 1) % _bannerSlides.length;
        _bannerController.animateToPage(
          next,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _bannerTimer?.cancel();
    _bannerController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _openFilterDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusExtraLarge)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Filter & Sort',
                    style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  TextButton(
                    onPressed: () {
                      ref.read(productFilterProvider.notifier).resetFilters();
                      Navigator.pop(ctx);
                    },
                    child: Text(
                      'Reset All',
                      style: GoogleFonts.inter(color: AppColors.primaryOrange, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text('Sort By', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                children: [
                  _filterChoiceChip('Popularity', 'popularity'),
                  _filterChoiceChip('Price: Low to High', 'price_low_high'),
                  _filterChoiceChip('Price: High to Low', 'price_high_low'),
                  _filterChoiceChip('Best Selling', 'best_selling'),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryOrange,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  child: const Text('Apply Filters'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _filterChoiceChip(String label, String value) {
    final currentSort = ref.watch(productFilterProvider).sortBy;
    final isSelected = currentSort == value;

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.primaryOrange,
      backgroundColor: Colors.white,
      labelStyle: GoogleFonts.inter(
        fontSize: 12,
        color: isSelected ? Colors.white : AppColors.darkText,
        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
      ),
      onSelected: (selected) {
        if (selected) {
          ref.read(productFilterProvider.notifier).setSortBy(value);
          setState(() {});
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(filteredProductsProvider);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.scaffoldBackground,
      drawer: const AppDrawer(),
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            // Header: Hamburger Menu, Notification Bell, Brand Title, Search
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Bar: Hamburger Menu Button + Notification Bell
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Hamburger Menu Button (Working Drawer Trigger)
                        GestureDetector(
                          onTap: () => _scaffoldKey.currentState?.openDrawer(),
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.lightBorder, width: 1),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.035),
                                  blurRadius: 10,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(Icons.short_text_rounded, color: AppColors.darkText, size: 24),
                            ),
                          ),
                        ),

                        // Notification Bell Button
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.lightBorder, width: 1),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.035),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Icon(Icons.notifications_none_rounded, color: AppColors.darkText, size: 22),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Title Header: "Dry Fruits Boost" & "Health & Mind"
                    Text(
                      'Dry Fruits Boost',
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.w400,
                        color: const Color(0xFF333333),
                        letterSpacing: -0.4,
                      ),
                    ),
                    Text(
                      'Health & Mind',
                      style: GoogleFonts.poppins(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF1B1B1B),
                        letterSpacing: -0.6,
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Interactive Search Box with Clear & Filter Sliders
                    Container(
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.lightBorder, width: 1),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.035),
                            blurRadius: 12,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const SizedBox(width: 14),
                          const Icon(Icons.search_rounded, color: AppColors.secondaryText, size: 22),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _searchController,
                              onChanged: (val) => setState(() {}),
                              onSubmitted: (query) {
                                if (query.trim().isNotEmpty) {
                                  ref.read(productFilterProvider.notifier).setSearchQuery(query.trim());
                                  context.push('/products');
                                }
                              },
                              decoration: InputDecoration(
                                hintText: 'Search dry fruits, spices, cereals...',
                                hintStyle: GoogleFonts.inter(
                                  fontSize: 14,
                                  color: AppColors.secondaryText.withOpacity(0.75),
                                ),
                                border: InputBorder.none,
                                isDense: true,
                              ),
                            ),
                          ),
                          if (_searchController.text.isNotEmpty)
                            IconButton(
                              onPressed: () {
                                setState(() {
                                  _searchController.clear();
                                });
                                ref.read(productFilterProvider.notifier).setSearchQuery('');
                              },
                              icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.secondaryText),
                            ),
                          Container(
                            height: 22,
                            width: 1,
                            color: AppColors.lightBorder,
                          ),
                          IconButton(
                            onPressed: _openFilterDialog,
                            icon: const Icon(Icons.tune_rounded, color: AppColors.darkText, size: 20),
                          ),
                          const SizedBox(width: 4),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Taller Dynamic Banner Carousel (Height 175)
                    SizedBox(
                      height: 175,
                      child: PageView.builder(
                        controller: _bannerController,
                        itemCount: _bannerSlides.length,
                        onPageChanged: (idx) {
                          setState(() {
                            _activeBannerIndex = idx;
                          });
                        },
                        itemBuilder: (context, idx) {
                          final slide = _bannerSlides[idx];
                          return GestureDetector(
                            onTap: () {
                              ref.read(productFilterProvider.notifier).setCategory(slide['categoryId']!);
                              context.push('/products');
                            },
                            child: Container(
                              margin: const EdgeInsets.only(right: 4),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(color: const Color(0xFFF6DAC2), width: 1),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.04),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(22),
                                child: Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    Image.asset(
                                      slide['image']!,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        color: const Color(0xFFFDEEE3),
                                      ),
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.centerLeft,
                                          end: Alignment.centerRight,
                                          colors: [
                                            Colors.black.withOpacity(0.65),
                                            Colors.black.withOpacity(0.35),
                                            Colors.transparent,
                                          ],
                                        ),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: AppColors.primaryOrange,
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(
                                              slide['badge']!,
                                              style: GoogleFonts.inter(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w800,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            slide['title']!,
                                            style: GoogleFonts.poppins(
                                              fontSize: 20,
                                              fontWeight: FontWeight.w800,
                                              color: Colors.white,
                                              letterSpacing: -0.3,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          SizedBox(
                                            width: 210,
                                            child: Text(
                                              slide['subtitle']!,
                                              style: GoogleFonts.inter(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                                color: Colors.white.withOpacity(0.9),
                                              ),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Carousel Dots Indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _bannerSlides.length,
                        (idx) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: _activeBannerIndex == idx ? 18 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: _activeBannerIndex == idx ? AppColors.primaryOrange : const Color(0xFFDECFC3),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Categories Header: "Categories" + "See All" button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Categories',
                          style: GoogleFonts.poppins(
                            fontSize: 19,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkText,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push('/categories'),
                          child: Text(
                            'See All',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryOrange,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // 3 Columns x 3 Rows = 9 Circular Categories Grid
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _circularCategories.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 12,
                        childAspectRatio: 0.88,
                      ),
                      itemBuilder: (context, index) {
                        final cat = _circularCategories[index];
                        return GestureDetector(
                          onTap: () {
                            ref.read(productFilterProvider.notifier).setCategory(cat['categoryId']!);
                            if (cat['subcategoryId']!.isNotEmpty) {
                              ref.read(productFilterProvider.notifier).setSubcategory(cat['subcategoryId']!);
                            }
                            context.push('/products');
                          },
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.white,
                                  border: Border.all(color: const Color(0xFFF0E3D8), width: 1.5),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.04),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: ClipOval(
                                  child: Padding(
                                    padding: const EdgeInsets.all(3.0),
                                    child: ClipOval(
                                      child: Image.asset(
                                        cat['image']!,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => const Icon(
                                          Icons.eco_rounded,
                                          color: AppColors.primaryOrange,
                                          size: 32,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                cat['name']!,
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.darkText,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 28),

                    // Section 1: "Top Products 🔥" (Best Sellers)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Text('🔥', style: TextStyle(fontSize: 18)),
                            const SizedBox(width: 6),
                            Text(
                              'Top Products',
                              style: GoogleFonts.poppins(
                                fontSize: 19,
                                fontWeight: FontWeight.w700,
                                color: AppColors.darkText,
                              ),
                            ),
                          ],
                        ),
                        GestureDetector(
                          onTap: () {
                            ref.read(productFilterProvider.notifier).setSortBy('best_selling');
                            context.push('/products');
                          },
                          child: Text(
                            'See All',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryOrange,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Horizontal Top Products List
                    productsAsync.when(
                      data: (products) {
                        final topProducts = products.where((p) => p.isBestSeller || p.rating >= 4.8).toList();
                        final listToUse = topProducts.isNotEmpty ? topProducts : products.take(6).toList();

                        return SizedBox(
                          height: 250,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: listToUse.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 14),
                            itemBuilder: (context, idx) {
                              final prod = listToUse[idx];
                              return SizedBox(
                                width: 168,
                                child: ProductCard(
                                  product: prod,
                                  onTap: () => context.push('/product-detail/${prod.id}'),
                                ),
                              );
                            },
                          ),
                        );
                      },
                      loading: () => const SizedBox(height: 220),
                      error: (_, __) => const SizedBox.shrink(),
                    ),

                    const SizedBox(height: 28),

                    // Section 2: "Best Categories / Curated Collections ✨"
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Text('✨', style: TextStyle(fontSize: 18)),
                            const SizedBox(width: 6),
                            Text(
                              'Curated Collections',
                              style: GoogleFonts.poppins(
                                fontSize: 19,
                                fontWeight: FontWeight.w700,
                                color: AppColors.darkText,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Curated Collection Cards (Horizontal Showcase)
                    SizedBox(
                      height: 100,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _collectionCard(
                            title: 'Royal Dry Fruits',
                            subtitle: 'Almonds, Cashews & Madinah Dates',
                            image: 'assets/images/cat_dryfruits.jpg',
                            onTap: () {
                              ref.read(productFilterProvider.notifier).setCategory('cat_dry_fruits');
                              context.push('/products');
                            },
                          ),
                          const SizedBox(width: 12),
                          _collectionCard(
                            title: 'Kerala Spice Trail',
                            subtitle: 'Emerald Cardamom & Tellicherry Pepper',
                            image: 'assets/images/cat_wholespices.jpg',
                            onTap: () {
                              ref.read(productFilterProvider.notifier).setCategory('cat_whole_spices');
                              context.push('/products');
                            },
                          ),
                          const SizedBox(width: 12),
                          _collectionCard(
                            title: 'Wholesome Cereals',
                            subtitle: 'Gluten-Free Oats & Superfood Quinoa',
                            image: 'assets/images/cat_cereals.jpg',
                            onTap: () {
                              ref.read(productFilterProvider.notifier).setCategory('cat_cereals');
                              context.push('/products');
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Section 3: "All Authentic Products"
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'All Authentic Products',
                          style: GoogleFonts.poppins(
                            fontSize: 19,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkText,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),

            // All Products Grid (2 columns)
            productsAsync.when(
              data: (products) {
                return SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 0.65,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final prod = products[index];
                        return ProductCard(
                          product: prod,
                          onTap: () => context.push('/product-detail/${prod.id}'),
                        );
                      },
                      childCount: products.length,
                    ),
                  ),
                );
              },
              loading: () => const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Center(child: CircularProgressIndicator(color: AppColors.primaryOrange)),
                ),
              ),
              error: (err, _) => SliverToBoxAdapter(
                child: Center(child: Text('Error loading products: $err')),
              ),
            ),

            // Bottom Spacing for Floating Nav Bar
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _collectionCard({
    required String title,
    required String subtitle,
    required String image,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 250,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.lightBorder, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(
                image,
                width: 65,
                height: 65,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 65,
                  height: 65,
                  color: AppColors.lightPeach,
                  child: const Icon(Icons.eco_rounded, color: AppColors.primaryOrange),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.darkText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.secondaryText,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
