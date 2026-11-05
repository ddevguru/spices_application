class OrderAddress {
  final String label;
  final String street;
  final String area;
  final String city;
  final String state;
  final String pincode;

  const OrderAddress({
    required this.label,
    required this.street,
    required this.area,
    required this.city,
    required this.state,
    required this.pincode,
  });

  String get fullAddress => '$street, $area, $city, $state - $pincode';

  factory OrderAddress.fromJson(Map<String, dynamic> json) {
    return OrderAddress(
      label: json['label'] as String? ?? 'Home',
      street: json['street'] as String? ?? '',
      area: json['area'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      pincode: json['pincode'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'street': street,
      'area': area,
      'city': city,
      'state': state,
      'pincode': pincode,
    };
  }
}

class OrderCustomer {
  final String name;
  final String phone;
  final String email;
  final OrderAddress address;

  const OrderCustomer({
    required this.name,
    required this.phone,
    required this.email,
    required this.address,
  });

  factory OrderCustomer.fromJson(Map<String, dynamic> json) {
    return OrderCustomer(
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      address: OrderAddress.fromJson(json['address'] as Map<String, dynamic>? ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'email': email,
      'address': address.toJson(),
    };
  }
}

class OrderItemRecord {
  final String productId;
  final String productName;
  final String variantId;
  final String variantTitle;
  final int weightInGrams;
  final double price;
  final int quantity;
  final String image;

  const OrderItemRecord({
    required this.productId,
    required this.productName,
    required this.variantId,
    required this.variantTitle,
    required this.weightInGrams,
    required this.price,
    required this.quantity,
    required this.image,
  });

  double get total => price * quantity;

  factory OrderItemRecord.fromJson(Map<String, dynamic> json) {
    return OrderItemRecord(
      productId: json['productId'] as String? ?? '',
      productName: json['productName'] as String? ?? '',
      variantId: json['variantId'] as String? ?? '',
      variantTitle: json['variantTitle'] as String? ?? '',
      weightInGrams: (json['weightInGrams'] as num?)?.toInt() ?? 100,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      image: json['image'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'variantId': variantId,
      'variantTitle': variantTitle,
      'weightInGrams': weightInGrams,
      'price': price,
      'quantity': quantity,
      'image': image,
    };
  }
}

class CustomerOrder {
  final String id;
  final DateTime createdAt;
  final String status; // Pending, Confirmed, Processing, Packed, Shipped, Out for Delivery, Delivered, Cancelled
  final OrderCustomer customer;
  final List<OrderItemRecord> items;
  final double subtotal;
  final double discount;
  final String couponCode;
  final double deliveryFee;
  final double tax;
  final double totalAmount;
  final String paymentMethod;
  final String paymentStatus;

  const CustomerOrder({
    required this.id,
    required this.createdAt,
    required this.status,
    required this.customer,
    required this.items,
    required this.subtotal,
    this.discount = 0.0,
    this.couponCode = '',
    this.deliveryFee = 0.0,
    this.tax = 0.0,
    required this.totalAmount,
    required this.paymentMethod,
    this.paymentStatus = 'Paid',
  });

  factory CustomerOrder.fromJson(Map<String, dynamic> json) {
    return CustomerOrder(
      id: json['id'] as String,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
      status: json['status'] as String? ?? 'Pending',
      customer: OrderCustomer.fromJson(json['customer'] as Map<String, dynamic>? ?? {}),
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItemRecord.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      couponCode: json['couponCode'] as String? ?? '',
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['paymentMethod'] as String? ?? 'UPI',
      paymentStatus: json['paymentStatus'] as String? ?? 'Paid',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'createdAt': createdAt.toIso8601String(),
      'status': status,
      'customer': customer.toJson(),
      'items': items.map((e) => e.toJson()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'couponCode': couponCode,
      'deliveryFee': deliveryFee,
      'tax': tax,
      'totalAmount': totalAmount,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
    };
  }
}

