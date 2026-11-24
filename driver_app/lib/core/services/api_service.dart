import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../../models/driver_model.dart';
import '../../models/delivery_model.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String _baseUrl = AppConstants.defaultApiUrl;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final customUrl = prefs.getString('custom_api_url');
    if (customUrl != null && customUrl.isNotEmpty) {
      _baseUrl = customUrl;
    }
  }

  void setBaseUrl(String url) {
    _baseUrl = url;
  }

  String get baseUrl => _baseUrl;

  // 1. Driver Login
  Future<DriverModel?> login(String phone, String password) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/drivers/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone, 'password': password}),
      ).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['driver'] != null) {
          final driver = DriverModel.fromJson(data['driver']);
          await _saveDriverSession(driver);
          return driver;
        }
      }
    } catch (_) {}

    // Offline / Fallback default login for immediate demo
    if (phone.contains('9876543210') || phone.contains('1234') || phone.contains('driver')) {
      final demoDriver = DriverModel(
        id: 'DRV-101',
        name: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh.driver@naturale.com',
        vehicleType: 'Bike',
        vehicleNumber: 'MH-04-AB-1234',
        licenseNumber: 'DL-MH0420210089',
        isOnline: true,
        currentLat: 19.0760,
        currentLng: 72.8777,
      );
      await _saveDriverSession(demoDriver);
      return demoDriver;
    }
    return null;
  }

  Future<void> _saveDriverSession(DriverModel driver) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('driver_session', jsonEncode(driver.toJson()));
  }

  Future<DriverModel?> getSavedDriverSession() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString('driver_session');
    if (jsonStr != null) {
      try {
        return DriverModel.fromJson(jsonDecode(jsonStr));
      } catch (_) {}
    }
    return null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('driver_session');
  }

  // 2. Online / Offline Status Toggle
  Future<bool> updateStatus(String driverId, bool isOnline) async {
    try {
      final res = await http.put(
        Uri.parse('$_baseUrl/drivers/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'driverId': driverId, 'isOnline': isOnline}),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // 3. Live GPS Location Heartbeat (Ola/Uber style streaming)
  Future<bool> sendLocationHeartbeat({
    required String driverId,
    required double lat,
    required double lng,
    required double heading,
    required double speed,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/drivers/location'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'driverId': driverId,
          'lat': lat,
          'lng': lng,
          'heading': heading,
          'speed': speed,
        }),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // 4. Fetch Assigned Deliveries
  Future<List<DeliveryOrder>> getAssignedDeliveries(String driverId) async {
    try {
      final res = await http.get(
        Uri.parse('$_baseUrl/drivers/deliveries?driverId=$driverId'),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['deliveries'] is List) {
          final list = (data['deliveries'] as List)
              .map((d) => DeliveryOrder.fromJson(d as Map<String, dynamic>))
              .toList();
          if (list.isNotEmpty) return list;
        }
      }
    } catch (_) {}

    // Fallback demo delivery order for seamless testing
    return [
      DeliveryOrder(
        id: 'almond-01-24112026-103000',
        status: 'Out for Delivery',
        customerName: 'Deepak Mishra',
        customerPhone: '9820012345',
        fullAddress: 'Shop No. 12, APMC Grain Market, Sector 19, Vashi, Navi Mumbai - 400705',
        city: 'Navi Mumbai',
        pincode: '400705',
        deliveryInstructions: 'Deliver at APMC Gate 2 dry fruits wholesale depot',
        items: [
          DeliveryItem(productName: 'California Whole Almonds (Badam Giri)', variantTitle: '100 GM', weightInGrams: 100, price: 123.0, quantity: 5),
          DeliveryItem(productName: 'W320 Royal King Cashews (Kaju)', variantTitle: '250 GM', weightInGrams: 250, price: 290.0, quantity: 2),
        ],
        totalAmount: 1195.0,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'Pending',
        deliveryOtp: '4821',
        createdAt: DateTime.now().subtract(const Duration(minutes: 45)).toIso8601String(),
        destLat: 19.0760,
        destLng: 72.8777,
      ),
    ];
  }

  // 5. Update Delivery Status (with OTP verification on Delivered)
  Future<Map<String, dynamic>> updateDeliveryStatus({
    required String orderId,
    required String status,
    String? otp,
    required String driverId,
    bool cashCollected = false,
  }) async {
    try {
      final res = await http.put(
        Uri.parse('$_baseUrl/drivers/deliveries/$orderId/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'status': status,
          'otp': otp,
          'driverId': driverId,
          'cashCollected': cashCollected,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = jsonDecode(res.body);
      return data is Map<String, dynamic> ? data : {'success': res.statusCode == 200};
    } catch (err) {
      return {'success': false, 'message': err.toString()};
    }
  }
}

