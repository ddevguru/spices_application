import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isOnboarded;
  final UserProfile? user;
  final String? token;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.isOnboarded = false,
    this.user,
    this.token,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isOnboarded,
    UserProfile? user,
    String? token,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isOnboarded: isOnboarded ?? this.isOnboarded,
      user: user ?? this.user,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  static const String _apiBase = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://dryfruits-api.onrender.com/api',
  );

  AuthNotifier() : super(const AuthState()) {
    _loadInitialState();
  }

  Future<void> _loadInitialState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final onboarded = prefs.getBool('is_onboarded') ?? false;
      final token = prefs.getString('auth_token');
      final userJsonStr = prefs.getString('user_profile');

      UserProfile? user;
      if (userJsonStr != null && userJsonStr.isNotEmpty) {
        try {
          user = UserProfile.fromJson(jsonDecode(userJsonStr) as Map<String, dynamic>);
        } catch (_) {}
      }

      final loggedIn = token != null && token.isNotEmpty && user != null;

      state = state.copyWith(
        isOnboarded: onboarded,
        isAuthenticated: loggedIn,
        token: token,
        user: user,
      );

      // Verify token with backend in background
      if (token != null && token.isNotEmpty) {
        _syncProfile(token);
      }
    } catch (_) {}
  }

  Future<void> _syncProfile(String token) async {
    try {
      final res = await http.get(
        Uri.parse('$_apiBase/auth/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final updatedUser = UserProfile.fromJson(data);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_profile', jsonEncode(updatedUser.toJson()));
        state = state.copyWith(user: updatedUser);
      }
    } catch (_) {}
  }

  Future<void> completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_onboarded', true);
    state = state.copyWith(isOnboarded: true);
  }

  /// Real Customer Login (PostgreSQL Backend)
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    final cleanEmail = email.trim();
    if (cleanEmail.isEmpty || password.trim().isEmpty) {
      state = state.copyWith(isLoading: false, error: 'Please enter your email and password.');
      return false;
    }

    try {
      final res = await http.post(
        Uri.parse('$_apiBase/auth/customer-login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': cleanEmail, 'password': password}),
      ).timeout(const Duration(seconds: 10));

      final data = jsonDecode(res.body);

      if (res.statusCode == 200 && data['token'] != null) {
        final token = data['token'] as String;
        final userMap = (data['user'] as Map<String, dynamic>?) ?? {};
        final user = UserProfile.fromJson(userMap);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        await prefs.setString('user_profile', jsonEncode(user.toJson()));
        await prefs.setBool('is_logged_in', true);

        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          token: token,
          user: user,
          error: null,
        );
        return true;
      } else {
        final errMsg = data['error'] ?? 'Login failed. Please check credentials.';
        state = state.copyWith(isLoading: false, error: errMsg.toString());
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Network connection issue. Please check your internet or try again.',
      );
      return false;
    }
  }

  /// Real Customer Registration (PostgreSQL Backend)
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? phone,
    String? city,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    final cleanName = name.trim();
    final cleanEmail = email.trim();

    if (cleanName.isEmpty) {
      state = state.copyWith(isLoading: false, error: 'Please enter your full name.');
      return false;
    }
    if (!cleanEmail.contains('@')) {
      state = state.copyWith(isLoading: false, error: 'Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      state = state.copyWith(isLoading: false, error: 'Password must be at least 6 characters.');
      return false;
    }

    try {
      final res = await http.post(
        Uri.parse('$_apiBase/auth/customer-register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': cleanName,
          'email': cleanEmail,
          'password': password,
          'phone': phone ?? '',
          'city': city ?? 'India',
        }),
      ).timeout(const Duration(seconds: 12));

      final data = jsonDecode(res.body);

      if ((res.statusCode == 200 || res.statusCode == 201) && data['token'] != null) {
        final token = data['token'] as String;
        final userMap = (data['user'] as Map<String, dynamic>?) ?? {};
        final user = UserProfile.fromJson(userMap);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        await prefs.setString('user_profile', jsonEncode(user.toJson()));
        await prefs.setBool('is_logged_in', true);

        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          token: token,
          user: user,
          error: null,
        );
        return true;
      } else {
        final errMsg = data['error'] ?? 'Registration failed. Please try again.';
        state = state.copyWith(isLoading: false, error: errMsg.toString());
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Unable to connect to registration server. Please try again.',
      );
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_profile');
    await prefs.setBool('is_logged_in', false);
    state = state.copyWith(isAuthenticated: false, token: null, user: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

