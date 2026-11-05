import 'variant_model.dart';

class CartItem {
  final String productId;
  final String productName;
  final String brand;
  final String image;
  final ProductVariant variant;
  final int quantity;

  const CartItem({
    required this.productId,
    required this.productName,
    required this.brand,
    required this.image,
    required this.variant,
    this.quantity = 1,
  });

  String get cartItemId => '${productId}_${variant.id}';

  double get itemTotal => variant.price * quantity;
  double get originalTotal => variant.originalPrice * quantity;
  double get savings => originalTotal - itemTotal;

  CartItem copyWith({
    String? productId,
    String? productName,
    String? brand,
    String? image,
    ProductVariant? variant,
    int? quantity,
  }) {
    return CartItem(
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      brand: brand ?? this.brand,
      image: image ?? this.image,
      variant: variant ?? this.variant,
      quantity: quantity ?? this.quantity,
    );
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      brand: json['brand'] as String? ?? 'Naturale',
      image: json['image'] as String? ?? '',
      variant: ProductVariant.fromJson(json['variant'] as Map<String, dynamic>),
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'brand': brand,
      'image': image,
      'variant': variant.toJson(),
      'quantity': quantity,
    };
  }
}

