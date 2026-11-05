import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item_model.dart';
import '../models/coupon_model.dart';
import '../models/product_model.dart';
import '../models/variant_model.dart';
import '../services/mock_data_service.dart';

class CartState {
  final List<CartItem> items;
  final Coupon? appliedCoupon;
  final double deliveryThreshold;
  final double standardDeliveryFee;

  const CartState({
    this.items = const [],
    this.appliedCoupon,
    this.deliveryThreshold = 500.0,
    this.standardDeliveryFee = 40.0,
  });

  int get totalItemCount => items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => items.fold(0.0, (sum, item) => sum + item.itemTotal);

  double get originalSubtotal => items.fold(0.0, (sum, item) => sum + item.originalTotal);

  double get productSavings => originalSubtotal - subtotal;

  double get couponDiscount {
    if (appliedCoupon == null) return 0.0;
    return appliedCoupon!.calculateDiscount(subtotal);
  }

  double get totalSavings => productSavings + couponDiscount;

  double get deliveryFee {
    if (subtotal == 0.0) return 0.0;
    return subtotal >= deliveryThreshold ? 0.0 : standardDeliveryFee;
  }

  double get grandTotal {
    if (subtotal == 0.0) return 0.0;
    final total = subtotal - couponDiscount + deliveryFee;
    return total < 0 ? 0.0 : total;
  }

  CartState copyWith({
    List<CartItem>? items,
    Coupon? appliedCoupon,
    bool clearCoupon = false,
  }) {
    return CartState(
      items: items ?? this.items,
      appliedCoupon: clearCoupon ? null : (appliedCoupon ?? this.appliedCoupon),
      deliveryThreshold: deliveryThreshold,
      standardDeliveryFee: standardDeliveryFee,
    );
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState()) {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString('saved_cart_items');
    if (jsonStr != null) {
      try {
        final list = jsonDecode(jsonStr) as List<dynamic>;
        final items = list.map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList();
        state = state.copyWith(items: items);
      } catch (_) {}
    }
  }

  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final list = state.items.map((i) => i.toJson()).toList();
    await prefs.setString('saved_cart_items', jsonEncode(list));
  }

  void addToCart({
    required Product product,
    required ProductVariant variant,
    int quantity = 1,
  }) {
    final existingIndex = state.items.indexWhere(
      (item) => item.productId == product.id && item.variant.id == variant.id,
    );

    List<CartItem> newItems;
    if (existingIndex != -1) {
      newItems = List<CartItem>.from(state.items);
      final current = newItems[existingIndex];
      newItems[existingIndex] = current.copyWith(quantity: current.quantity + quantity);
    } else {
      final newItem = CartItem(
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        image: product.image,
        variant: variant,
        quantity: quantity,
      );
      newItems = [...state.items, newItem];
    }

    state = state.copyWith(items: newItems);
    _saveToStorage();
  }

  void addItem(Product product, ProductVariant variant, {int quantity = 1}) {
    addToCart(product: product, variant: variant, quantity: quantity);
  }

  void updateQuantity(String cartItemId, int newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    final newItems = state.items.map((item) {
      if (item.cartItemId == cartItemId) {
        return item.copyWith(quantity: newQuantity);
      }
      return item;
    }).toList();

    state = state.copyWith(items: newItems);
    _saveToStorage();
  }

  void removeFromCart(String cartItemId) {
    final newItems = state.items.where((item) => item.cartItemId != cartItemId).toList();
    state = state.copyWith(items: newItems);
    _saveToStorage();
  }

  void changeVariant(String cartItemId, ProductVariant newVariant) {
    final index = state.items.indexWhere((i) => i.cartItemId == cartItemId);
    if (index == -1) return;

    final current = state.items[index];
    final updated = current.copyWith(variant: newVariant);
    final newItems = List<CartItem>.from(state.items);
    newItems[index] = updated;

    state = state.copyWith(items: newItems);
    _saveToStorage();
  }

  Future<String?> applyCoupon(String code) async {
    final coupon = await MockDataService().validateCoupon(code, state.subtotal);
    if (coupon != null) {
      state = state.copyWith(appliedCoupon: coupon);
      return null; // success
    } else {
      return 'Coupon invalid or minimum cart value of ₹500 required';
    }
  }

  void removeCoupon() {
    state = state.copyWith(clearCoupon: true);
  }

  void clearCart() {
    state = state.copyWith(items: [], clearCoupon: true);
    _saveToStorage();
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

