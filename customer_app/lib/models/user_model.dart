import 'order_model.dart';

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final List<OrderAddress> addresses;
  final String defaultAddressIndex;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatarUrl = '',
    this.addresses = const [],
    this.defaultAddressIndex = '0',
  });

  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    List<OrderAddress>? addresses,
    String? defaultAddressIndex,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      addresses: addresses ?? this.addresses,
      defaultAddressIndex: defaultAddressIndex ?? this.defaultAddressIndex,
    );
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String? ?? 'cust_${DateTime.now().millisecondsSinceEpoch}',
      name: json['name'] as String? ?? 'Naturale Member',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String? ?? '',
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
      'addresses': addresses.map((a) => a.toJson()).toList(),
      'defaultAddressIndex': defaultAddressIndex,
    };
  }
}

