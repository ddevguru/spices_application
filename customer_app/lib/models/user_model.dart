import 'order_model.dart';

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final String ownerName;
  final String businessName;
  final String shopName;
  final String gstNumber;
  final String licenseNumber;
  final List<OrderAddress> addresses;
  final String defaultAddressIndex;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatarUrl = '',
    this.ownerName = '',
    this.businessName = '',
    this.shopName = '',
    this.gstNumber = '',
    this.licenseNumber = '',
    this.addresses = const [],
    this.defaultAddressIndex = '0',
  });

  String get effectiveLicenseNumber {
    if (licenseNumber.isNotEmpty) return licenseNumber;
    final hashPart = (id.hashCode.abs() % 900000 + 100000).toString();
    return 'NAT-LIC-2026-$hashPart';
  }

  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    String? ownerName,
    String? businessName,
    String? shopName,
    String? gstNumber,
    String? licenseNumber,
    List<OrderAddress>? addresses,
    String? defaultAddressIndex,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      ownerName: ownerName ?? this.ownerName,
      businessName: businessName ?? this.businessName,
      shopName: shopName ?? this.shopName,
      gstNumber: gstNumber ?? this.gstNumber,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      addresses: addresses ?? this.addresses,
      defaultAddressIndex: defaultAddressIndex ?? this.defaultAddressIndex,
    );
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final id = json['id'] as String? ?? 'cust_${DateTime.now().millisecondsSinceEpoch}';
    final savedLic = json['licenseNumber'] as String? ?? '';
    final defaultLic = savedLic.isNotEmpty ? savedLic : 'NAT-LIC-2026-${(id.hashCode.abs() % 900000 + 100000)}';

    return UserProfile(
      id: id,
      name: json['name'] as String? ?? 'Naturale Member',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String? ?? '',
      ownerName: json['ownerName'] as String? ?? json['name'] as String? ?? '',
      businessName: json['businessName'] as String? ?? '',
      shopName: json['shopName'] as String? ?? '',
      gstNumber: json['gstNumber'] as String? ?? '',
      licenseNumber: defaultLic,
      addresses: (json['addresses'] as List<dynamic>?)
              ?.map((e) => OrderAddress.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      defaultAddressIndex: json['defaultAddressIndex'] as String? ?? '0',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'ownerName': ownerName,
      'businessName': businessName,
      'shopName': shopName,
      'gstNumber': gstNumber,
      'licenseNumber': effectiveLicenseNumber,
      'addresses': addresses.map((a) => a.toJson()).toList(),
      'defaultAddressIndex': defaultAddressIndex,
    };
  }
}
