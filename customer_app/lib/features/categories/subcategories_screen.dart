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

                // 3. Subcategories Single-Line Horizontal Cards (Matching Category Card Layout with Real Images)
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: subcategories.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final sub = subcategories[index];
                    return _buildSubcategoryCard(context, cat, sub, index);
                  },
                ),

                const SizedBox(height: 100),
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
            color: Colors.black.withValues(alpha: 0.08),
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
                    Colors.black.withValues(alpha: 0.85),
                    Colors.black.withValues(alpha: 0.55),
                    Colors.black.withValues(alpha: 0.15),
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
                        color: Colors.white.withValues(alpha: 0.92),
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

  // Single-line horizontal card with matching image & ShaderMask fade, identical to Category Card design
  Widget _buildSubcategoryCard(BuildContext context, Category cat, String subcategory, int index) {
    final imagePath = _getSubcategoryImage(subcategory, cat.id);
    final description = _getSubcategoryDescription(subcategory);

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
      borderRadius: BorderRadius.circular(20),
      child: Container(
        height: 125,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.lightBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.035),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Stack(
            children: [
              // 1. Right Side Matching Image with ShaderMask gradient fade
              Positioned(
                right: -10,
                top: 0,
                bottom: 0,
                width: 145,
                child: ShaderMask(
                  shaderCallback: (rect) {
                    return const LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [Colors.transparent, Colors.black],
                      stops: [0.0, 0.40],
                    ).createShader(rect);
                  },
                  blendMode: BlendMode.dstIn,
                  child: AppImage(
                    imagePath: imagePath,
                    fit: BoxFit.cover,
                    width: 145,
                    height: 125,
                  ),
                ),
              ),

              // 2. Left Side Info (Single line horizontal layout matching Categories Screen)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 130, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Badge: Category Chip
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDEEE3),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        cat.name.toUpperCase(),
                        style: GoogleFonts.poppins(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryOrange,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),

                    // Subcategory Name & Short Description
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          subcategory,
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.darkText,
                            height: 1.2,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          description,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.secondaryText,
                            height: 1.25,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),

                    // Action Link
                    Row(
                      children: [
                        Text(
                          'View Varieties',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryOrange,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          width: 18,
                          height: 18,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFDEEE3),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.arrow_forward_rounded,
                              size: 11,
                              color: AppColors.primaryOrange,
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
        ),
      ),
    );
  }

  // Helper to map each subcategory to its matching high-resolution asset image
  String _getSubcategoryImage(String subcategory, String categoryId) {
    final s = subcategory.toLowerCase();

    // 1. Dry Fruits
    if (s.contains('almond')) return 'assets/images/prod_almonds.jpg';
    if (s.contains('cashew')) return 'assets/images/prod_cashews.jpg';
    if (s.contains('pista')) return 'assets/images/prod_pistachios.jpg';
    if (s.contains('walnut')) return 'assets/images/prod_walnuts.jpg';
    if (s.contains('raisin') || s.contains('date') || s.contains('fig') ||
        s.contains('anjeer') || s.contains('apricot') || s.contains('nut') ||
        s.contains('seed') || s.contains('dry fruit')) {
      return 'assets/images/cat_dryfruits.jpg';
    }

    // 2. Whole Spices
    if (s.contains('cardamom')) return 'assets/images/prod_cardamom.jpg';
    if (s.contains('cinnamon') || s.contains('clove') || s.contains('bay leave')) {
      return 'assets/images/prod_cinnamon.jpg';
    }
    if (s.contains('pepper') || s.contains('cumin') || s.contains('coriander') ||
        s.contains('fennel') || s.contains('mustard') || s.contains('star anise') ||
        s.contains('fenugreek') || s.contains('chilli') || s.contains('spice')) {
      return 'assets/images/cat_wholespices.jpg';
    }

    // 3. Blended Spices
    if (s.contains('turmeric') || s.contains('haldi') || s.contains('red chilli powder') ||
        s.contains('coriander powder') || s.contains('cumin powder')) {
      return 'assets/images/prod_turmeric.jpg';
    }
    if (s.contains('garam') || s.contains('masala') || s.contains('kitchen king') ||
        s.contains('biryani') || s.contains('chole') || s.contains('pav bhaji') ||
        s.contains('paneer') || s.contains('chicken') || s.contains('meat') ||
        s.contains('sambhar') || s.contains('tandoori')) {
      return 'assets/images/prod_garammasala.jpg';
    }

    // 4. Cereals
    if (s.contains('oat') || s.contains('corn') || s.contains('muesli') || s.contains('dalia')) {
      return 'assets/images/prod_oats.jpg';
    }
    if (s.contains('quinoa') || s.contains('millet') || s.contains('ragi') ||
        s.contains('jowar') || s.contains('bajra') || s.contains('barley') ||
        s.contains('rice') || s.contains('wheat') || s.contains('grain')) {
      return 'assets/images/prod_quinoa.jpg';
    }

    // Category default fallbacks
    switch (categoryId) {
      case 'cat_dry_fruits':
        return 'assets/images/cat_dryfruits.jpg';
      case 'cat_whole_spices':
        return 'assets/images/cat_wholespices.jpg';
      case 'cat_blended_spices':
        return 'assets/images/cat_blendedspices.jpg';
      case 'cat_cereals':
        return 'assets/images/cat_cereals.jpg';
      default:
        return 'assets/images/cat_dryfruits.jpg';
    }
  }

  // Descriptive subtitle for each subcategory
  String _getSubcategoryDescription(String subcategory) {
    final s = subcategory.toLowerCase();

    // Dry Fruits
    if (s.contains('almond')) return 'California, Mamra, Gurbandi & Regular varieties';
    if (s.contains('cashew')) return 'W180 King, W240, W320 & Roasted varieties';
    if (s.contains('pista')) return 'Salted California, Irani & Plain Kernels';
    if (s.contains('walnut')) return 'Kashmiri Halves, Whole Inshell & Broken pieces';
    if (s.contains('raisin')) return 'Indian Golden, Afghan Black & Green Kishmish';
    if (s.contains('date')) return 'Medjool Royal, Kimia Soft & Arabian Ajwa dates';
    if (s.contains('fig') || s.contains('anjeer')) return 'Afghani Premium & Sun-dried Jumbo Anjeer';
    if (s.contains('apricot')) return 'Turkish Dried, Ladakhi Khubani & Seedless sweet';
    if (s.contains('mixed')) return 'Royal Panchmeva & Premium Daily Health Mix';
    if (s.contains('seed')) return 'Chia, Flax, Pumpkin, Sunflower & Watermelon seeds';

    // Whole Spices
    if (s.contains('green cardamom')) return '7mm & 8mm Bold green pods from Idukki, Kerala';
    if (s.contains('black cardamom')) return 'Smoky aromatic large pods for gravies & biryani';
    if (s.contains('cinnamon')) return 'True Ceylon Sri Lankan rolls & authentic cassia bark';
    if (s.contains('clove')) return 'Handpicked aromatic Zanzibar & Madagascan cloves';
    if (s.contains('pepper')) return 'Tellicherry Garbled bold black peppercorns';
    if (s.contains('cumin seed')) return 'Unpolished aromatic Gujarat & Rajasthan jeera';
    if (s.contains('coriander seed')) return 'Crisp fragrant dhaniya seeds for fresh blends';
    if (s.contains('fennel')) return 'Lucknowi sweet saunf & cooking fennel seeds';
    if (s.contains('mustard')) return 'Small black sarson & traditional yellow rai seeds';
    if (s.contains('star anise')) return 'Whole intact 8-pointed star anise flowers';
    if (s.contains('bay leave')) return 'Whole dried aromatic Indian tejpatta leaves';
    if (s.contains('fenugreek')) return 'Golden methi seeds with rich digestive properties';
    if (s.contains('chilli')) return 'Guntur Sannam, Byadgi wrinkle & Kashmiri chillies';

    // Blended Spices
    if (s.contains('garam masala')) return 'Classic royal 15-spice blend for aromatic dishes';
    if (s.contains('kitchen king')) return 'All-purpose master curry blend for daily sabzis';
    if (s.contains('biryani')) return 'Nawabi dum biryani blend with saffron & whole mace';
    if (s.contains('chole')) return 'Delhi-style tangy amchur & anardana chana masala';
    if (s.contains('pav bhaji')) return 'Mumbai street-style rich fragrant bhaji seasoning';
    if (s.contains('paneer')) return 'Smooth creamy shahi & butter paneer spice mix';
    if (s.contains('chicken')) return 'Rich savory blend for authentic chicken curries';
    if (s.contains('meat')) return 'Hearty traditional spice blend for slow-cooked meats';
    if (s.contains('sambhar')) return 'Udupi-style roasted lentils & coriander sambhar mix';
    if (s.contains('tandoori')) return 'Vibrant smokey tandoor & tikka marinade seasoning';
    if (s.contains('turmeric')) return 'High-curcumin Lakadong & Salem pure haldi powder';
    if (s.contains('red chilli')) return 'Mild Kashmiri vibrant red & spicy Tikhalal powder';
    if (s.contains('coriander powder')) return 'Cold-ground aromatic pure dhaniya powder';
    if (s.contains('cumin powder')) return 'Roasted & freshly ground fragrant jeera powder';

    // Cereals
    if (s.contains('rolled oats')) return 'Jumbo rolled oats for oatmeal, bowls & baking';
    if (s.contains('oat')) return 'Whole grain instant & steel-cut breakfast oats';
    if (s.contains('quinoa')) return 'Triple-washed white, red & tri-color super grain';
    if (s.contains('millet')) return 'Foxtail, Little, Kodo & Barnyard millets';
    if (s.contains('ragi')) return 'Calcium-rich whole red finger millet grains & flour';
    if (s.contains('jowar')) return 'Gluten-free white sorghum grains for healthy diets';
    if (s.contains('bajra')) return 'Iron-rich pearl millet grains for winter rotis';
    if (s.contains('barley')) return 'Fiber-packed pearl jau grains for soups & drinks';
    if (s.contains('brown rice')) return 'Unpolished long-grain fiber-rich brown basmati';
    if (s.contains('dalia')) return 'Broken wheat grain for savory & sweet porridge';
    if (s.contains('corn flake')) return 'Crispy golden toasted corn breakfast cereal';
    if (s.contains('muesli')) return 'Fruit & nut crunchy muesli with seeds & rolled oats';
    if (s.contains('wheat')) return 'Sharbati golden MP whole wheat grains';
    if (s.contains('multigrain')) return 'Nutritious 7-grain composite super mix';

    return 'Multiple weights (100g, 250g, 500g, 1kg) available';
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
