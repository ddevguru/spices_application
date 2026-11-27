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

  Future<void> setBaseUrl(String url) async {
    _baseUrl = url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('custom_api_url', url);
  }

  String get baseUrl => _baseUrl;

  // 1. Driver Login (Real Backend Authentication)
  Future<Map<String, dynamic>> login(String phone, String password) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/drivers/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'phone': phone, 'password': password}),
      ).timeout(const Duration(seconds: 20));

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true && data['driver'] != null) {
        final driver = DriverModel.fromJson(data['driver'] as Map<String, dynamic>);
        await _saveDriverSession(driver);
        return {
          'success': true,
          'driver': driver,
          'message': data['message'] ?? 'Login successful',
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Invalid mobile number or password',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to reach server. Please check internet or try again in a moment.',
      };
    }
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
        return DriverModel.fromJson(jsonDecode(jsonStr) as Map<String, dynamic>);
      } catch (_) {}
    }
    return null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('driver_session');
  }

  // 1b. Refresh Driver Profile from Backend
  Future<Map<String, dynamic>> getProfile(String driverId) async {
    try {
      final res = await http.get(
        Uri.parse('$_baseUrl/drivers/profile/$driverId'),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true && data['driver'] != null) {
        final driver = DriverModel.fromJson(data['driver'] as Map<String, dynamic>);
        await _saveDriverSession(driver);
        return {
          'success': true,
          'driver': driver,
          'isActive': data['driver']['isActive'] ?? true,
        };
      }
      return {
        'success': false,
        'notFound': res.statusCode == 404,
        'message': data['message'] ?? 'Failed to fetch profile',
      };
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  // 2. Online / Offline Status Toggle
  Future<bool> updateStatus(String driverId, bool isOnline) async {
    try {
      final res = await http.put(
        Uri.parse('$_baseUrl/drivers/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'driverId': driverId, 'isOnline': isOnline}),
      ).timeout(const Duration(seconds: 8));
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
      ).timeout(const Duration(seconds: 6));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // 4. Fetch Assigned Deliveries (Real Backend Only)
  Future<Map<String, dynamic>> getAssignedDeliveriesResult(String driverId) async {
    try {
      final res = await http.get(
        Uri.parse('$_baseUrl/drivers/deliveries?driverId=$driverId'),
        headers: {'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 15));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['deliveries'] is List) {
          final list = (data['deliveries'] as List)
              .map((d) => DeliveryOrder.fromJson(d as Map<String, dynamic>))
              .toList();
          return {'success': true, 'deliveries': list};
        }
      }
      return {
        'success': false,
        'deliveries': <DeliveryOrder>[],
        'message': 'Server returned status ${res.statusCode}',
      };
    } catch (e) {
      return {
        'success': false,
        'deliveries': <DeliveryOrder>[],
        'message': 'Could not connect to backend. Pull down to retry.',
      };
    }
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
      ).timeout(const Duration(seconds: 12));

      final data = jsonDecode(res.body);
      return data is Map<String, dynamic> ? data : {'success': res.statusCode == 200};
    } catch (err) {
      return {'success': false, 'message': 'Network error: ${err.toString()}'};
    }
  }
}
