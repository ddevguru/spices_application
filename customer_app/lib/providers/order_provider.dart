import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order_model.dart';
import '../models/user_model.dart';
import '../services/mock_data_service.dart';
import 'auth_provider.dart';

class OrderNotifier extends StateNotifier<AsyncValue<List<CustomerOrder>>> {
  final MockDataService _service;
  final UserProfile? _currentUser;

  OrderNotifier(this._service, this._currentUser) : super(const AsyncValue.loading()) {
    loadOrders();
  }

  Future<void> loadOrders() async {
    state = const AsyncValue.loading();
    try {
      if (_currentUser == null || (_currentUser!.email.isEmpty && _currentUser!.phone.isEmpty)) {
        // Guest user has zero order history
        state = const AsyncValue.data([]);
        return;
      }

      final allOrders = await _service.getOrders();
      final cleanEmail = _currentUser!.email.toLowerCase().trim();
      final cleanPhone = _currentUser!.phone.trim();
      final cleanId = _currentUser!.id.trim();

      final scopedOrders = allOrders.where((o) {
        final cust = o.customer;
        final cEmail = cust.email.toLowerCase().trim();
        final cPhone = cust.phone.trim();

        // Strict User Scoping:
        // 1. If user signed in with email, order MUST match this user's email
        if (cleanEmail.isNotEmpty) {
          return cEmail == cleanEmail;
        }

        // 2. Only for mobile-only users without email, match by phone
        if (cleanPhone.isNotEmpty) {
          return cPhone == cleanPhone;
        }

        return false;
      }).toList();

      state = AsyncValue.data(scopedOrders);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }

  Future<CustomerOrder> placeOrder({
    required OrderCustomer customer,
    required List<OrderItemRecord> items,
    required double subtotal,
    required double discount,
    required String couponCode,
    required double deliveryFee,
    required double totalAmount,
    required String paymentMethod,
  }) async {
    final order = await _service.placeOrder(
      customer: customer,
      items: items,
      subtotal: subtotal,
      discount: discount,
      couponCode: couponCode,
      deliveryFee: deliveryFee,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
    );
    await loadOrders();
    return order;
  }
}

final orderProvider = StateNotifierProvider<OrderNotifier, AsyncValue<List<CustomerOrder>>>((ref) {
  final service = MockDataService();
  final authState = ref.watch(authProvider);
  return OrderNotifier(service, authState.user);
});

