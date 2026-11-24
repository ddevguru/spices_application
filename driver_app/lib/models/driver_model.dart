class DriverModel {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String vehicleType;
  final String vehicleNumber;
  final String licenseNumber;
  bool isOnline;
  double currentLat;
  double currentLng;
  double heading;
  double speed;

  DriverModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email = '',
    required this.vehicleType,
    required this.vehicleNumber,
    this.licenseNumber = '',
    this.isOnline = false,
    this.currentLat = 19.0760,
    this.currentLng = 72.8777,
    this.heading = 0.0,
    this.speed = 0.0,
  });

  factory DriverModel.fromJson(Map<String, dynamic> json) {
    return DriverModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Delivery Partner',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      vehicleType: json['vehicleType'] as String? ?? json['vehicle_type'] as String? ?? 'Bike',
      vehicleNumber: json['vehicleNumber'] as String? ?? json['vehicle_number'] as String? ?? 'MH-04-AB-1234',
      licenseNumber: json['licenseNumber'] as String? ?? json['license_number'] as String? ?? '',
      isOnline: json['isOnline'] as bool? ?? json['is_online'] as bool? ?? false,
      currentLat: (json['currentLat'] ?? json['current_lat'] ?? 19.0760).toDouble(),
      currentLng: (json['currentLng'] ?? json['current_lng'] ?? 72.8777).toDouble(),
      heading: (json['heading'] ?? 0.0).toDouble(),
      speed: (json['speed'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'vehicleType': vehicleType,
      'vehicleNumber': vehicleNumber,
      'licenseNumber': licenseNumber,
      'isOnline': isOnline,
      'currentLat': currentLat,
      'currentLng': currentLng,
      'heading': heading,
      'speed': speed,
    };
  }
}
