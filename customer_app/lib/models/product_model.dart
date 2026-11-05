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
    this.allowCustomWeight = true,
    this.isFeatured = false,
    this.isBestSeller = false,
    this.isTrending = false,
    this.isSpecialOffer = false,
    this.isNewArrival = false,
    required this.variants,
  });

  ProductVariant get defaultVariant {
    if (variants.isEmpty) {
      return const ProductVariant(
        id: 'default',
        weightInGrams: 250,
        unit: 'GM',
        title: '250 GM',
        price: 250,
        originalPrice: 300,
        stockQuantity: 10,
        sku: 'DEFAULT',
      );
    }
    // Prefer 250 GM or first available
    return variants.firstWhere(
      (v) => v.weightInGrams == 250 && v.isAvailable,
      orElse: () => variants.first,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      brand: json['brand'] as String? ?? 'Naturale Pure',
      categoryId: json['categoryId'] as String,
      categoryName: json['categoryName'] as String,
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

