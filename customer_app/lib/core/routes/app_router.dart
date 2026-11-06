import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/authentication/forgot_password_screen.dart';
import '../../features/authentication/login_screen.dart';
import '../../features/authentication/mobile_login_screen.dart';
import '../../features/authentication/otp_verification_screen.dart';
import '../../features/authentication/signup_screen.dart';
import '../../features/categories/categories_screen.dart';
import '../../features/categories/subcategories_screen.dart';
import '../../features/cart/cart_screen.dart';
import '../../features/checkout/checkout_screen.dart';
import '../../features/home/main_navigation_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/orders/my_orders_screen.dart';
import '../../features/orders/order_receipt_screen.dart';
import '../../features/orders/order_success_screen.dart';
import '../../features/orders/order_tracking_screen.dart';
import '../../features/orders/quick_reorder_screen.dart';
import '../../features/products/product_detail_screen.dart';
import '../../features/products/product_listing_screen.dart';
import '../../features/products/product_variety_screen.dart';
import '../../features/profile/saved_addresses_screen.dart';
import '../../features/wishlist/wishlist_screen.dart';
import '../../models/category_model.dart';
import '../../models/order_model.dart';
import '../../providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: authState.isOnboarded
        ? (authState.isAuthenticated ? '/main' : '/login')
        : '/onboarding',
    routes: [
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/mobile-login',
        builder: (context, state) => const MobileLoginScreen(),
      ),
      GoRoute(
        path: '/otp-verification',
        builder: (context, state) {
          final mobile = state.extra as String? ?? '9876543210';
          return OtpVerificationScreen(mobileNumber: mobile);
        },
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/main',
        builder: (context, state) => const MainNavigationScreen(),
      ),
      GoRoute(
        path: '/categories',
        builder: (context, state) => const CategoriesScreen(),
      ),
      GoRoute(
        path: '/categories/:categoryId/subcategories',
        builder: (context, state) {
          final catId = state.pathParameters['categoryId'] ?? 'cat_dry_fruits';
          final category = state.extra as Category?;
          return SubcategoriesScreen(categoryId: catId, category: category);
        },
      ),
      GoRoute(
        path: '/subcategories/:subcategoryId/products',
        builder: (context, state) {
          final subcategoryId = state.pathParameters['subcategoryId'] ?? 'Almonds';
          final extraMap = state.extra as Map<String, dynamic>? ?? {};
          final catId = extraMap['categoryId'] as String?;
          final catName = extraMap['categoryName'] as String?;
          return ProductVarietyScreen(
            subcategoryId: subcategoryId,
            categoryId: catId,
            categoryName: catName,
          );
        },
      ),
      GoRoute(
        path: '/products',
        builder: (context, state) => const ProductListingScreen(),
      ),
      GoRoute(
        path: '/product-detail/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? 'p_almonds';
          return ProductDetailScreen(productId: id);
        },
      ),
      GoRoute(
        path: '/wishlist',
        builder: (context, state) => const WishlistScreen(),
      ),
      GoRoute(
        path: '/cart',
        builder: (context, state) => const CartScreen(isInBottomNav: false),
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/order-success',
        builder: (context, state) {
          final order = state.extra as CustomerOrder?;
          return OrderSuccessScreen(order: order);
        },
      ),
      GoRoute(
        path: '/my-orders',
        builder: (context, state) => const MyOrdersScreen(),
      ),
      GoRoute(
        path: '/quick-reorder',
        builder: (context, state) => const QuickReorderScreen(),
      ),
      GoRoute(
        path: '/buy-again',
        builder: (context, state) => const QuickReorderScreen(),
      ),
      GoRoute(
        path: '/order-tracking/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? 'ORD-849201';
          final order = state.extra as CustomerOrder?;
          return OrderTrackingScreen(orderId: id, order: order);
        },
      ),
      GoRoute(
        path: '/order-receipt/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? 'ORD-849201';
          final order = state.extra as CustomerOrder?;
          return OrderReceiptScreen(orderId: id, order: order);
        },
      ),
      GoRoute(
        path: '/saved-addresses',
        builder: (context, state) => const SavedAddressesScreen(),
      ),
    ],
  );
});
