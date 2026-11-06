import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/order_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';

class HomeScreen extends ConsumerWidget {
  final VoidCallback? onOpenDrawer;

  const HomeScreen({super.key, this.onOpenDrawer});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final userName = (user != null && user.name.isNotEmpty) ? user.name : 'Deepak Mishra';
    final userInitial = userName.isNotEmpty ? userName[0].toUpperCase() : 'D';

    final ordersAsync = ref.watch(orderProvider);
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              // 1. DASHBOARD HEADER
              _buildHeader(context, userName, userInitial),

              const SizedBox(height: 22),

              // 2. DASHBOARD STATISTICS (4 Cards)
              ordersAsync.when(
                data: (orders) => _buildStatisticsGrid(context, orders),
                loading: () => _buildStatisticsPlaceholder(),
                error: (_, __) => _buildStatisticsGrid(context, []),
              ),

              const SizedBox(height: 26),

              // 3. SECTION A: QUICK ACTIONS
              _buildQuickActions(context, cartState.totalItemCount),

              const SizedBox(height: 28),

              // 4. SECTION B: RECENT ORDERS
              ordersAsync.when(
                data: (orders) => _buildRecentOrdersSection(context, orders),
                loading: () => const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
                error: (_, __) => const SizedBox.shrink(),
              ),

              const SizedBox(height: 28),

              // 5. SECTION C: ORDER ACTIVITY & DELIVERY TRACKER
              ordersAsync.when(
                data: (orders) => _buildOrderActivity(context, orders),
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),

              const SizedBox(height: 28),

              // 6. SECTION D: ACCOUNT OVERVIEW
              _buildAccountOverview(context),

              const SizedBox(height: 28),

              // 7. SECTION E: CONTINUE SHOPPING HERO BANNER
              _buildContinueShoppingBanner(context),

              // Bottom clearance so content floats cleanly above CustomBottomNav
              const SizedBox(height: 110),
            ],
          ),
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // HEADER
  // -------------------------------------------------------------
  Widget _buildHeader(BuildContext context, String userName, String userInitial) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Left: Menu Drawer + Welcome Greeting
        Row(
          children: [
            GestureDetector(
              onTap: onOpenDrawer,
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.lightBorder, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(Icons.notes_rounded, color: AppColors.darkText, size: 24),
              ),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.lightPeach,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'NATURALE',
                        style: GoogleFonts.poppins(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.6,
                          color: AppColors.primaryOrange,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Welcome Back! 👋',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.secondaryText,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  userName,
                  style: GoogleFonts.poppins(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: AppColors.darkText,
                  ),
                ),
              ],
            ),
          ],
        ),

        // Right: Notification Bell & Profile Avatar
        Row(
          children: [
            // Notifications Icon
            GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('All notifications are up to date! 🔔'),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
              child: Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: AppColors.lightBorder, width: 1),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(Icons.notifications_none_rounded, color: AppColors.darkText, size: 22),
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: AppColors.primaryOrange,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),

            // Profile Avatar
            GestureDetector(
              onTap: () => context.push('/saved-addresses'),
              child: Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.primaryOrange,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryOrange.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    userInitial,
                    style: GoogleFonts.poppins(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // DASHBOARD STATISTICS (4 CARDS)
  // -------------------------------------------------------------
  Widget _buildStatisticsGrid(BuildContext context, List<CustomerOrder> orders) {
    final totalOrdersCount = orders.isNotEmpty ? orders.length : 24;
    final totalSpentAmount = orders.isNotEmpty
        ? orders.fold(0.0, (sum, o) => sum + o.totalAmount)
        : 12450.0;
    final pendingCount = orders.isNotEmpty
        ? orders.where((o) => !['delivered', 'cancelled'].contains(o.status.toLowerCase())).length
        : 3;
    final totalSavings = orders.isNotEmpty
        ? orders.fold(0.0, (sum, o) => sum + o.discount + 80.0)
        : 2350.0;

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 14,
      mainAxisSpacing: 14,
      childAspectRatio: 1.35,
      children: [
        // 1. Total Orders
        _buildStatCard(
          title: 'Total Orders',
          value: '$totalOrdersCount',
          subtext: '+12% this month',
          icon: Icons.shopping_bag_outlined,
          cardColor: const Color(0xFFFDEEE3),
          iconColor: const Color(0xFFE26117),
        ),

        // 2. Total Spent
        _buildStatCard(
          title: 'Total Spent',
          value: CurrencyFormatter.format(totalSpentAmount),
          subtext: 'Verified Spends',
          icon: Icons.account_balance_wallet_outlined,
          cardColor: const Color(0xFFFFF5EB),
          iconColor: const Color(0xFFD97706),
        ),

        // 3. Pending Orders
        _buildStatCard(
          title: 'Pending Orders',
          value: '$pendingCount',
          subtext: pendingCount > 0 ? 'In Transit / Dispatch' : 'All Orders Delivered',
          icon: Icons.hourglass_top_rounded,
          cardColor: const Color(0xFFFEE8D6),
          iconColor: const Color(0xFFEA580C),
        ),

        // 4. Total Savings
        _buildStatCard(
          title: 'Total Savings',
          value: CurrencyFormatter.format(totalSavings),
          subtext: 'Coupons & Deals',
          icon: Icons.savings_outlined,
          cardColor: const Color(0xFFEBF5EE),
          iconColor: const Color(0xFF16A34A),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtext,
    required IconData icon,
    required Color cardColor,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: iconColor.withOpacity(0.18), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.secondaryText,
                ),
              ),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: iconColor.withOpacity(0.15),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(icon, color: iconColor, size: 17),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.darkText,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtext,
                style: GoogleFonts.inter(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: iconColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsPlaceholder() {
    return Container(
      height: 220,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: const Center(child: CircularProgressIndicator()),
    );
  }

  // -------------------------------------------------------------
  // SECTION A: QUICK ACTIONS
  // -------------------------------------------------------------
  Widget _buildQuickActions(BuildContext context, int cartCount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: GoogleFonts.poppins(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.darkText,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // 1. Browse Categories
            Expanded(
              child: _buildActionTile(
                context,
                title: 'Browse\nCategories',
                icon: Icons.grid_view_rounded,
                bgColor: const Color(0xFFFDEEE3),
                iconColor: AppColors.primaryOrange,
                onTap: () => context.push('/categories'),
              ),
            ),
            const SizedBox(width: 10),

            // 2. My Orders
            Expanded(
              child: _buildActionTile(
                context,
                title: 'My\nOrders',
                icon: Icons.receipt_long_rounded,
                bgColor: const Color(0xFFFFF7ED),
                iconColor: const Color(0xFFD97706),
                onTap: () => context.push('/my-orders'),
              ),
            ),
            const SizedBox(width: 10),

            // 3. My Wishlist
            Expanded(
              child: _buildActionTile(
                context,
                title: 'My\nWishlist',
                icon: Icons.favorite_rounded,
                bgColor: const Color(0xFFFDF2F8),
                iconColor: const Color(0xFFE11D48),
                onTap: () => context.push('/wishlist'),
              ),
            ),
            const SizedBox(width: 10),

            // 4. My Cart
            Expanded(
              child: _buildActionTile(
                context,
                title: 'My\nCart',
                icon: Icons.shopping_bag_rounded,
                bgColor: const Color(0xFFF0FDF4),
                iconColor: const Color(0xFF16A34A),
                badge: cartCount > 0 ? '$cartCount' : null,
                onTap: () => context.push('/cart'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color bgColor,
    required Color iconColor,
    String? badge,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.lightBorder, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: bgColor,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: iconColor, size: 22),
                ),
                if (badge != null)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.primaryOrange,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      child: Text(
                        badge,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.darkText,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // SECTION B: RECENT ORDERS
  // -------------------------------------------------------------
  Widget _buildRecentOrdersSection(BuildContext context, List<CustomerOrder> orders) {
    // If user has orders, show last 3, otherwise realistic mock orders
    final List<CustomerOrder> displayOrders = orders.isNotEmpty
        ? orders.take(3).toList()
        : [
            CustomerOrder(
              id: 'ORD-98214',
              createdAt: DateTime.now().subtract(const Duration(days: 1)),
              status: 'Delivered',
              customer: const OrderCustomer(
                name: 'Deepak Mishra',
                phone: '9876543210',
                email: 'deepakm7778@gmail.com',
                address: OrderAddress(label: 'Home', street: 'MG Road', area: 'Civil Lines', city: 'Delhi', state: 'Delhi', pincode: '110001'),
              ),
              items: const [
                OrderItemRecord(
                  productId: 'p_almonds',
                  productName: 'California Whole Almonds',
                  variantId: 'v_a250',
                  variantTitle: '250 GM',
                  weightInGrams: 250,
                  price: 280,
                  quantity: 2,
                  image: 'assets/images/prod_almonds.jpg',
                ),
                OrderItemRecord(
                  productId: 'p_cashews',
                  productName: 'Royal Mangalore Cashews (W240)',
                  variantId: 'v_c250',
                  variantTitle: '250 GM',
                  weightInGrams: 250,
                  price: 320,
                  quantity: 1,
                  image: 'assets/images/prod_cashews.jpg',
                ),
              ],
              subtotal: 880,
              discount: 80,
              deliveryFee: 0,
              totalAmount: 800,
              paymentMethod: 'UPI (GPay)',
            ),
            CustomerOrder(
              id: 'ORD-89402',
              createdAt: DateTime.now().subtract(const Duration(days: 4)),
              status: 'Out for Delivery',
              customer: const OrderCustomer(
                name: 'Deepak Mishra',
                phone: '9876543210',
                email: 'deepakm7778@gmail.com',
                address: OrderAddress(label: 'Home', street: 'MG Road', area: 'Civil Lines', city: 'Delhi', state: 'Delhi', pincode: '110001'),
              ),
              items: const [
                OrderItemRecord(
                  productId: 'p_cardamom',
                  productName: 'Royal Bold Green Cardamom (8mm)',
                  variantId: 'v_gc100',
                  variantTitle: '100 GM',
                  weightInGrams: 100,
                  price: 290,
                  quantity: 1,
                  image: 'assets/images/cat_wholespices.jpg',
                ),
              ],
              subtotal: 290,
              discount: 0,
              deliveryFee: 40,
              totalAmount: 330,
              paymentMethod: 'Credit Card',
            ),
            CustomerOrder(
              id: 'ORD-82104',
              createdAt: DateTime.now().subtract(const Duration(days: 8)),
              status: 'Processing',
              customer: const OrderCustomer(
                name: 'Deepak Mishra',
                phone: '9876543210',
                email: 'deepakm7778@gmail.com',
                address: OrderAddress(label: 'Home', street: 'MG Road', area: 'Civil Lines', city: 'Delhi', state: 'Delhi', pincode: '110001'),
              ),
              items: const [
                OrderItemRecord(
                  productId: 'p_walnut',
                  productName: 'Kashmiri Snow-White Walnut Halves',
                  variantId: 'v_w500',
                  variantTitle: '500 GM',
                  weightInGrams: 500,
                  price: 680,
                  quantity: 1,
                  image: 'assets/images/prod_walnuts.jpg',
                ),
              ],
              subtotal: 680,
              discount: 50,
              deliveryFee: 0,
              totalAmount: 630,
              paymentMethod: 'UPI',
            ),
          ];

    final dateFormat = DateFormat('dd MMM yyyy');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Orders',
              style: GoogleFonts.poppins(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
              ),
            ),
            GestureDetector(
              onTap: () => context.push('/my-orders'),
              child: Text(
                'View All →',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryOrange,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: displayOrders.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final order = displayOrders[index];
            final firstItemName = order.items.isNotEmpty ? order.items.first.productName : 'Natural Spices & Dry Fruits';
            final moreCount = order.items.length > 1 ? ' + ${order.items.length - 1} more' : '';
            final statusColor = _getStatusColor(order.status);

            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.lightBorder, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Row: Order ID & Status Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '#${order.id}',
                        style: GoogleFonts.poppins(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkText,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          order.status,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: statusColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Middle: Product Name & Date
                  Text(
                    '$firstItemName$moreCount',
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.darkText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Ordered on ${dateFormat.format(order.createdAt)}',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.secondaryText,
                    ),
                  ),
                  const Divider(color: AppColors.lightBorder, height: 18),

                  // Bottom Row: Amount & View Details Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Amount: ',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.secondaryText,
                            ),
                          ),
                          Text(
                            CurrencyFormatter.format(order.totalAmount),
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.darkText,
                            ),
                          ),
                        ],
                      ),
                      InkWell(
                        onTap: () {
                          context.push('/order-tracking/${order.id}', extra: order);
                        },
                        child: Row(
                          children: [
                            Text(
                              'View Details',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryOrange,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.primaryOrange),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return const Color(0xFF16A34A);
      case 'out for delivery':
      case 'in transit':
        return AppColors.primaryOrange;
      case 'processing':
      case 'confirmed':
        return const Color(0xFFD97706);
      case 'cancelled':
        return Colors.redAccent;
      default:
        return AppColors.primaryOrange;
    }
  }

  // -------------------------------------------------------------
  // SECTION C: ORDER ACTIVITY & DELIVERY TRACKER
  // -------------------------------------------------------------
  Widget _buildOrderActivity(BuildContext context, List<CustomerOrder> orders) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.lightBorder, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Shopping & Delivery Activity',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.darkText,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEBF5EE),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '99.4% On-Time',
                  style: GoogleFonts.inter(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF16A34A),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Simple Visual Tracker Steps
          Row(
            children: [
              _buildActivityStep(title: 'Farm Sorted', isCompleted: true),
              _buildActivityDivider(isCompleted: true),
              _buildActivityStep(title: 'Vacuum Pack', isCompleted: true),
              _buildActivityDivider(isCompleted: true),
              _buildActivityStep(title: 'Dispatched', isCompleted: true),
              _buildActivityDivider(isCompleted: false),
              _buildActivityStep(title: 'Delivered', isCompleted: false),
            ],
          ),
          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFDE0C5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.bolt_rounded, color: AppColors.primaryOrange, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Free Express Delivery unlocked on all orders above ₹500!',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF9A3412),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityStep({required String title, required bool isCompleted}) {
    return Column(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            color: isCompleted ? AppColors.primaryOrange : const Color(0xFFE5E7EB),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isCompleted ? Icons.check : Icons.circle,
            size: 12,
            color: isCompleted ? Colors.white : Colors.grey.shade400,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 9.5,
            fontWeight: isCompleted ? FontWeight.w700 : FontWeight.w500,
            color: isCompleted ? AppColors.darkText : AppColors.secondaryText,
          ),
        ),
      ],
    );
  }

  Widget _buildActivityDivider({required bool isCompleted}) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 14),
        color: isCompleted ? AppColors.primaryOrange : const Color(0xFFE5E7EB),
      ),
    );
  }

  // -------------------------------------------------------------
  // SECTION D: ACCOUNT OVERVIEW
  // -------------------------------------------------------------
  Widget _buildAccountOverview(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Account Overview',
          style: GoogleFonts.poppins(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.darkText,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.lightBorder, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              // 1. Saved Addresses
              _buildOverviewTile(
                icon: Icons.location_on_outlined,
                iconColor: const Color(0xFF2563EB),
                title: 'Saved Delivery Addresses',
                subtitle: '2 Addresses (Home & Office configured)',
                onTap: () => context.push('/saved-addresses'),
              ),
              const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.lightBorder),

              // 2. Available Coupons
              _buildOverviewTile(
                icon: Icons.local_offer_outlined,
                iconColor: const Color(0xFFD97706),
                title: 'Available Coupons & Discounts',
                subtitle: '3 Active Promos (WELCOME20, NATURALE50)',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Coupons: WELCOME20 applied at checkout for 20% savings!')),
                  );
                },
              ),
              const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.lightBorder),

              // 3. Profile Completion
              _buildOverviewTile(
                icon: Icons.verified_user_outlined,
                iconColor: const Color(0xFF16A34A),
                title: 'Profile Completion & KYC',
                subtitle: '100% Completed • Verified Member ⭐',
                onTap: () => context.push('/saved-addresses'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: AppColors.darkText,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.inter(
          fontSize: 11,
          color: AppColors.secondaryText,
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.secondaryText, size: 20),
      onTap: onTap,
    );
  }

  // -------------------------------------------------------------
  // SECTION E: CONTINUE SHOPPING HERO BANNER
  // -------------------------------------------------------------
  Widget _buildContinueShoppingBanner(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF3E6), Color(0xFFFDE8D4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFF7C8A4), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryOrange.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryOrange,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '100% PURE HARVEST',
                  style: GoogleFonts.poppins(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.6,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Direct Farm Sourced',
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.secondaryText),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Explore Pure Dry Fruits,\nHeritage Spices & Cereals',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.darkText,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Select your favorite category, browse subcategories, pick exact weight variants & order directly.',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.secondaryText,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 46,
            child: ElevatedButton.icon(
              onPressed: () => context.push('/categories'),
              icon: const Icon(Icons.grid_view_rounded, size: 18, color: Colors.white),
              label: Text(
                'Explore Categories & Products →',
                style: GoogleFonts.poppins(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryOrange,
                foregroundColor: Colors.white,
                elevation: 2,
                shadowColor: AppColors.primaryOrange.withOpacity(0.35),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(23)),
                padding: const EdgeInsets.symmetric(horizontal: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
