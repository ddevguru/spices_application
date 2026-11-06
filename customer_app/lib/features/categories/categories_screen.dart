import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../models/category_model.dart';
import '../../providers/product_provider.dart';
import '../../widgets/app_image.dart';

class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesFutureProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(
          'All Categories',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.darkText,
          ),
        ),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: AppColors.darkText),
            onPressed: () => context.push('/products'),
          ),
        ],
      ),
      body: categoriesAsync.when(
        data: (categories) {
          // Display ONLY the four main categories as strictly requested
          final List<Category> mainFour = [
            categories.firstWhere(
              (c) => c.id == 'cat_dry_fruits' || c.name.toLowerCase().contains('dry fruit'),
              orElse: () => const Category(
                id: 'cat_dry_fruits',
                name: 'Dry Fruits',
                slug: 'dry-fruits',
                image: 'assets/images/cat_dryfruits.jpg',
                description: 'Royal almonds, cashews, pistachios, walnuts, dates & superfood nuts.',
                subcategories: ['Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Raisins', 'Dates', 'Figs', 'Apricots', 'Anjeer', 'Mixed Dry Fruits', 'Seeds & Nuts'],
              ),
            ),
            categories.firstWhere(
              (c) => c.id == 'cat_whole_spices' || c.name.toLowerCase().contains('whole spice'),
              orElse: () => const Category(
                id: 'cat_whole_spices',
                name: 'Whole Spices',
                slug: 'whole-spices',
                image: 'assets/images/cat_wholespices.jpg',
                description: 'Aromatic green cardamom, cloves, cinnamon, pepper & authentic whole seeds.',
                subcategories: ['Green Cardamom', 'Black Cardamom', 'Cinnamon Sticks', 'Cloves', 'Black Pepper', 'Cumin Seeds', 'Coriander Seeds', 'Fennel Seeds', 'Mustard Seeds', 'Star Anise', 'Bay Leaves', 'Fenugreek Seeds', 'Dry Red Chillies'],
              ),
            ),
            categories.firstWhere(
              (c) => c.id == 'cat_blended_spices' || c.name.toLowerCase().contains('blended spice'),
              orElse: () => const Category(
                id: 'cat_blended_spices',
                name: 'Blended Spices',
                slug: 'blended-spices',
                image: 'assets/images/cat_blendedspices.jpg',
                description: 'Heritage garam masala, biryani, chole, pav bhaji & traditional ground spices.',
                subcategories: ['Garam Masala', 'Kitchen King Masala', 'Biryani Masala', 'Chole Masala', 'Pav Bhaji Masala', 'Paneer Masala', 'Chicken Masala', 'Meat Masala', 'Sambhar Masala', 'Tandoori Masala', 'Turmeric Powder', 'Red Chilli Powder', 'Coriander Powder', 'Cumin Powder'],
              ),
            ),
            categories.firstWhere(
              (c) => c.id == 'cat_cereals' || c.name.toLowerCase().contains('cereal'),
              orElse: () => const Category(
                id: 'cat_cereals',
                name: 'Cereals',
                slug: 'cereals',
                image: 'assets/images/cat_cereals.jpg',
                description: 'Wholesome rolled oats, quinoa, organic millets, ragi, barley & multigrain mix.',
                subcategories: ['Oats', 'Rolled Oats', 'Quinoa', 'Millets', 'Ragi', 'Jowar', 'Bajra', 'Barley', 'Brown Rice', 'Dalia', 'Corn Flakes', 'Muesli', 'Wheat', 'Multigrain Mix'],
              ),
            ),
          ];

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 110),
            itemCount: mainFour.length,
            separatorBuilder: (_, __) => const SizedBox(height: 18),
            itemBuilder: (context, index) {
              final cat = mainFour[index];
              return _buildCategoryCard(context, cat, index);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildCategoryCard(BuildContext context, Category category, int index) {
    final subcount = category.subcategories.isNotEmpty
        ? category.subcategories.length
        : (index == 0 ? 11 : (index == 1 ? 13 : 14));

    return InkWell(
      onTap: () {
        context.push(
          '/categories/${category.id}/subcategories',
          extra: category,
        );
      },
      borderRadius: BorderRadius.circular(24),
      child: Container(
        height: 165,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.lightBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            children: [
              // Background Category Image with gentle fade overlay
              Positioned(
                right: -20,
                top: 0,
                bottom: 0,
                width: 170,
                child: ShaderMask(
                  shaderCallback: (rect) {
                    return const LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [Colors.transparent, Colors.black],
                      stops: [0.0, 0.45],
                    ).createShader(rect);
                  },
                  blendMode: BlendMode.dstIn,
                  child: AppImage(
                    imagePath: category.image,
                    fit: BoxFit.cover,
                  ),
                ),
              ),

              // Left Content Container
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Badge: Number of subcategories
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.lightPeach,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF7B98E), width: 1),
                      ),
                      child: Text(
                        '$subcount Subcategories Available',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFC04E00),
                        ),
                      ),
                    ),

                    // Title & Description
                    SizedBox(
                      width: 220,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            category.name,
                            style: GoogleFonts.poppins(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: AppColors.darkText,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            category.description,
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              color: AppColors.secondaryText,
                              height: 1.35,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                    // "Explore Subcategories →" Button
                    Row(
                      children: [
                        Text(
                          'Explore Subcategories',
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryOrange,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          width: 26,
                          height: 26,
                          decoration: const BoxDecoration(
                            color: AppColors.primaryOrange,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 15),
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
    );
  }
}
