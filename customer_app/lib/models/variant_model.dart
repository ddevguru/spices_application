class ProductVariant {
  final String id;
  final int weightInGrams;
  final String unit; // 'GM' or 'KG'
  final String title; // '100 GM', '250 GM', '500 GM', '1 KG'
  final double price;
  final double originalPrice;
  final int stockQuantity;
  final String sku;
  final String barcode;
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
    this.barcode = '',
    this.minOrderQuantity = 1,
    this.maxOrderQuantity = 20,
    this.isAvailable = true,
  });

  String get effectiveBarcode {
    if (barcode.isNotEmpty) return barcode;
    final hashVal = (id.hashCode.abs() % 900000000 + 100000000).toString();
    return '890$hashVal';
  }

  int get discountPercentage {
    if (originalPrice <= price) return 0;
    return (((originalPrice - price) / originalPrice) * 100).round();
  }

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    final idStr = json['id'] as String? ?? 'v_${DateTime.now().millisecondsSinceEpoch}';
    final savedBarcode = json['barcode'] as String? ?? '';
    final defaultBarcode = savedBarcode.isNotEmpty
        ? savedBarcode
        : '890${(idStr.hashCode.abs() % 900000000 + 100000000)}';

    return ProductVariant(
      id: idStr,
      weightInGrams: (json['weightInGrams'] as num?)?.toInt() ?? 250,
      unit: json['unit'] as String? ?? 'GM',
      title: json['title'] as String? ?? '${json['weightInGrams'] ?? 250} GM',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      originalPrice: (json['originalPrice'] as num?)?.toDouble() ?? (json['price'] as num?)?.toDouble() ?? 0.0,
      stockQuantity: (json['stockQuantity'] as num?)?.toInt() ?? 10,
      sku: json['sku'] as String? ?? '',
      barcode: defaultBarcode,
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
      'barcode': effectiveBarcode,
      'minOrderQuantity': minOrderQuantity,
      'maxOrderQuantity': maxOrderQuantity,
      'isAvailable': isAvailable,
    };
  }
}
