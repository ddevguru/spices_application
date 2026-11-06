import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../models/category_model.dart';
import '../../providers/product_provider.dart';
import '../../widgets/app_image.dart';

class SubcategoriesScreen extends ConsumerWidget {
  final String categoryId;
  final Category? category;

  const SubcategoriesScreen({
    super.key,
    required this.categoryId,
    this.category,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesFutureProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              category?.name ?? _getCategoryName(categoryId),
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
              ),
            ),
            Text(
              'Select a subcategory to view varieties',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
            ),
          ],
        ),
      ),
      body: categoriesAsync.when(
        data: (categories) {
          final cat = category ??
              categories.firstWhere(
                (c) => c.id == categoryId,
                orElse: () => _getDefaultCategory(categoryId),
              );

          final subcategories = cat.subcategories.isNotEmpty
              ? cat.subcategories
              : _getDefaultSubcategories(cat.id);

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 14),

                // 1. Category Hero Banner Card (Full Width Image + Crisp Overlay Text)
                _buildHeroBanner(cat, subcategories.length),

                const SizedBox(height: 20),

                // 2. Section Title
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Subcategories (${subcategories.length})',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.darkText,
                      ),
                    ),
                    Text(
                      'Tap to view varieties',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        color: AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // 3. Subcategories Compact 2-Column Grid
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: subcategories.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.32,
                  ),
                  itemBuilder: (context, index) {
                    final sub = subcategories[index];
                    return _buildSubcategoryCard(context, cat, sub, index);
                  },
                ),

                const SizedBox(height: 90),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildHeroBanner(Category cat, int count) {
    return Container(
      height: 145,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // 1. FULL WIDTH Image
            AppImage(
              imagePath: cat.image,
              fit: BoxFit.cover,
              width: double.infinity,
              height: double.infinity,
            ),

            // 2. High contrast gradient overlay so text is 100% readable
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withOpacity(0.85),
                    Colors.black.withOpacity(0.55),
                    Colors.black.withOpacity(0.15),
                  ],
                  stops: const [0.0, 0.58, 1.0],
                ),
              ),
            ),

            // 3. Crisp Text Content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrange,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '$count Subcategories',
                      style: GoogleFonts.poppins(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    cat.name,
                    style: GoogleFonts.poppins(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 240),
                    child: Text(
                      cat.description,
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        color: Colors.white.withOpacity(0.92),
                        height: 1.3,
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
    );
  }

  Widget _buildSubcategoryCard(BuildContext context, Category cat, String subcategory, int index) {
    return InkWell(
      onTap: () {
        context.push(
          '/subcategories/${Uri.encodeComponent(subcategory)}/products',
          extra: {
            'categoryId': cat.id,
            'categoryName': cat.name,
            'subcategory': subcategory,
          },
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.lightBorder, width: 1.1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.025),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top Row: Icon + Arrow
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFDEEE3),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Icon(
                      _getSubcategoryIcon(subcategory),
                      color: AppColors.primaryOrange,
                      size: 18,
                    ),
                  ),
                ),
                Container(
                  width: 22,
                  height: 22,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFAF5ED),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.arrow_forward_rounded,
                      size: 12,
                      color: AppColors.secondaryText,
                    ),
                  ),
                ),
              ],
            ),

            // Bottom Column: Name & Varieties Link
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subcategory,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                    height: 1.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(
                      'View Varieties',
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryOrange,
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Icon(
                      Icons.chevron_right_rounded,
                      size: 13,
                      color: AppColors.primaryOrange,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getSubcategoryIcon(String sub) {
    final s = sub.toLowerCase();
    if (s.contains('almond') || s.contains('cashew') || s.contains('nut') || s.contains('walnut') || s.contains('pista')) {
      return Icons.eco_rounded;
    }
    if (s.contains('date') || s.contains('fig') || s.contains('raisin') || s.contains('fruit')) {
      return Icons.spa_rounded;
    }
    if (s.contains('cardamom') || s.contains('clove') || s.contains('cinnamon') || s.contains('pepper') || s.contains('seed') || s.contains('spice')) {
      return Icons.local_florist_rounded;
    }
    if (s.contains('masala') || s.contains('powder') || s.contains('blend')) {
      return Icons.grain_rounded;
    }
    if (s.contains('oat') || s.contains('rice') || s.contains('quinoa') || s.contains('millet') || s.contains('cereal')) {
      return Icons.grass_rounded;
    }
    return Icons.all_inclusive_rounded;
  }

  String _getCategoryName(String id) {
    switch (id) {
      case 'cat_dry_fruits':
        return 'Dry Fruits';
      case 'cat_whole_spices':
        return 'Whole Spices';
      case 'cat_blended_spices':
        return 'Blended Spices';
      case 'cat_cereals':
        return 'Cereals';
      default:
        return 'Categories';
    }
  }

  Category _getDefaultCategory(String id) {
    return Category(
      id: id,
      name: _getCategoryName(id),
      slug: id,
      image: 'assets/images/cat_dryfruits.jpg',
      description: 'Premium natural products sorted fresh.',
      subcategories: _getDefaultSubcategories(id),
    );
  }

  List<String> _getDefaultSubcategories(String catId) {
    if (catId == 'cat_dry_fruits') {
      return ['Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Raisins', 'Dates', 'Figs', 'Apricots', 'Anjeer', 'Mixed Dry Fruits', 'Seeds & Nuts'];
    } else if (catId == 'cat_whole_spices') {
      return ['Green Cardamom', 'Black Cardamom', 'Cinnamon Sticks', 'Cloves', 'Black Pepper', 'Cumin Seeds', 'Coriander Seeds', 'Fennel Seeds', 'Mustard Seeds', 'Star Anise', 'Bay Leaves', 'Fenugreek Seeds', 'Dry Red Chillies'];
    } else if (catId == 'cat_blended_spices') {
      return ['Garam Masala', 'Kitchen King Masala', 'Biryani Masala', 'Chole Masala', 'Pav Bhaji Masala', 'Paneer Masala', 'Chicken Masala', 'Meat Masala', 'Sambhar Masala', 'Tandoori Masala', 'Turmeric Powder', 'Red Chilli Powder', 'Coriander Powder', 'Cumin Powder'];
    } else {
      return ['Oats', 'Rolled Oats', 'Quinoa', 'Millets', 'Ragi', 'Jowar', 'Bajra', 'Barley', 'Brown Rice', 'Dalia', 'Corn Flakes', 'Muesli', 'Wheat', 'Multigrain Mix'];
    }
  }
}
