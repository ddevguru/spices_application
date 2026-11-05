class ProductVariant {
  final String id;
  final int weightInGrams;
  final String unit; // 'GM' or 'KG'
  final String title; // '100 GM', '250 GM', '500 GM', '1 KG'
  final double price;
  final double originalPrice;
  final int stockQuantity;
  final String sku;
  final int minOrderQuantity;
  final int maxOrderQuantity;
  final bool isAvailable;

  const ProductVariant({
    required this.id,
    required this.weightInGrams,
    required this.unit,
    required this.title,
    required this.price,
    required this.originalPrice,
    required this.stockQuantity,
    required this.sku,
    this.minOrderQuantity = 1,
    this.maxOrderQuantity = 20,
    this.isAvailable = true,
  });

  int get discountPercentage {
    if (originalPrice <= price) return 0;
    return (((originalPrice - price) / originalPrice) * 100).round();
  }

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'] as String,
      weightInGrams: (json['weightInGrams'] as num).toInt(),
      unit: json['unit'] as String? ?? 'GM',
      title: json['title'] as String? ?? '${json['weightInGrams']} GM',
      price: (json['price'] as num).toDouble(),
      originalPrice: (json['originalPrice'] as num?)?.toDouble() ?? (json['price'] as num).toDouble(),
      stockQuantity: (json['stockQuantity'] as num?)?.toInt() ?? 10,
      sku: json['sku'] as String? ?? '',
      minOrderQuantity: (json['minOrderQuantity'] as num?)?.toInt() ?? 1,
      maxOrderQuantity: (json['maxOrderQuantity'] as num?)?.toInt() ?? 20,
      isAvailable: json['isAvailable'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'weightInGrams': weightInGrams,
      'unit': unit,
      'title': title,
      'price': price,
      'originalPrice': originalPrice,
      'stockQuantity': stockQuantity,
      'sku': sku,
      'minOrderQuantity': minOrderQuantity,
      'maxOrderQuantity': maxOrderQuantity,
      'isAvailable': isAvailable,
    };
  }

  // Helper factory for dynamic/custom weight in grams
  factory ProductVariant.custom({
    required int grams,
    required double basePricePer100g,
    required double baseOriginalPricePer100g,
    int stock = 100,
  }) {
    final double calculatedPrice = (basePricePer100g / 100.0) * grams;
    final double calculatedOriginal = (baseOriginalPricePer100g / 100.0) * grams;
    final String title = grams >= 1000 
        ? '${(grams / 1000).toStringAsFixed(grams % 1000 == 0 ? 0 : 2)} KG'
        : '$grams GM';
    final String unit = grams >= 1000 ? 'KG' : 'GM';

    return ProductVariant(
      id: 'custom_${grams}g',
      weightInGrams: grams,
      unit: unit,
      title: title,
      price: calculatedPrice.roundToDouble(),
      originalPrice: calculatedOriginal.roundToDouble(),
      stockQuantity: stock,
      sku: 'CUSTOM-${grams}G',
      minOrderQuantity: 1,
      maxOrderQuantity: 10,
      isAvailable: stock > 0,
    );
  }
}

