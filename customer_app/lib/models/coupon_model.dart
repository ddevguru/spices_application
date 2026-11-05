class Coupon {
  final String id;
  final String code;
  final String description;
  final String discountType; // 'percentage' or 'fixed'
  final double discountValue;
  final double minOrderValue;
  final double maxDiscount;
  final String expiryDate;
  final bool isActive;

  const Coupon({
    required this.id,
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    required this.minOrderValue,
    required this.maxDiscount,
    required this.expiryDate,
    this.isActive = true,
  });

  double calculateDiscount(double subtotal) {
    if (subtotal < minOrderValue) return 0.0;
    if (discountType == 'percentage') {
      final discount = (subtotal * discountValue) / 100.0;
      return discount > maxDiscount ? maxDiscount : discount;
    } else {
      return discountValue > subtotal ? subtotal : discountValue;
    }
  }

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id'] as String,
      code: json['code'] as String,
      description: json['description'] as String? ?? '',
      discountType: json['discountType'] as String? ?? 'percentage',
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? 0.0,
      minOrderValue: (json['minOrderValue'] as num?)?.toDouble() ?? 0.0,
      maxDiscount: (json['maxDiscount'] as num?)?.toDouble() ?? 9999.0,
      expiryDate: json['expiryDate'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'description': description,
      'discountType': discountType,
      'discountValue': discountValue,
      'minOrderValue': minOrderValue,
      'maxDiscount': maxDiscount,
      'expiryDate': expiryDate,
      'isActive': isActive,
    };
  }
}

