import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product_model.dart';

class WishlistNotifier extends StateNotifier<List<Product>> {
  WishlistNotifier() : super([]) {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString('saved_wishlist_items');
    if (jsonStr != null) {
      try {
        final list = jsonDecode(jsonStr) as List<dynamic>;
        final items = list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
        state = items;
      } catch (_) {}
    }
  }

  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final list = state.map((i) => i.toJson()).toList();
    await prefs.setString('saved_wishlist_items', jsonEncode(list));
  }

  bool isInWishlist(String productId) {
    return state.any((p) => p.id == productId);
  }

  void toggleWishlist(Product product) {
    if (isInWishlist(product.id)) {
      state = state.where((p) => p.id != product.id).toList();
    } else {
      state = [...state, product];
    }
    _saveToStorage();
  }

  void removeFromWishlist(String productId) {
    state = state.where((p) => p.id != productId).toList();
    _saveToStorage();
  }
}

final wishlistProvider = StateNotifierProvider<WishlistNotifier, List<Product>>((ref) {
  return WishlistNotifier();
});

