class DeliveryItem {
  final String productName;
  final String variantTitle;
  final int weightInGrams;
  final double price;
  final int quantity;

  DeliveryItem({
    required this.productName,
    required this.variantTitle,
    required this.weightInGrams,
    required this.price,
    required this.quantity,
  });

  factory DeliveryItem.fromJson(Map<String, dynamic> json) {
    return DeliveryItem(
      productName: json['productName'] as String? ?? json['name'] as String? ?? 'Dry Fruit Pack',
      variantTitle: json['variantTitle'] as String? ?? 'Standard',
      weightInGrams: json['weightInGrams'] as int? ?? 250,
      price: (json['price'] ?? 0.0).toDouble(),
      quantity: json['quantity'] as int? ?? 1,
    );
  }
}

class DeliveryOrder {
  final String id;
  String status;
  final String customerName;
  final String customerPhone;
  final String customerEmail;
  final String fullAddress;
  final String city;
  final String pincode;
  final String deliveryInstructions;
  final List<DeliveryItem> items;
  final double totalAmount;
  final String paymentMethod;
  String paymentStatus;
  final String? deliveryOtp;
  final String createdAt;
  final double destLat;
  final double destLng;

  DeliveryOrder({
    required this.id,
    required this.status,
    required this.customerName,
    required this.customerPhone,
    this.customerEmail = '',
    required this.fullAddress,
    this.city = 'Navi Mumbai',
    this.pincode = '400705',
    this.deliveryInstructions = '',
    required this.items,
    required this.totalAmount,
    this.paymentMethod = 'COD',
    this.paymentStatus = 'Pending',
    this.deliveryOtp,
    required this.createdAt,
    this.destLat = 19.0330,
    this.destLng = 73.0297,
  });

  factory DeliveryOrder.fromJson(Map<String, dynamic> json) {
    String addrStr = 'APMC Market, Sector 19, Vashi, Navi Mumbai - 400705';
    String cityName = 'Navi Mumbai';
    String pinStr = '400705';

    final addr = json['address'] ?? json['shipping_address'] ?? (json['customer'] != null ? json['customer']['address'] : null);
    if (addr is Map) {
      cityName = addr['city'] as String? ?? 'Navi Mumbai';
      pinStr = addr['pincode'] as String? ?? '400705';
      final street = addr['street'] as String? ?? '';
      final area = addr['area'] as String? ?? '';
      addrStr = '$street, $area, $cityName - $pinStr'.replaceAll(RegExp(r'^,\s*'), '');
      if (addrStr.trim().isEmpty) addrStr = '$cityName - $pinStr';
    } else if (addr is String && addr.isNotEmpty) {
      addrStr = addr;
    }

    List<DeliveryItem> itemsList = [];
    if (json['items'] is List) {
      itemsList = (json['items'] as List)
          .map((i) => DeliveryItem.fromJson(i as Map<String, dynamic>))
          .toList();
    }

    final custName = json['customerName'] as String? ?? (json['customer'] is Map ? json['customer']['name'] : null) ?? 'Valued Customer';
    final custPhone = json['customerPhone'] as String? ?? (json['customer'] is Map ? json['customer']['phone'] : null) ?? '9820012345';

    return DeliveryOrder(
      id: json['id'] as String? ?? 'ORD-000',
      status: json['status'] as String? ?? 'Out for Delivery',
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: json['customerEmail'] as String? ?? '',
      fullAddress: addrStr,
      city: cityName,
      pincode: pinStr,
      deliveryInstructions: json['deliveryInstructions'] as String? ?? json['delivery_instructions'] as String? ?? '',
      items: itemsList,
      totalAmount: (json['totalAmount'] ?? json['total_amount'] ?? 0.0).toDouble(),
      paymentMethod: json['paymentMethod'] as String? ?? json['payment_method'] as String? ?? 'COD',
      paymentStatus: json['paymentStatus'] as String? ?? json['payment_status'] as String? ?? 'Pending',
      deliveryOtp: json['deliveryOtp'] as String? ?? json['delivery_otp'] as String?,
      createdAt: json['createdAt'] as String? ?? json['created_at'] as String? ?? DateTime.now().toIso8601String(),
      destLat: 19.0330,
      destLng: 73.0297,
    );
  }
}

