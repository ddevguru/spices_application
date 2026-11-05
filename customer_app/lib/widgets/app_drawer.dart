import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';

class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isLoggedIn = authState.isAuthenticated && user != null;

    return Drawer(
      backgroundColor: AppColors.scaffoldBackground,
      child: SafeArea(
        child: Column(
          children: [
            // User Header Profile Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              decoration: const BoxDecoration(
                color: Color(0xFFFDEEE3),
                border: Border(
                  bottom: BorderSide(color: Color(0xFFF0E3D8), width: 1),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrange,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryOrange.withOpacity(0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        isLoggedIn && user.name.isNotEmpty
                            ? user.name[0].toUpperCase()
                            : '🌿',
                        style: GoogleFonts.poppins(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          isLoggedIn ? user.name : 'Welcome Guest',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkText,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isLoggedIn ? user.email : 'Sign in for best deals',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.secondaryText,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (isLoggedIn) ...[
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAD0B0),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Verified Member ⭐',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF7A3600),
                              ),
                            ),
                          ),
                        ] else ...[
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () {
                              Navigator.pop(context);
                              context.push('/login');
                            },
                            child: Text(
                              'Sign In / Register →',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryOrange,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Navigation Menu List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                children: [
                  _drawerItem(
                    context,
                    icon: Icons.home_outlined,
                    activeIcon: Icons.home_rounded,
                    title: 'Home Store',
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/main');
                    },
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.grid_view_outlined,
                    activeIcon: Icons.grid_view_rounded,
                    title: 'All Categories',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/categories');
                    },
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.shopping_bag_outlined,
                    activeIcon: Icons.shopping_bag_rounded,
                    title: 'My Orders',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/orders');
                    },
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.favorite_outline_rounded,
                    activeIcon: Icons.favorite_rounded,
                    title: 'Wishlist',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/wishlist');
                    },
                  ),
                  const Divider(color: AppColors.lightBorder, height: 24, indent: 16, endIndent: 16),
                  _drawerItem(
                    context,
                    icon: Icons.local_offer_outlined,
                    title: 'Coupons & Discounts',
                    trailingBadge: '20% OFF',
                    onTap: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Use coupon WELCOME20 for 20% off!')),
                      );
                    },
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.verified_outlined,
                    title: '100% Quality Promise',
                    onTap: () {
                      Navigator.pop(context);
                      _showQualityPromiseDialog(context);
                    },
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.headset_mic_outlined,
                    title: 'Help & Customer Care',
                    onTap: () {
                      Navigator.pop(context);
                      _showSupportDialog(context);
                    },
                  ),
                ],
              ),
            ),

            // Bottom Logout / Sign In Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: isLoggedIn
                  ? SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          Navigator.pop(context);
                          await ref.read(authProvider.notifier).logout();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Signed out successfully')),
                            );
                          }
                        },
                        icon: const Icon(Icons.logout_rounded, size: 18, color: Colors.red),
                        label: Text(
                          'Sign Out',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.red,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: Colors.red.shade200),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    )
                  : SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          context.push('/login');
                        },
                        icon: const Icon(Icons.login_rounded, size: 18, color: Colors.white),
                        label: Text(
                          'Sign In / Register',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem(
    BuildContext context, {
    required IconData icon,
    IconData? activeIcon,
    required String title,
    String? trailingBadge,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.darkText, size: 22),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.darkText,
        ),
      ),
      trailing: trailingBadge != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFFDEEE3),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF7B98E)),
              ),
              child: Text(
                trailingBadge,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryOrange,
                ),
              ),
            )
          : const Icon(Icons.chevron_right_rounded, size: 20, color: AppColors.secondaryText),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      onTap: onTap,
    );
  }

  void _showQualityPromiseDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.eco_rounded, color: AppColors.successGreen),
            const SizedBox(width: 8),
            Text(
              'Our Quality Promise',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 18),
            ),
          ],
        ),
        content: Text(
          'At Naturale, every batch of dry fruits, whole spices, and cereals is ethically sourced, lab-tested for purity, and free from preservatives or chemical additives. We deliver the authentic farm freshness straight to your doorstep.',
          style: GoogleFonts.inter(fontSize: 13, height: 1.5, color: AppColors.darkText),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Got It',
              style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
            ),
          ),
        ],
      ),
    );
  }

  void _showSupportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Help & Customer Care',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('We are here for you 7 days a week (9 AM – 9 PM):', style: GoogleFonts.inter(fontSize: 13)),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.email_outlined, size: 16, color: AppColors.primaryOrange),
                const SizedBox(width: 8),
                Text('care@naturale.com', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.phone_outlined, size: 16, color: AppColors.primaryOrange),
                const SizedBox(width: 8),
                Text('+91 800-NATURALE', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13)),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Close', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: AppColors.primaryOrange)),
          ),
        ],
      ),
    );
  }
}

