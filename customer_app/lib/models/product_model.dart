import 'variant_model.dart';

class Product {
  final String id;
  final String name;
  final String brand;
  final String categoryId;
  final String categoryName;
  final String subcategoryId;
  final String subcategoryName;
  final String shortDescription;
  final String description;
  final double rating;
  final int reviewCount;
  final String image;
  final List<String> galleryImages;
  final String origin;
  final String ingredients;
  final Map<String, String> nutritionFacts;
  final String storageInstructions;
  final Map<String, String> specifications;
  final String sku;
  final String barcode;
  final bool allowCustomWeight;
  final bool isFeatured;
  final bool isBestSeller;
  final bool isTrending;
  final bool isSpecialOffer;
  final bool isNewArrival;
  final List<ProductVariant> variants;

  const Product({
    required this.id,
    required this.name,
    required this.brand,
    required this.categoryId,
    required this.categoryName,
    required this.subcategoryId,
    required this.subcategoryName,
    required this.shortDescription,
    required this.description,
    required this.rating,
    required this.reviewCount,
    required this.image,
    required this.galleryImages,
    required this.origin,
    required this.ingredients,
    required this.nutritionFacts,
    required this.storageInstructions,
    required this.specifications,
    this.sku = '',
    this.barcode = '',
    this.allowCustomWeight = true,
    this.isFeatured = false,
    this.isBestSeller = false,
    this.isTrending = false,
    this.isSpecialOffer = false,
    this.isNewArrival = false,
    required this.variants,
  });

  String get effectiveSku {
    if (sku.isNotEmpty) return sku;
    final catCode = categoryId.contains('dry') ? 'DF' : (categoryId.contains('whole') ? 'WS' : (categoryId.contains('blend') ? 'BS' : 'CR'));
    final subCode = subcategoryId.isNotEmpty ? subcategoryId.substring(0, subcategoryId.length.clamp(0, 3)).toUpperCase() : 'PRD';
    final idPart = id.replaceAll('p_', '').replaceAll('gen_', '').substring(0, id.replaceAll('p_', '').replaceAll('gen_', '').length.clamp(0, 4)).toUpperCase();
    return '$catCode-$subCode-$idPart';
  }

  String get effectiveBarcode {
    if (barcode.isNotEmpty) return barcode;
    final hashVal = (id.hashCode.abs() % 900000000 + 100000000).toString();
    return '890$hashVal';
  }

  ProductVariant get defaultVariant {
    if (variants.isEmpty) {
      return ProductVariant(
        id: 'default',
        weightInGrams: 250,
        unit: 'GM',
        title: '250 GM',
        price: 250,
        originalPrice: 300,
        stockQuantity: 10,
        sku: effectiveSku,
        barcode: effectiveBarcode,
      );
    }
    // Prefer 250 GM or first available
    return variants.firstWhere(
      (v) => v.weightInGrams == 250 && v.isAvailable,
      orElse: () => variants.first,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    final id = json['id'] as String? ?? 'p_${DateTime.now().millisecondsSinceEpoch}';
    final savedSku = json['sku'] as String? ?? '';
    final savedBarcode = json['barcode'] as String? ?? '';

    return Product(
      id: id,
      name: json['name'] as String? ?? '',
      brand: json['brand'] as String? ?? 'Naturale Pure',
      categoryId: json['categoryId'] as String? ?? 'cat_dry_fruits',
      categoryName: json['categoryName'] as String? ?? 'Dry Fruits',
      subcategoryId: json['subcategoryId'] as String? ?? '',
      subcategoryName: json['subcategoryName'] as String? ?? '',
      shortDescription: json['shortDescription'] as String? ?? '',
      description: json['description'] as String? ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 100,
      image: json['image'] as String? ?? '',
      galleryImages: (json['galleryImages'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      origin: json['origin'] as String? ?? 'India',
      ingredients: json['ingredients'] as String? ?? '',
      nutritionFacts: (json['nutritionFacts'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, v.toString()),
          ) ??
          {},
      storageInstructions: json['storageInstructions'] as String? ?? '',
      specifications: (json['specifications'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, v.toString()),
          ) ??
          {},
      sku: savedSku,
      barcode: savedBarcode,
      allowCustomWeight: json['allowCustomWeight'] as bool? ?? true,
      isFeatured: json['isFeatured'] as bool? ?? false,
      isBestSeller: json['isBestSeller'] as bool? ?? false,
      isTrending: json['isTrending'] as bool? ?? false,
      isSpecialOffer: json['isSpecialOffer'] as bool? ?? false,
      isNewArrival: json['isNewArrival'] as bool? ?? false,
      variants: (json['variants'] as List<dynamic>?)
              ?.map((v) => ProductVariant.fromJson(v as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'subcategoryId': subcategoryId,
      'subcategoryName': subcategoryName,
      'shortDescription': shortDescription,
      'description': description,
      'rating': rating,
      'reviewCount': reviewCount,
      'image': image,
      'galleryImages': galleryImages,
      'origin': origin,
      'ingredients': ingredients,
      'nutritionFacts': nutritionFacts,
      'storageInstructions': storageInstructions,
      'specifications': specifications,
      'sku': effectiveSku,
      'barcode': effectiveBarcode,
      'allowCustomWeight': allowCustomWeight,
      'isFeatured': isFeatured,
      'isBestSeller': isBestSeller,
      'isTrending': isTrending,
      'isSpecialOffer': isSpecialOffer,
      'isNewArrival': isNewArrival,
      'variants': variants.map((v) => v.toJson()).toList(),
    };
  }
}
