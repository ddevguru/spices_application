import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/category_model.dart';
import '../models/product_model.dart';
import '../models/variant_model.dart';
import '../models/banner_model.dart';
import '../models/coupon_model.dart';
import '../models/order_model.dart';
import '../models/user_model.dart';

class MockDataService {
  static final MockDataService _instance = MockDataService._internal();
  factory MockDataService() => _instance;
  MockDataService._internal();

  static const String _baseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'https://dryfruits-api.onrender.com/api');
  bool _serverAvailable = false;

  // Cached in-memory storage
  List<Category> _categories = [];
  List<Product> _products = [];
  List<PromoBanner> _banners = [];
  List<Coupon> _coupons = [];
  List<CustomerOrder> _orders = [];
  UserProfile _userProfile = const UserProfile(
    id: 'cust_default',
    name: 'Member',
    email: '',
    phone: '',
    avatarUrl: '',
    addresses: [],
  );

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;

    // Check if live backend server is up
    try {
      final res = await http.get(Uri.parse('$_baseUrl/health')).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        _serverAvailable = true;
        // Fetch live products from backend (PostgreSQL on Render)
        final prodRes = await http.get(Uri.parse('$_baseUrl/products')).timeout(const Duration(seconds: 8));
        if (prodRes.statusCode == 200) {
          final dynamic decoded = jsonDecode(prodRes.body);
          final List list = decoded is List ? decoded : (decoded['data'] ?? []);
          if (list.isNotEmpty) {
            _products = list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
          }
        }
        // Fetch live categories from backend (PostgreSQL on Render)
        final catRes = await http.get(Uri.parse('$_baseUrl/categories')).timeout(const Duration(seconds: 8));
        if (catRes.statusCode == 200) {
          final dynamic decoded = jsonDecode(catRes.body);
          final List list = decoded is List ? decoded : (decoded['data'] ?? []);
          if (list.isNotEmpty) {
            _categories = list.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
          }
        }
      }
    } catch (_) {
      _serverAvailable = false;
    }

    // Load initial seed if offline or server returned empty
    if (_categories.isEmpty || _products.isEmpty) {
      _loadSeedData();
    }

    // Load persisted local changes if offline
    final prefs = await SharedPreferences.getInstance();
    final localOrdersJson = prefs.getString('local_orders');
    if (localOrdersJson != null) {
      try {
        final list = jsonDecode(localOrdersJson) as List<dynamic>;
        _orders = list.map((e) => CustomerOrder.fromJson(e as Map<String, dynamic>)).toList();
      } catch (_) {}
    }

    _initialized = true;
  }

  void _loadSeedData() {
    _categories = [
      const Category(
        id: 'cat_dry_fruits',
        name: 'Dry Fruits',
        slug: 'dry-fruits',
        image: 'assets/images/cat_dryfruits.jpg',
        description: 'Rich in essential nutrients, vitamins, and healthy fats.',
        order: 1,
        isActive: true,
        subcategories: [
          'Almonds',
          'Cashews',
          'Pistachios',
          'Walnuts',
          'Raisins',
          'Dates',
          'Figs',
          'Anjeer',
          'Apricots',
          'Mixed Dry Fruits',
          'Seeds & Nuts',
        ],
      ),
      const Category(
        id: 'cat_whole_spices',
        name: 'Whole Spices',
        slug: 'whole-spices',
        image: 'assets/images/cat_wholespices.jpg',
        description: 'Aromatic, pure and hand-selected whole spices.',
        order: 2,
        isActive: true,
        subcategories: [
          'Green Cardamom',
          'Black Cardamom',
          'Cinnamon Sticks',
          'Cloves',
          'Black Pepper',
          'Cumin Seeds',
          'Coriander Seeds',
          'Fennel Seeds',
          'Mustard Seeds',
          'Star Anise',
          'Bay Leaves',
          'Fenugreek Seeds',
          'Dry Red Chillies',
        ],
      ),
      const Category(
        id: 'cat_blended_spices',
        name: 'Blended Spices',
        slug: 'blended-spices',
        image: 'assets/images/cat_blendedspices.jpg',
        description: 'Authentic heritage spice blends ground to perfection.',
        order: 3,
        isActive: true,
        subcategories: [
          'Garam Masala',
          'Kitchen King Masala',
          'Biryani Masala',
          'Chole Masala',
          'Pav Bhaji Masala',
          'Paneer Masala',
          'Chicken Masala',
          'Meat Masala',
          'Sambhar Masala',
          'Tandoori Masala',
          'Turmeric Powder',
          'Red Chilli Powder',
          'Coriander Powder',
          'Cumin Powder',
        ],
      ),
      const Category(
        id: 'cat_cereals',
        name: 'Cereals',
        slug: 'cereals',
        image: 'assets/images/cat_cereals.jpg',
        description: 'Nutritious whole grains, millets, oats and superfoods.',
        order: 4,
        isActive: true,
        subcategories: [
          'Oats',
          'Rolled Oats',
          'Quinoa',
          'Millets',
          'Ragi',
          'Jowar',
          'Bajra',
          'Barley',
          'Brown Rice',
          'Dalia',
          'Corn Flakes',
          'Muesli',
          'Wheat',
          'Multigrain Mix',
        ],
      ),
    ];

    _products = [
      const Product(
        id: 'p_ajwa_dates',
        name: 'Saudi Royal Ajwa Dates (Ajwa Khejur)',
        brand: 'Naturale Royal',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Dates',
        subcategoryName: 'Dates',
        shortDescription: 'Soft, luscious sacred Ajwa dates from Madinah.',
        description: 'Authentic Saudi Arabian Royal Ajwa dates (Ajwa Khejur) carefully sun-ripened in Madinah orchards. Revered for their distinctive fine texture, rich natural sweetness, and exceptional antioxidant, potassium, and magnesium content.',
        rating: 4.9,
        reviewCount: 380,
        image: 'assets/images/cat_dryfruits.jpg',
        galleryImages: [
          'assets/images/cat_dryfruits.jpg',
          'assets/images/banner_discount.jpg',
        ],
        origin: 'Al-Madinah, Saudi Arabia',
        ingredients: '100% Pure Natural Sun-ripened Ajwa Dates',
        nutritionFacts: {
          'Energy': '282 kcal',
          'Carbohydrates': '75.0 g',
          'Dietary Fiber': '8.0 g',
          'Potassium': '696 mg',
          'Protein': '2.5 g',
        },
        storageInstructions: 'Store in cool dry place.',
        specifications: {
          'Grade': 'Jumbo Premium Royal',
          'Shelf Life': '12 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        isTrending: true,
        isSpecialOffer: false,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_ajwa_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 160,
            originalPrice: 199,
            stockQuantity: 95,
            sku: 'DF-AJW-100',
          ),
          ProductVariant(
            id: 'v_ajwa_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 380,
            originalPrice: 475,
            stockQuantity: 70,
            sku: 'DF-AJW-250',
          ),
          ProductVariant(
            id: 'v_ajwa_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 740,
            originalPrice: 920,
            stockQuantity: 50,
            sku: 'DF-AJW-500',
          ),
          ProductVariant(
            id: 'v_ajwa_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 1450,
            originalPrice: 1800,
            stockQuantity: 30,
            sku: 'DF-AJW-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_mixed_dry_fruits',
        name: 'Gourmet Royal Mixed Dry Fruits Bowl',
        brand: 'Naturale Gourmet',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Mixed Dry Fruits',
        subcategoryName: 'Mixed Dry Fruits',
        shortDescription: 'Signature mix of almonds, cashews, walnuts, pistachios, dates & apricots.',
        description: 'The ultimate power booster mix! Hand-curated proportions of Californian Almonds, Mangalore Cashews, Snow White Walnuts, Afghan Green Pistachios, Dried Apricots, and Royal Dates.',
        rating: 4.9,
        reviewCount: 520,
        image: 'assets/images/banner_discount.jpg',
        galleryImages: [
          'assets/images/banner_discount.jpg',
          'assets/images/cat_dryfruits.jpg',
        ],
        origin: 'Global Selection (Handpicked in India)',
        ingredients: 'Almonds, Cashews, Walnuts, Pistachios, Apricots, Dates',
        nutritionFacts: {
          'Energy': '540 kcal',
          'Protein': '17.5 g',
          'Fiber': '9.5 g',
        },
        storageInstructions: 'Store sealed in airtight glass container.',
        specifications: {
          'Processing': 'Slow-roasted & unseasoned',
          'Shelf Life': '9 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        isTrending: true,
        isSpecialOffer: true,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_mixed_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 150,
            originalPrice: 180,
            stockQuantity: 120,
            sku: 'DF-MIX-100',
          ),
          ProductVariant(
            id: 'v_mixed_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 350,
            originalPrice: 420,
            stockQuantity: 80,
            sku: 'DF-MIX-250',
          ),
          ProductVariant(
            id: 'v_mixed_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 680,
            originalPrice: 820,
            stockQuantity: 65,
            sku: 'DF-MIX-500',
          ),
          ProductVariant(
            id: 'v_mixed_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 1320,
            originalPrice: 1600,
            stockQuantity: 40,
            sku: 'DF-MIX-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_almonds',
        name: 'California Whole Almonds (Almond Nut)',
        brand: 'Naturale Pure',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Almonds',
        subcategoryName: 'Almonds',
        shortDescription: 'Jumbo California almonds, crisp & rich in Vitamin E.',
        description: 'Our premium California almonds are carefully selected from the finest orchards. Naturally rich in protein, healthy fats, fiber, and antioxidant Vitamin E, these crunchy dry fruits offer unmatched freshness and natural buttery flavor.',
        rating: 4.9,
        reviewCount: 420,
        image: 'assets/images/prod_almonds.jpg',
        galleryImages: [
          'assets/images/prod_almonds.jpg',
          'assets/images/cat_dryfruits.jpg',
        ],
        origin: 'California, USA',
        ingredients: '100% Pure Raw California Almonds',
        nutritionFacts: {
          'Energy': '579 kcal',
          'Protein': '21.2 g',
          'Total Fat': '49.9 g',
          'Fiber': '12.5 g',
          'Carbohydrates': '21.6 g',
        },
        storageInstructions: 'Store in an airtight container in a cool, dry place away from sunlight.',
        specifications: {
          'Grade': 'Extra No. 1 Jumbo',
          'Moisture': '< 6%',
          'Shelf Life': '12 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        isTrending: true,
        isSpecialOffer: false,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_almonds_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 120,
            originalPrice: 150,
            stockQuantity: 85,
            sku: 'DF-ALM-100',
          ),
          ProductVariant(
            id: 'v_almonds_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 280,
            originalPrice: 350,
            stockQuantity: 60,
            sku: 'DF-ALM-250',
          ),
          ProductVariant(
            id: 'v_almonds_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 540,
            originalPrice: 650,
            stockQuantity: 40,
            sku: 'DF-ALM-500',
          ),
          ProductVariant(
            id: 'v_almonds_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 1050,
            originalPrice: 1280,
            stockQuantity: 25,
            sku: 'DF-ALM-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_almonds_mamra',
        name: 'Iranian Mamra Almonds',
        brand: 'Naturale Royal',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Almonds',
        subcategoryName: 'Almonds',
        shortDescription: '100% authentic Mamra almonds with exceptional natural oil content.',
        description: 'Prized worldwide for their distinctive curved boat shape and high natural almond oil content. Organic, unpasteurized, and full of vitality.',
        rating: 4.95,
        reviewCount: 380,
        image: 'assets/images/prod_almonds.jpg',
        galleryImages: ['assets/images/prod_almonds.jpg', 'assets/images/cat_dryfruits.jpg'],
        origin: 'Iran',
        ingredients: '100% Pure Raw Mamra Almonds',
        nutritionFacts: {'Energy': '610 kcal', 'Protein': '22.0 g', 'Almond Oil': '50%'},
        storageInstructions: 'Store in airtight glass container.',
        specifications: {'Grade': 'Royal Grade A Mamra', 'Shelf Life': '12 Months'},
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        variants: [
          ProductVariant(id: 'v_mamra_100', weightInGrams: 100, unit: 'GM', title: '100 GM', price: 260, originalPrice: 320, stockQuantity: 60, sku: 'DF-MMR-100'),
          ProductVariant(id: 'v_mamra_250', weightInGrams: 250, unit: 'GM', title: '250 GM', price: 620, originalPrice: 750, stockQuantity: 45, sku: 'DF-MMR-250'),
          ProductVariant(id: 'v_mamra_500', weightInGrams: 500, unit: 'GM', title: '500 GM', price: 1180, originalPrice: 1450, stockQuantity: 30, sku: 'DF-MMR-500'),
          ProductVariant(id: 'v_mamra_1000', weightInGrams: 1000, unit: 'KG', title: '1 KG', price: 2250, originalPrice: 2800, stockQuantity: 15, sku: 'DF-MMR-1000'),
        ],
      ),
      const Product(
        id: 'p_almonds_gurbandi',
        name: 'Gurbandi Almonds (Chhoti Giri)',
        brand: 'Naturale Pure',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Almonds',
        subcategoryName: 'Almonds',
        shortDescription: 'High-energy Afghan Gurbandi almonds packed with natural nutrients.',
        description: 'Small in size yet remarkably potent in natural oils and antioxidants. Traditionally revered in Ayurvedic wellness for boosting memory and strength.',
        rating: 4.85,
        reviewCount: 210,
        image: 'assets/images/prod_almonds.jpg',
        galleryImages: ['assets/images/prod_almonds.jpg'],
        origin: 'Afghanistan',
        ingredients: '100% Afghan Gurbandi Almonds',
        nutritionFacts: {'Energy': '595 kcal', 'Protein': '21.5 g', 'Omega-6': '12.0 g'},
        storageInstructions: 'Keep in cool dry place.',
        specifications: {'Grade': 'Authentic Gurbandi', 'Shelf Life': '12 Months'},
        allowCustomWeight: true,
        variants: [
          ProductVariant(id: 'v_gurbandi_100', weightInGrams: 100, unit: 'GM', title: '100 GM', price: 180, originalPrice: 220, stockQuantity: 70, sku: 'DF-GRB-100'),
          ProductVariant(id: 'v_gurbandi_250', weightInGrams: 250, unit: 'GM', title: '250 GM', price: 420, originalPrice: 520, stockQuantity: 50, sku: 'DF-GRB-250'),
          ProductVariant(id: 'v_gurbandi_500', weightInGrams: 500, unit: 'GM', title: '500 GM', price: 800, originalPrice: 990, stockQuantity: 35, sku: 'DF-GRB-500'),
          ProductVariant(id: 'v_gurbandi_1000', weightInGrams: 1000, unit: 'KG', title: '1 KG', price: 1550, originalPrice: 1900, stockQuantity: 20, sku: 'DF-GRB-1000'),
        ],
      ),
      const Product(
        id: 'p_almonds_regular',
        name: 'Regular Almonds',
        brand: 'Naturale Daily',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Almonds',
        subcategoryName: 'Almonds',
        shortDescription: 'Affordable, crunchy wholesome everyday almonds.',
        description: 'Carefully sorted whole almonds ideal for daily soaking, milk shakes, homemade almond butter, and daily baking.',
        rating: 4.75,
        reviewCount: 165,
        image: 'assets/images/prod_almonds.jpg',
        galleryImages: ['assets/images/prod_almonds.jpg'],
        origin: 'India',
        ingredients: '100% Whole Almond Kernels',
        nutritionFacts: {'Energy': '575 kcal', 'Protein': '20.0 g'},
        storageInstructions: 'Store in airtight pouch.',
        specifications: {'Grade': 'Standard Grade', 'Shelf Life': '9 Months'},
        allowCustomWeight: true,
        variants: [
          ProductVariant(id: 'v_reg_100', weightInGrams: 100, unit: 'GM', title: '100 GM', price: 100, originalPrice: 130, stockQuantity: 120, sku: 'DF-REG-100'),
          ProductVariant(id: 'v_reg_250', weightInGrams: 250, unit: 'GM', title: '250 GM', price: 240, originalPrice: 300, stockQuantity: 80, sku: 'DF-REG-250'),
          ProductVariant(id: 'v_reg_500', weightInGrams: 500, unit: 'GM', title: '500 GM', price: 460, originalPrice: 580, stockQuantity: 60, sku: 'DF-REG-500'),
          ProductVariant(id: 'v_reg_1000', weightInGrams: 1000, unit: 'KG', title: '1 KG', price: 890, originalPrice: 1100, stockQuantity: 40, sku: 'DF-REG-1000'),
        ],
      ),
      const Product(
        id: 'p_almonds_roasted',
        name: 'Premium Roasted Almonds',
        brand: 'Naturale Gourmet',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Almonds',
        subcategoryName: 'Almonds',
        shortDescription: 'Slow dry-roasted to golden crunch without added oil.',
        description: 'Freshly roasted whole almonds with an aromatic, deep toasted nutty aroma. Oil-free roasting retains natural crispness and premium wholesome flavor.',
        rating: 4.9,
        reviewCount: 290,
        image: 'assets/images/prod_almonds.jpg',
        galleryImages: ['assets/images/prod_almonds.jpg'],
        origin: 'California, USA',
        ingredients: '100% Dry-Roasted Whole Almonds',
        nutritionFacts: {'Energy': '590 kcal', 'Protein': '21.0 g'},
        storageInstructions: 'Store in cool dry place.',
        specifications: {'Roast Level': 'Medium Golden', 'Oil': '0% Added Oil'},
        allowCustomWeight: true,
        variants: [
          ProductVariant(id: 'v_roast_100', weightInGrams: 100, unit: 'GM', title: '100 GM', price: 140, originalPrice: 175, stockQuantity: 90, sku: 'DF-RST-100'),
          ProductVariant(id: 'v_roast_250', weightInGrams: 250, unit: 'GM', title: '250 GM', price: 320, originalPrice: 400, stockQuantity: 65, sku: 'DF-RST-250'),
          ProductVariant(id: 'v_roast_500', weightInGrams: 500, unit: 'GM', title: '500 GM', price: 620, originalPrice: 760, stockQuantity: 40, sku: 'DF-RST-500'),
          ProductVariant(id: 'v_roast_1000', weightInGrams: 1000, unit: 'KG', title: '1 KG', price: 1190, originalPrice: 1450, stockQuantity: 25, sku: 'DF-RST-1000'),
        ],
      ),
      const Product(
        id: 'p_almonds_salted',
        name: 'Salted Almonds',
        brand: 'Naturale Gourmet',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Almonds',
        subcategoryName: 'Almonds',
        shortDescription: 'Roasted almonds lightly dusted with pure Himalayan pink salt.',
        description: 'Crispy roasted whole almonds seasoned with a balanced touch of fine Himalayan pink rock salt. The ultimate gourmet healthy snack.',
        rating: 4.88,
        reviewCount: 240,
        image: 'assets/images/prod_almonds.jpg',
        galleryImages: ['assets/images/prod_almonds.jpg'],
        origin: 'California, USA',
        ingredients: 'Roasted Almonds (98%), Himalayan Rock Salt (2%)',
        nutritionFacts: {'Energy': '588 kcal', 'Protein': '21.0 g', 'Sodium': '180 mg'},
        storageInstructions: 'Reseal pouch tightly after opening.',
        specifications: {'Seasoning': 'Pink Rock Salt', 'Shelf Life': '9 Months'},
        allowCustomWeight: true,
        variants: [
          ProductVariant(id: 'v_salt_100', weightInGrams: 100, unit: 'GM', title: '100 GM', price: 150, originalPrice: 185, stockQuantity: 85, sku: 'DF-SLT-100'),
          ProductVariant(id: 'v_salt_250', weightInGrams: 250, unit: 'GM', title: '250 GM', price: 340, originalPrice: 420, stockQuantity: 60, sku: 'DF-SLT-250'),
          ProductVariant(id: 'v_salt_500', weightInGrams: 500, unit: 'GM', title: '500 GM', price: 650, originalPrice: 800, stockQuantity: 40, sku: 'DF-SLT-500'),
          ProductVariant(id: 'v_salt_1000', weightInGrams: 1000, unit: 'KG', title: '1 KG', price: 1250, originalPrice: 1550, stockQuantity: 20, sku: 'DF-SLT-1000'),
        ],
      ),
      const Product(
        id: 'p_cashews',
        name: 'Royal Mangalore Cashews (W240)',
        brand: 'Naturale Pure',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Cashews',
        subcategoryName: 'Cashews',
        shortDescription: 'Whole jumbo W240 cashews, velvety, creamy & sweet.',
        description: 'Graded W240 jumbo cashew nuts hand-processed in Karnataka. Sweet, buttery crunch with zero cholesterol. Exceptional quality for daily snacking, festive gifting, or gourmet culinary creations.',
        rating: 4.8,
        reviewCount: 310,
        image: 'assets/images/prod_cashews.jpg',
        galleryImages: [
          'assets/images/prod_cashews.jpg',
          'assets/images/cat_dryfruits.jpg',
        ],
        origin: 'Mangalore, India',
        ingredients: '100% Whole Cashew Kernels (W240)',
        nutritionFacts: {
          'Energy': '553 kcal',
          'Protein': '18.2 g',
          'Total Fat': '43.8 g',
          'Fiber': '3.3 g',
          'Carbohydrates': '30.1 g',
        },
        storageInstructions: 'Store in a cool dry place in sealed glass or airtight jar.',
        specifications: {
          'Grade': 'W240 Jumbo Whole',
          'Processing': 'Sun dried & air sorted',
          'Shelf Life': '9 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        isTrending: true,
        isSpecialOffer: false,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_cashews_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 140,
            originalPrice: 170,
            stockQuantity: 50,
            sku: 'DF-CSH-100',
          ),
          ProductVariant(
            id: 'v_cashews_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 320,
            originalPrice: 390,
            stockQuantity: 45,
            sku: 'DF-CSH-250',
          ),
          ProductVariant(
            id: 'v_cashews_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 620,
            originalPrice: 750,
            stockQuantity: 30,
            sku: 'DF-CSH-500',
          ),
          ProductVariant(
            id: 'v_cashews_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 1190,
            originalPrice: 1450,
            stockQuantity: 18,
            sku: 'DF-CSH-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_pistachios',
        name: 'Roasted & Salted Iranian Pistachios',
        brand: 'Naturale Pure',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Pistachios',
        subcategoryName: 'Pistachios',
        shortDescription: 'Crisp in-shell pistachios lightly seasoned with pink Himalayan salt.',
        description: 'Authentic jumbo pistachios naturally opened on tree branches, lightly roasted to perfection with Himalayan pink salt. High in potassium, antioxidants, and dietary fiber.',
        rating: 4.9,
        reviewCount: 275,
        image: 'assets/images/prod_pistachios.jpg',
        galleryImages: [
          'assets/images/prod_pistachios.jpg',
        ],
        origin: 'Iran',
        ingredients: 'Pistachios (98%), Himalayan Rock Salt (2%)',
        nutritionFacts: {
          'Energy': '562 kcal',
          'Protein': '20.2 g',
          'Total Fat': '45.3 g',
          'Fiber': '10.6 g',
          'Carbohydrates': '27.5 g',
        },
        storageInstructions: 'Keep sealed to preserve signature crispness.',
        specifications: {
          'Grade': 'Super Jumbo Akbari',
          'Salt Level': 'Low (< 1.5%)',
          'Shelf Life': '12 Months',
        },
        allowCustomWeight: true,
        isFeatured: false,
        isBestSeller: true,
        isTrending: true,
        isSpecialOffer: true,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_pista_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 160,
            originalPrice: 195,
            stockQuantity: 40,
            sku: 'DF-PST-100',
          ),
          ProductVariant(
            id: 'v_pista_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 380,
            originalPrice: 460,
            stockQuantity: 35,
            sku: 'DF-PST-250',
          ),
          ProductVariant(
            id: 'v_pista_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 720,
            originalPrice: 880,
            stockQuantity: 22,
            sku: 'DF-PST-500',
          ),
          ProductVariant(
            id: 'v_pista_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 1390,
            originalPrice: 1680,
            stockQuantity: 14,
            sku: 'DF-PST-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_walnuts',
        name: 'Kashmiri Snow-White Walnut Halves',
        brand: 'Naturale Pure',
        categoryId: 'cat_dry_fruits',
        categoryName: 'Dry Fruits',
        subcategoryId: 'Walnuts',
        subcategoryName: 'Walnuts',
        shortDescription: 'Extra light halves from Kashmir valley, potent in Omega-3.',
        description: 'Organically harvested in high-altitude Kashmiri valleys. Rich in ALA Omega-3 fatty acids for optimal brain health, heart vitality, and glowing skin.',
        rating: 4.9,
        reviewCount: 184,
        image: 'assets/images/prod_walnuts.jpg',
        galleryImages: [
          'assets/images/prod_walnuts.jpg',
        ],
        origin: 'Kashmir, India',
        ingredients: '100% Kashmir Walnut Kernels (Halves)',
        nutritionFacts: {
          'Energy': '654 kcal',
          'Protein': '15.2 g',
          'Total Fat': '65.2 g',
          'Fiber': '6.7 g',
          'Carbohydrates': '13.7 g',
        },
        storageInstructions: 'Best refrigerated after opening.',
        specifications: {
          'Grade': 'Extra Light Halves',
          'Omega-3 Content': '9.1g per 100g',
          'Shelf Life': '9 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: false,
        isTrending: true,
        isSpecialOffer: false,
        isNewArrival: true,
        variants: [
          ProductVariant(
            id: 'v_walnut_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 150,
            originalPrice: 180,
            stockQuantity: 30,
            sku: 'DF-WLN-100',
          ),
          ProductVariant(
            id: 'v_walnut_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 360,
            originalPrice: 420,
            stockQuantity: 25,
            sku: 'DF-WLN-250',
          ),
          ProductVariant(
            id: 'v_walnut_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 690,
            originalPrice: 810,
            stockQuantity: 16,
            sku: 'DF-WLN-500',
          ),
          ProductVariant(
            id: 'v_walnut_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 1340,
            originalPrice: 1590,
            stockQuantity: 10,
            sku: 'DF-WLN-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_cardamom',
        name: 'Idukki Green Cardamom (8mm+ Bold)',
        brand: 'Naturale Spices',
        categoryId: 'cat_whole_spices',
        categoryName: 'Whole Spices',
        subcategoryId: 'Green Cardamom',
        subcategoryName: 'Green Cardamom',
        shortDescription: 'Queen of spices: aromatic 8mm+ bold green pods from Kerala.',
        description: 'Directly sourced from misty cardamom hills of Idukki, Kerala. Lush green pods bursting with intense floral aroma, essential oils, and therapeutic digestive benefits.',
        rating: 5.0,
        reviewCount: 192,
        image: 'assets/images/prod_cardamom.jpg',
        galleryImages: [
          'assets/images/prod_cardamom.jpg',
        ],
        origin: 'Idukki, Kerala, India',
        ingredients: '100% Whole Green Cardamom',
        nutritionFacts: {
          'Energy': '311 kcal',
          'Protein': '10.8 g',
          'Total Fat': '6.7 g',
          'Fiber': '28.0 g',
          'Carbohydrates': '68.5 g',
        },
        storageInstructions: 'Keep in an airtight jar in a cool dark cabinet.',
        specifications: {
          'Pod Size': '8mm+ Super Bold',
          'Color': 'Natural Fresh Green',
          'Shelf Life': '18 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        isTrending: true,
        isSpecialOffer: false,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_card_50',
            weightInGrams: 50,
            unit: 'GM',
            title: '50 GM',
            price: 180,
            originalPrice: 220,
            stockQuantity: 90,
            sku: 'WS-CRD-050',
          ),
          ProductVariant(
            id: 'v_card_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 340,
            originalPrice: 410,
            stockQuantity: 75,
            sku: 'WS-CRD-100',
          ),
          ProductVariant(
            id: 'v_card_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 820,
            originalPrice: 980,
            stockQuantity: 40,
            sku: 'WS-CRD-250',
          ),
          ProductVariant(
            id: 'v_card_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 1580,
            originalPrice: 1890,
            stockQuantity: 20,
            sku: 'WS-CRD-500',
          ),
        ],
      ),
      const Product(
        id: 'p_cinnamon',
        name: 'Ceylon Cinnamon Sticks (True Cinnamon)',
        brand: 'Naturale Spices',
        categoryId: 'cat_whole_spices',
        categoryName: 'Whole Spices',
        subcategoryId: 'Cinnamon Sticks',
        subcategoryName: 'Cinnamon Sticks',
        shortDescription: 'Sweet delicate layers of authentic Ceylon Cinnamomum verum.',
        description: 'Authentic Ceylon cinnamon rolls imported from Sri Lanka. Unlike toxic cassia, true Ceylon cinnamon has low coumarin levels, delicate sweet woodiness, and multi-layered paper-thin quills.',
        rating: 4.9,
        reviewCount: 160,
        image: 'assets/images/prod_cinnamon.jpg',
        galleryImages: [
          'assets/images/prod_cinnamon.jpg',
        ],
        origin: 'Sri Lanka',
        ingredients: '100% True Ceylon Cinnamon Quills',
        nutritionFacts: {
          'Energy': '247 kcal',
          'Protein': '4.0 g',
          'Total Fat': '1.2 g',
          'Fiber': '53.1 g',
          'Carbohydrates': '80.6 g',
        },
        storageInstructions: 'Airtight glass bottle in cool environment.',
        specifications: {
          'Grade': 'Alba / C5 Special',
          'Coumarin': '< 0.004% (Safe)',
          'Shelf Life': '24 Months',
        },
        allowCustomWeight: true,
        isFeatured: false,
        isBestSeller: false,
        isTrending: true,
        isSpecialOffer: true,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_cin_50',
            weightInGrams: 50,
            unit: 'GM',
            title: '50 GM',
            price: 95,
            originalPrice: 120,
            stockQuantity: 80,
            sku: 'WS-CIN-050',
          ),
          ProductVariant(
            id: 'v_cin_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 180,
            originalPrice: 230,
            stockQuantity: 60,
            sku: 'WS-CIN-100',
          ),
          ProductVariant(
            id: 'v_cin_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 420,
            originalPrice: 520,
            stockQuantity: 35,
            sku: 'WS-CIN-250',
          ),
          ProductVariant(
            id: 'v_cin_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 790,
            originalPrice: 990,
            stockQuantity: 15,
            sku: 'WS-CIN-500',
          ),
        ],
      ),
      const Product(
        id: 'p_garam_masala',
        name: 'Royal Shahi Garam Masala',
        brand: 'Naturale Heritage',
        categoryId: 'cat_blended_spices',
        categoryName: 'Blended Spices',
        subcategoryId: 'Garam Masala',
        subcategoryName: 'Garam Masala',
        shortDescription: 'Handcrafted blend of 16 roasted whole spices & stone-ground herbs.',
        description: 'Time-honored royal recipe combining roasted cardamom, cloves, cinnamon, mace, nutmeg, black cumin, and bay leaf. Stone ground at slow RPM to preserve volatile aromatic oils.',
        rating: 4.9,
        reviewCount: 490,
        image: 'assets/images/prod_garammasala.jpg',
        galleryImages: [
          'assets/images/prod_garammasala.jpg',
        ],
        origin: 'Rajasthan, India',
        ingredients: 'Coriander, Cumin, Cardamom, Cloves, Cinnamon, Star Anise, Black Pepper, Nutmeg, Mace, Bay Leaf',
        nutritionFacts: {
          'Energy': '370 kcal',
          'Protein': '12.0 g',
          'Total Fat': '15.0 g',
          'Fiber': '22.0 g',
          'Carbohydrates': '46.0 g',
        },
        storageInstructions: 'Airtight container away from steam and humidity.',
        specifications: {
          'Blend Count': '16 Pure Spices',
          'Artificial Colors': '0%',
          'Shelf Life': '12 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        isTrending: false,
        isSpecialOffer: false,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_gm_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 110,
            originalPrice: 140,
            stockQuantity: 120,
            sku: 'BS-SGM-100',
          ),
          ProductVariant(
            id: 'v_gm_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 250,
            originalPrice: 320,
            stockQuantity: 90,
            sku: 'BS-SGM-250',
          ),
          ProductVariant(
            id: 'v_gm_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 470,
            originalPrice: 590,
            stockQuantity: 50,
            sku: 'BS-SGM-500',
          ),
          ProductVariant(
            id: 'v_gm_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 890,
            originalPrice: 1100,
            stockQuantity: 25,
            sku: 'BS-SGM-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_turmeric',
        name: 'Lakadong Organic Turmeric Powder (7% Curcumin)',
        brand: 'Naturale Heritage',
        categoryId: 'cat_blended_spices',
        categoryName: 'Blended Spices',
        subcategoryId: 'Turmeric Powder',
        subcategoryName: 'Turmeric Powder',
        shortDescription: 'High curcumin (7%+) therapeutic turmeric from Meghalaya.',
        description: 'Cultivated in the pristine Jaintia Hills of Meghalaya, Lakadong turmeric is globally celebrated for containing over 7% natural curcumin. Deep golden hue, rich earthy aroma, and strong anti-inflammatory properties.',
        rating: 5.0,
        reviewCount: 380,
        image: 'assets/images/prod_turmeric.jpg',
        galleryImages: [
          'assets/images/prod_turmeric.jpg',
        ],
        origin: 'Meghalaya, India',
        ingredients: '100% Organic Lakadong Turmeric Root Powder',
        nutritionFacts: {
          'Curcumin': '7.2%',
          'Energy': '354 kcal',
          'Protein': '7.8 g',
          'Total Fat': '9.9 g',
          'Fiber': '21.1 g',
        },
        storageInstructions: 'Cool, dark place in an airtight glass jar.',
        specifications: {
          'Curcumin Level': '> 7.0%',
          'Origin': 'Lakadong Village, Meghalaya',
          'Shelf Life': '18 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: false,
        isTrending: true,
        isSpecialOffer: true,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_tur_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: 85,
            originalPrice: 110,
            stockQuantity: 140,
            sku: 'BS-TUR-100',
          ),
          ProductVariant(
            id: 'v_tur_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 195,
            originalPrice: 250,
            stockQuantity: 100,
            sku: 'BS-TUR-250',
          ),
          ProductVariant(
            id: 'v_tur_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 360,
            originalPrice: 460,
            stockQuantity: 60,
            sku: 'BS-TUR-500',
          ),
          ProductVariant(
            id: 'v_tur_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 680,
            originalPrice: 880,
            stockQuantity: 35,
            sku: 'BS-TUR-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_rolled_oats',
        name: 'Gluten-Free Jumbo Rolled Oats',
        brand: 'Naturale Grains',
        categoryId: 'cat_cereals',
        categoryName: 'Cereals',
        subcategoryId: 'Rolled Oats',
        subcategoryName: 'Rolled Oats',
        shortDescription: '100% whole grain rolled oats rich in beta-glucan heart fibers.',
        description: 'Steamed and gently rolled whole oat groats. Packed with soluble beta-glucan fiber to support cardiovascular health, sustain energetic mornings, and provide creamy textured oatmeal or homemade granola.',
        rating: 4.8,
        reviewCount: 260,
        image: 'assets/images/prod_oats.jpg',
        galleryImages: [
          'assets/images/prod_oats.jpg',
        ],
        origin: 'Australia',
        ingredients: '100% Certified Gluten-Free Whole Grain Oats',
        nutritionFacts: {
          'Energy': '389 kcal',
          'Protein': '16.9 g',
          'Total Fat': '6.9 g',
          'Fiber': '10.6 g',
          'Beta-Glucan': '4.2 g',
        },
        storageInstructions: 'Keep tightly closed in cool pantry.',
        specifications: {
          'Flake Thickness': '0.75 mm',
          'Gluten Level': '< 5 ppm (Gluten Free)',
          'Shelf Life': '12 Months',
        },
        allowCustomWeight: true,
        isFeatured: true,
        isBestSeller: true,
        isTrending: true,
        isSpecialOffer: false,
        isNewArrival: false,
        variants: [
          ProductVariant(
            id: 'v_oats_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 90,
            originalPrice: 120,
            stockQuantity: 80,
            sku: 'CR-OAT-250',
          ),
          ProductVariant(
            id: 'v_oats_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 160,
            originalPrice: 210,
            stockQuantity: 60,
            sku: 'CR-OAT-500',
          ),
          ProductVariant(
            id: 'v_oats_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 290,
            originalPrice: 380,
            stockQuantity: 45,
            sku: 'CR-OAT-1000',
          ),
        ],
      ),
      const Product(
        id: 'p_quinoa',
        name: 'Organic Royal White Quinoa',
        brand: 'Naturale Grains',
        categoryId: 'cat_cereals',
        categoryName: 'Cereals',
        subcategoryId: 'Quinoa',
        subcategoryName: 'Quinoa',
        shortDescription: 'Saponin-free pre-washed Andean supergrain with all 9 essential amino acids.',
        description: 'Complete plant protein loaded with iron, magnesium, fiber and antioxidants. Pre-washed to eliminate bitterness and cooks into a fluffy, slightly nutty grain ideal for wholesome bowls and salads.',
        rating: 4.9,
        reviewCount: 145,
        image: 'assets/images/prod_quinoa.jpg',
        galleryImages: [
          'assets/images/prod_quinoa.jpg',
        ],
        origin: 'Peru / Bolivia',
        ingredients: '100% Organic White Quinoa Seeds',
        nutritionFacts: {
          'Energy': '368 kcal',
          'Protein': '14.1 g',
          'Total Fat': '6.1 g',
          'Fiber': '7.0 g',
          'Iron': '4.6 mg',
        },
        storageInstructions: 'Airtight container in a dry location.',
        specifications: {
          'Pre-washed': 'Yes (Bitter Saponin Removed)',
          'Organic Certified': 'Yes',
          'Shelf Life': '18 Months',
        },
        allowCustomWeight: true,
        isFeatured: false,
        isBestSeller: false,
        isTrending: true,
        isSpecialOffer: true,
        isNewArrival: true,
        variants: [
          ProductVariant(
            id: 'v_qui_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: 140,
            originalPrice: 180,
            stockQuantity: 50,
            sku: 'CR-QUI-250',
          ),
          ProductVariant(
            id: 'v_qui_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: 260,
            originalPrice: 340,
            stockQuantity: 40,
            sku: 'CR-QUI-500',
          ),
          ProductVariant(
            id: 'v_qui_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: 490,
            originalPrice: 620,
            stockQuantity: 25,
            sku: 'CR-QUI-1000',
          ),
        ],
      ),
    ];

    _coupons = [
      const Coupon(
        id: 'cpn_welcome20',
        code: 'WELCOME20',
        description: '20% off on your first order above ₹500',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 500,
        maxDiscount: 300,
        expiryDate: '2026-12-31',
      ),
      const Coupon(
        id: 'cpn_flat100',
        code: 'NATURALE100',
        description: 'Flat ₹100 instant discount on orders above ₹800',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 800,
        maxDiscount: 100,
        expiryDate: '2026-12-31',
      ),
      const Coupon(
        id: 'cpn_spice15',
        code: 'SPICE15',
        description: '15% off on Whole & Blended Spices',
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 350,
        maxDiscount: 200,
        expiryDate: '2026-12-31',
      ),
    ];

    _banners = [
      const PromoBanner(
        id: 'bnr_1',
        title: '20% Discount',
        subtitle: 'Premium Dry Fruits Collection',
        description: 'Handpicked California almonds, cashews & walnuts.',
        image: 'assets/banners/banner_discount.jpg',
        ctaText: 'Shop Collection',
        targetCategory: 'cat_dry_fruits',
        badge: 'Special Offer',
        order: 1,
      ),
      const PromoBanner(
        id: 'bnr_2',
        title: 'Authentic Spices',
        subtitle: 'Discover Our Best Sellers',
        description: 'Freshly ground masalas & aromatic Kerala whole spices.',
        image: 'assets/banners/banner_collection.jpg',
        ctaText: 'Explore Flavours',
        targetCategory: 'cat_whole_spices',
        badge: 'Fresh Harvest',
        order: 2,
      ),
      const PromoBanner(
        id: 'bnr_3',
        title: 'Healthy Grains',
        subtitle: 'Nutritious Cereals & Millets',
        description: 'Power your mornings with gluten-free oats and organic quinoa.',
        image: 'assets/banners/banner_cereals.jpg',
        ctaText: 'Discover Cereals',
        targetCategory: 'cat_cereals',
        badge: 'Superfoods',
        order: 3,
      ),
    ];

    _orders = [];
  }

  // Categories API
  Future<List<Category>> getCategories() async {
    await init();
    return _categories;
  }

  // Products API
  Future<List<Product>> getProducts({
    String? categoryId,
    String? subcategory,
    String? searchQuery,
    String? sortBy,
    double? minPrice,
    double? maxPrice,
    int? filterWeightGrams,
  }) async {
    await init();
    var list = List<Product>.from(_products);

    if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') {
      list = list.where((p) => p.categoryId == categoryId).toList();
    }

    if (subcategory != null && subcategory.isNotEmpty && subcategory != 'all') {
      list = list.where((p) => p.subcategoryId == subcategory).toList();
    }

    if (searchQuery != null && searchQuery.trim().isNotEmpty) {
      final q = searchQuery.toLowerCase().trim();
      list = list.where((p) =>
        p.name.toLowerCase().contains(q) ||
        p.shortDescription.toLowerCase().contains(q) ||
        p.categoryName.toLowerCase().contains(q) ||
        p.subcategoryId.toLowerCase().contains(q) ||
        p.effectiveSku.toLowerCase().contains(q) ||
        p.effectiveBarcode.contains(q) ||
        p.variants.any((v) => v.sku.toLowerCase().contains(q) || v.effectiveBarcode.contains(q))
      ).toList();
    }

    if (minPrice != null) {
      list = list.where((p) => p.defaultVariant.price >= minPrice).toList();
    }

    if (maxPrice != null) {
      list = list.where((p) => p.defaultVariant.price <= maxPrice).toList();
    }

    if (filterWeightGrams != null) {
      list = list.where((p) => p.variants.any((v) => v.weightInGrams == filterWeightGrams)).toList();
    }

    if (sortBy != null) {
      switch (sortBy) {
        case 'price_low_high':
          list.sort((a, b) => a.defaultVariant.price.compareTo(b.defaultVariant.price));
          break;
        case 'price_high_low':
          list.sort((a, b) => b.defaultVariant.price.compareTo(a.defaultVariant.price));
          break;
        case 'rating':
          list.sort((a, b) => b.rating.compareTo(a.rating));
          break;
        case 'best_selling':
          list.sort((a, b) => (b.isBestSeller ? 1 : 0).compareTo(a.isBestSeller ? 1 : 0));
          break;
        case 'new_arrivals':
          list.sort((a, b) => (b.isNewArrival ? 1 : 0).compareTo(a.isNewArrival ? 1 : 0));
          break;
      }
    }

    return list;
  }

  Future<Product?> getProductById(String id) async {
    await init();
    final clean = id.trim().toUpperCase();
    if (clean.isEmpty) return null;

    // 1. Check direct ID match in loaded products
    try {
      return _products.firstWhere((p) => p.id.toUpperCase() == clean);
    } catch (_) {}

    // 2. Check SKU / Barcode / Variant matching in loaded products
    final localMatch = await getProductBySkuOrBarcode(id);
    if (localMatch != null) return localMatch;

    // 3. Live backend query: fetch product directly by ID or SKU from REST API
    try {
      final res = await http.get(Uri.parse('$_baseUrl/products/$clean')).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final dynamic decoded = jsonDecode(res.body);
        if (decoded is Map<String, dynamic> && decoded['id'] != null) {
          final prod = Product.fromJson(decoded);
          final existingIdx = _products.indexWhere((p) => p.id == prod.id);
          if (existingIdx != -1) {
            _products[existingIdx] = prod;
          } else {
            _products.add(prod);
          }
          return prod;
        }
      }
    } catch (_) {}

    // 4. Smart keyword fallback for known product types
    try {
      if (clean.contains('ALM') || clean.contains('BADAM') || clean.contains('ALMOND')) {
        return _products.firstWhere((p) => p.id.contains('almond') || p.name.toLowerCase().contains('almond'));
      }
      if (clean.contains('CSH') || clean.contains('KAJU') || clean.contains('CASHEW')) {
        return _products.firstWhere((p) => p.id.contains('cashew') || p.name.toLowerCase().contains('cashew'));
      }
      if (clean.contains('PST') || clean.contains('PISTA')) {
        return _products.firstWhere((p) => p.id.contains('pista') || p.name.toLowerCase().contains('pista'));
      }
      if (clean.contains('WLN') || clean.contains('AKHROT') || clean.contains('WALNUT')) {
        return _products.firstWhere((p) => p.id.contains('walnut') || p.name.toLowerCase().contains('walnut'));
      }
      if (clean.contains('AJW') || clean.contains('DATE') || clean.contains('KHAJOOR')) {
        return _products.firstWhere((p) => p.id.contains('date') || p.name.toLowerCase().contains('date'));
      }
      if (clean.contains('MIX')) {
        return _products.firstWhere((p) => p.id.contains('mix') || p.name.toLowerCase().contains('mix'));
      }
      if (clean.contains('CRD') || clean.contains('CARDAMOM') || clean.contains('ELAICHI')) {
        return _products.firstWhere((p) => p.id.contains('cardamom') || p.name.toLowerCase().contains('cardamom'));
      }
      if (clean.contains('CIN') || clean.contains('CINNAMON') || clean.contains('DALCHINI')) {
        return _products.firstWhere((p) => p.id.contains('cinnamon') || p.name.toLowerCase().contains('cinnamon'));
      }
    } catch (_) {}

    // 5. Ultimate fallback: first available product so app screen never renders blank
    return _products.isNotEmpty ? _products.first : null;
  }

  Future<Product?> getProductBySkuOrBarcode(String query) async {
    await init();
    final clean = query.trim().toUpperCase();
    if (clean.isEmpty) return null;

    try {
      // 1. Direct SKU or barcode or ID match
      return _products.firstWhere(
        (p) =>
            p.id.toUpperCase() == clean ||
            p.sku.toUpperCase() == clean ||
            p.effectiveSku.toUpperCase() == clean ||
            p.barcode == clean ||
            p.effectiveBarcode == clean ||
            p.variants.any((v) =>
                v.sku.toUpperCase() == clean ||
                v.barcode == clean ||
                v.effectiveBarcode == clean),
      );
    } catch (_) {}

    // 2. Prefix / Contains / Suffix Match (e.g. 'DF-ALM-101' matches variant 'DF-ALM-101-100G' or 'DF-ALM-101-250G')
    try {
      return _products.firstWhere(
        (p) =>
            (p.sku.isNotEmpty && (p.sku.toUpperCase().startsWith(clean) || clean.startsWith(p.sku.toUpperCase()))) ||
            p.variants.any((v) =>
                v.sku.toUpperCase().startsWith(clean) ||
                clean.startsWith(v.sku.toUpperCase()) ||
                v.sku.toUpperCase().replaceAll('-', '').contains(clean.replaceAll('-', ''))),
      );
    } catch (_) {}

    // 3. Check if it matches any subcategory variety
    for (final cat in _categories) {
      for (final sub in cat.subcategories) {
        final vars = _generateVarietiesForSubcategory(cat.id, sub);
        for (final p in vars) {
          if (p.id.toUpperCase() == clean ||
              p.sku.toUpperCase() == clean ||
              p.effectiveSku.toUpperCase() == clean ||
              p.barcode == clean ||
              p.effectiveBarcode == clean ||
              p.variants.any((v) =>
                  v.sku.toUpperCase() == clean ||
                  v.sku.toUpperCase().startsWith(clean) ||
                  clean.startsWith(v.sku.toUpperCase()) ||
                  v.barcode == clean)) {
            return p;
          }
        }
      }
    }

    // 4. Fallback: search by name
    try {
      return _products.firstWhere((p) => p.name.toUpperCase().contains(clean));
    } catch (_) {
      return null;
    }
  }

  Future<List<Product>> getProductsBySubcategory(String subcategory, {String? categoryId}) async {
    await init();
    final lowerSub = subcategory.trim().toLowerCase();

    // 1. Direct matches in _products
    final direct = _products.where((p) {
      final pSubId = p.subcategoryId.trim().toLowerCase();
      final pSubName = p.subcategoryName.trim().toLowerCase();
      final pName = p.name.trim().toLowerCase();
      return pSubId == lowerSub || pSubName == lowerSub || pName.contains(lowerSub);
    }).toList();

    if (direct.isNotEmpty) {
      return direct;
    }

    // 2. Generate authentic realistic varieties for this subcategory
    return _generateVarietiesForSubcategory(categoryId ?? 'cat_dry_fruits', subcategory);
  }

  List<Product> _generateVarietiesForSubcategory(String categoryId, String subcategory) {
    String image = 'assets/images/cat_dryfruits.jpg';
    String categoryName = 'Dry Fruits';
    double base100g = 120.0;

    if (categoryId.contains('spice') || categoryId.contains('whole')) {
      image = 'assets/images/cat_wholespices.jpg';
      categoryName = 'Whole Spices';
      base100g = 95.0;
    } else if (categoryId.contains('blend')) {
      image = 'assets/images/cat_blendedspices.jpg';
      categoryName = 'Blended Spices';
      base100g = 85.0;
    } else if (categoryId.contains('cereal')) {
      image = 'assets/images/cat_cereals.jpg';
      categoryName = 'Cereals';
      base100g = 65.0;
    }

    final varietyTitles = [
      'Premium Royal $subcategory',
      'Organic Natural $subcategory',
      'Select Heritage $subcategory',
      'Standard Daily $subcategory',
    ];

    return List.generate(varietyTitles.length, (idx) {
      final name = varietyTitles[idx];
      final multiplier = 1.0 + (idx * 0.15);
      final price100 = (base100g * multiplier).roundToDouble();
      final price250 = (price100 * 2.3).roundToDouble();
      final price500 = (price100 * 4.4).roundToDouble();
      final price1000 = (price100 * 8.5).roundToDouble();

      return Product(
        id: 'gen_${subcategory.toLowerCase().replaceAll(' ', '_')}_$idx',
        name: name,
        brand: idx == 0 ? 'Naturale Royal' : 'Naturale Pure',
        categoryId: categoryId,
        categoryName: categoryName,
        subcategoryId: subcategory,
        subcategoryName: subcategory,
        shortDescription: 'Pure, authentic hand-selected $subcategory sourced directly from certified farms.',
        description: 'Certified 100% natural $subcategory. Free from preservatives, artificial coloring, or polishing. Tested and vacuum-packed for peak freshness and authentic aroma.',
        rating: 4.8 + (idx * 0.05).clamp(0.0, 0.19),
        reviewCount: 95 + (idx * 30),
        image: image,
        galleryImages: [image],
        origin: 'India',
        ingredients: '100% Pure $subcategory',
        nutritionFacts: {'Purity': '100% Natural', 'Processing': 'Hand Selected & Graded'},
        storageInstructions: 'Store in airtight container in a cool, dry place.',
        specifications: {'Grade': 'Export Grade A', 'Shelf Life': '12 Months'},
        allowCustomWeight: true,
        variants: [
          ProductVariant(
            id: 'v_${subcategory.toLowerCase().replaceAll(' ', '_')}_${idx}_100',
            weightInGrams: 100,
            unit: 'GM',
            title: '100 GM',
            price: price100,
            originalPrice: (price100 * 1.25).roundToDouble(),
            stockQuantity: 50,
            sku: 'VAR-$idx-100',
          ),
          ProductVariant(
            id: 'v_${subcategory.toLowerCase().replaceAll(' ', '_')}_${idx}_250',
            weightInGrams: 250,
            unit: 'GM',
            title: '250 GM',
            price: price250,
            originalPrice: (price250 * 1.25).roundToDouble(),
            stockQuantity: 40,
            sku: 'VAR-$idx-250',
          ),
          ProductVariant(
            id: 'v_${subcategory.toLowerCase().replaceAll(' ', '_')}_${idx}_500',
            weightInGrams: 500,
            unit: 'GM',
            title: '500 GM',
            price: price500,
            originalPrice: (price500 * 1.25).roundToDouble(),
            stockQuantity: 30,
            sku: 'VAR-$idx-500',
          ),
          ProductVariant(
            id: 'v_${subcategory.toLowerCase().replaceAll(' ', '_')}_${idx}_1000',
            weightInGrams: 1000,
            unit: 'KG',
            title: '1 KG',
            price: price1000,
            originalPrice: (price1000 * 1.25).roundToDouble(),
            stockQuantity: 20,
            sku: 'VAR-$idx-1000',
          ),
        ],
      );
    });
  }

  // Banners API
  Future<List<PromoBanner>> getBanners() async {
    await init();
    return _banners;
  }

  // Coupons API
  Future<List<Coupon>> getCoupons() async {
    await init();
    return _coupons;
  }

  Future<Coupon?> validateCoupon(String code, double subtotal) async {
    await init();
    try {
      final c = _coupons.firstWhere((item) => item.code.toUpperCase() == code.trim().toUpperCase() && item.isActive);
      if (subtotal >= c.minOrderValue) {
        return c;
      }
    } catch (_) {}
    return null;
  }

  // Orders API
  Future<List<CustomerOrder>> getOrders() async {
    await init();
    if (_serverAvailable) {
      try {
        final res = await http.get(Uri.parse('$_baseUrl/orders')).timeout(const Duration(seconds: 8));
        if (res.statusCode == 200) {
          final dynamic decoded = jsonDecode(res.body);
          final List list = decoded is List ? decoded : (decoded['data'] ?? []);
          if (list.isNotEmpty) {
            _orders = list.map((e) => CustomerOrder.fromJson(e as Map<String, dynamic>)).toList();
          }
        }
      } catch (_) {}
    }
    return _orders;
  }

  void clearUserData() {
    _orders = [];
    _userProfile = const UserProfile(
      id: 'cust_guest',
      name: 'Valued Customer',
      email: '',
      phone: '',
      avatarUrl: '',
      addresses: [],
    );
  }

  Future<CustomerOrder> placeOrder({
    required OrderCustomer customer,
    required List<OrderItemRecord> items,
    required double subtotal,
    required double discount,
    required String couponCode,
    required double deliveryFee,
    required double totalAmount,
    required String paymentMethod,
  }) async {
    await init();
    final newOrder = CustomerOrder(
      id: 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      createdAt: DateTime.now(),
      status: 'Confirmed',
      customer: customer,
      items: items,
      subtotal: subtotal,
      discount: discount,
      couponCode: couponCode,
      deliveryFee: deliveryFee,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      paymentStatus: 'Paid',
    );

    // Update in-memory stock
    for (final item in items) {
      final prodIdx = _products.indexWhere((p) => p.id == item.productId);
      if (prodIdx != -1) {
        final prod = _products[prodIdx];
        final vIdx = prod.variants.indexWhere((v) => v.id == item.variantId);
        if (vIdx != -1) {
          final cur = prod.variants[vIdx];
          final updatedStock = (cur.stockQuantity - item.quantity).clamp(0, 9999);
          final updatedVariants = List<ProductVariant>.from(prod.variants);
          updatedVariants[vIdx] = ProductVariant(
            id: cur.id,
            weightInGrams: cur.weightInGrams,
            unit: cur.unit,
            title: cur.title,
            price: cur.price,
            originalPrice: cur.originalPrice,
            stockQuantity: updatedStock,
            sku: cur.sku,
            minOrderQuantity: cur.minOrderQuantity,
            maxOrderQuantity: cur.maxOrderQuantity,
            isAvailable: updatedStock > 0,
          );
          // re-assign product
          _products[prodIdx] = Product(
            id: prod.id,
            name: prod.name,
            brand: prod.brand,
            categoryId: prod.categoryId,
            categoryName: prod.categoryName,
            subcategoryId: prod.subcategoryId,
            subcategoryName: prod.subcategoryName,
            shortDescription: prod.shortDescription,
            description: prod.description,
            rating: prod.rating,
            reviewCount: prod.reviewCount,
            image: prod.image,
            galleryImages: prod.galleryImages,
            origin: prod.origin,
            ingredients: prod.ingredients,
            nutritionFacts: prod.nutritionFacts,
            storageInstructions: prod.storageInstructions,
            specifications: prod.specifications,
            allowCustomWeight: prod.allowCustomWeight,
            isFeatured: prod.isFeatured,
            isBestSeller: prod.isBestSeller,
            isTrending: prod.isTrending,
            isSpecialOffer: prod.isSpecialOffer,
            isNewArrival: prod.isNewArrival,
            variants: updatedVariants,
          );
        }
      }
    }

    _orders.insert(0, newOrder);

    // Save to SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('local_orders', jsonEncode(_orders.map((o) => o.toJson()).toList()));

    // Always attempt posting to backend API so Admin Panel receives it live
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/orders'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(newOrder.toJson()),
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200 || res.statusCode == 201) {
        _serverAvailable = true;
      }
    } catch (_) {}

    return newOrder;
  }

  // Profile API
  UserProfile getProfile() => _userProfile;

  Future<void> updateProfile(UserProfile updated) async {
    _userProfile = updated;
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('local_profile', jsonEncode(updated.toJson()));
  }
}

