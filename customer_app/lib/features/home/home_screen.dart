import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/order_model.dart';
import '../../models/user_model.dart';
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
    final userName = (user != null && user.name.trim().isNotEmpty) ? user.name.trim() : 'Valued Customer';
    final userInitial = (user != null && user.name.trim().isNotEmpty) ? user.name.trim()[0].toUpperCase() : 'U';

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
              _buildAccountOverview(context, user),

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

        // Right: QR Scan, Notification Bell & Profile Avatar
        Row(
          children: [
            // QR / SKU Quick Scan Button
            GestureDetector(
              onTap: () => _showSkuOrQrLookupDialog(context),
              child: Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: AppColors.lightBorder, width: 1),
                ),
                child: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primaryOrange, size: 21),
              ),
            ),
            const SizedBox(width: 8),

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
    final totalOrdersCount = orders.length;
    final totalSpentAmount = orders.fold(0.0, (sum, o) => sum + o.totalAmount);
    final pendingCount = orders
        .where((o) => !['delivered', 'cancelled'].contains(o.status.toLowerCase()))
        .length;
    final totalSavings = orders.fold(0.0, (sum, o) => sum + o.discount);

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
          subtext: totalOrdersCount > 0 ? '$totalOrdersCount placed' : 'No orders yet',
          icon: Icons.shopping_bag_outlined,
          cardColor: const Color(0xFFFDEEE3),
          iconColor: const Color(0xFFE26117),
        ),

        // 2. Total Spent
        _buildStatCard(
          title: 'Total Spent',
          value: CurrencyFormatter.format(totalSpentAmount),
          subtext: totalOrdersCount > 0 ? 'Verified Spends' : '₹0 total spends',
          icon: Icons.account_balance_wallet_outlined,
          cardColor: const Color(0xFFFFF5EB),
          iconColor: const Color(0xFFD97706),
        ),

        // 3. Pending Orders
        _buildStatCard(
          title: 'Pending Orders',
          value: '$pendingCount',
          subtext: pendingCount > 0 ? '$pendingCount in transit' : 'No active orders',
          icon: Icons.hourglass_top_rounded,
          cardColor: const Color(0xFFFEE8D6),
          iconColor: const Color(0xFFEA580C),
        ),

        // 4. Total Savings
        _buildStatCard(
          title: 'Total Savings',
          value: CurrencyFormatter.format(totalSavings),
          subtext: totalSavings > 0 ? 'Coupons & Deals' : 'No discounts used',
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
    if (orders.isEmpty) {
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
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.lightBorder),
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
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.primaryOrange.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.receipt_long_outlined, size: 24, color: AppColors.primaryOrange),
                ),
                const SizedBox(height: 12),
                Text(
                  'No Orders Placed Yet',
                  style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.darkText),
                ),
                const SizedBox(height: 4),
                Text(
                  'Explore our categories to order fresh dry fruits and spices directly to your doorstep!',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.secondaryText),
                ),
                const SizedBox(height: 14),
                ElevatedButton.icon(
                  onPressed: () => context.push('/categories'),
                  icon: const Icon(Icons.shopping_bag_outlined, size: 16, color: Colors.white),
                  label: Text(
                    'Browse Categories',
                    style: GoogleFonts.poppins(fontSize: 12.5, fontWeight: FontWeight.w700),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryOrange,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    final displayOrders = orders.take(3).toList();
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

                  // Bottom Row: Amount & Actions
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
                      Row(
                        children: [
                          InkWell(
                            onTap: () {
                              context.push('/order-receipt/${order.id}', extra: order);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primaryOrange.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.receipt_rounded, size: 13, color: AppColors.primaryOrange),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Bill',
                                    style: GoogleFonts.inter(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.primaryOrange,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          InkWell(
                            onTap: () {
                              context.push('/order-tracking/${order.id}', extra: order);
                            },
                            child: Row(
                              children: [
                                Text(
                                  'Details',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primaryOrange,
                                  ),
                                ),
                                const SizedBox(width: 2),
                                const Icon(Icons.arrow_forward_rounded, size: 13, color: AppColors.primaryOrange),
                              ],
                            ),
                          ),
                        ],
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
  Widget _buildAccountOverview(BuildContext context, UserProfile? user) {
    final addressCount = user?.addresses.length ?? 0;
    final addressSubtitle = addressCount > 0
        ? '$addressCount Saved Address${addressCount > 1 ? 'es' : ''} (${user!.addresses.first.city})'
        : 'No address configured yet • Tap to add';

    final kycSubtitle = user != null
        ? 'Verified Customer (${user.effectiveLicenseNumber})'
        : 'Sign in to access registered account';

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
                subtitle: addressSubtitle,
                onTap: () => context.push('/saved-addresses'),
              ),
              const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.lightBorder),

              // 2. Available Coupons
              _buildOverviewTile(
                icon: Icons.local_offer_outlined,
                iconColor: const Color(0xFFD97706),
                title: 'Available Coupons & Discounts',
                subtitle: 'Active Promos (WELCOME20, NATURALE50)',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Coupons: WELCOME20 applied at checkout for 20% savings!')),
                  );
                },
              ),
              const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.lightBorder),

              // 3. Profile Completion & License
              _buildOverviewTile(
                icon: Icons.verified_user_outlined,
                iconColor: const Color(0xFF16A34A),
                title: 'Profile & Merchant License',
                subtitle: kycSubtitle,
                onTap: () => context.push('/saved-addresses'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showSkuOrQrLookupDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (dialogCtx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primaryOrange),
              const SizedBox(width: 10),
              Text(
                'Scan QR / Enter SKU',
                style: GoogleFonts.poppins(fontSize: 17, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Enter product SKU code (e.g. DF-ALM-101), 12-digit barcode, or paste the link shared by Store Manager:',
                style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.secondaryText),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'e.g. DF-ALM-101 or 890700100000',
                  hintStyle: GoogleFonts.inter(fontSize: 13, color: Colors.grey.shade400),
                  filled: true,
                  fillColor: const Color(0xFFF9FAFB),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.lightBorder),
                  ),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.secondaryText),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: Text('Cancel', style: GoogleFonts.inter(color: AppColors.secondaryText)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryOrange,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                final raw = controller.text.trim();
                if (raw.isEmpty) return;
                Navigator.pop(dialogCtx);

                String sku = raw;
                if (raw.contains('sku=')) {
                  final uri = Uri.tryParse(raw);
                  sku = uri?.queryParameters['sku'] ?? raw.split('sku=').last.split('&').first;
                } else if (raw.contains('barcode=')) {
                  final uri = Uri.tryParse(raw);
                  sku = uri?.queryParameters['barcode'] ?? raw.split('barcode=').last.split('&').first;
                }

                context.push('/product?sku=$sku');
              },
              child: Text('Open Product', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
            ),
          ],
        );
      },
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
