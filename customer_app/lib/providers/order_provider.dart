import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order_model.dart';
import '../services/mock_data_service.dart';

class OrderNotifier extends StateNotifier<AsyncValue<List<CustomerOrder>>> {
  final MockDataService _service;

  OrderNotifier(this._service) : super(const AsyncValue.loading()) {
    loadOrders();
  }

  Future<void> loadOrders() async {
    state = const AsyncValue.loading();
    try {
      final orders = await _service.getOrders();
      state = AsyncValue.data(orders);
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
  return OrderNotifier(service);
});

