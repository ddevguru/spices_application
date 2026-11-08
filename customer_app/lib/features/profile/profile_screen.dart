import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isLoggedIn = authState.isAuthenticated && user != null;

    final displayName = isLoggedIn ? user.name : 'Welcome Guest';
    final displayEmail = isLoggedIn ? user.email : 'Sign in to access your orders';
    final displayPhone = isLoggedIn ? user.phone : '';
    final initialLetter = isLoggedIn && user.name.isNotEmpty ? user.name[0].toUpperCase() : '🌿';

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(
          'My Profile',
          style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.darkText),
        ),
        automaticallyImplyLeading: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 20, right: 20, top: 10, bottom: 120),
        child: Column(
          children: [
            // User Profile Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      color: AppColors.lightPeach,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        initialLetter,
                        style: GoogleFonts.poppins(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryOrange,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          displayName,
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkText,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          displayEmail,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.secondaryText,
                          ),
                        ),
                        if (displayPhone.isNotEmpty)
                          Text(
                            displayPhone,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        if (isLoggedIn) ...[
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFDEEE3),
                              borderRadius: BorderRadius.circular(10),
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
                        ],
                      ],
                    ),
                  ),
                  if (isLoggedIn)
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, color: AppColors.primaryOrange, size: 20),
                      onPressed: () {
                        _showEditProfileDialog(context, ref, user);
                      },
                    )
                  else
                    GestureDetector(
                      onTap: () => context.push('/login'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryOrange,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          'Sign In',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (isLoggedIn) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2C1810), Color(0xFF1A0F0A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: AppDimensions.roundedLarge,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2C1810).withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 6),
                    ),
                  ],
                  border: Border.all(color: const Color(0xFFE5A93C), width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE5A93C).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.verified_user_rounded, color: Color(0xFFE5A93C), size: 18),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'MERCHANT LICENSE',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.2,
                                color: const Color(0xFFE5A93C),
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF27865F).withOpacity(0.25),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF27865F), width: 1),
                          ),
                          child: Text(
                            'Active Tier-1',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF4ADE80),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Official Application License No.',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: Colors.white.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text(
                          user.effectiveLicenseNumber,
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1,
                            color: Colors.white,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            Clipboard.setData(ClipboardData(text: user.effectiveLicenseNumber));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('License Number copied to clipboard!')),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.copy_rounded, color: Colors.white, size: 13),
                                const SizedBox(width: 4),
                                Text(
                                  'Copy',
                                  style: GoogleFonts.inter(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Divider(color: Colors.white.withOpacity(0.12), height: 1),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'STORE / BUSINESS',
                                style: GoogleFonts.inter(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white.withOpacity(0.5),
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                user.shopName.isNotEmpty
                                    ? user.shopName
                                    : (user.businessName.isNotEmpty ? user.businessName : 'Registered Merchant'),
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        if (user.gstNumber.isNotEmpty)
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'GST NUMBER',
                                  style: GoogleFonts.inter(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white.withOpacity(0.5),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  user.gstNumber,
                                  style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),

            // Account Options Menu
            Container(
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.repeat_rounded,
                    title: 'Quick Reorder (Buy Again)',
                    subtitle: 'Multi-select past items & direct 1-tap reorder',
                    onTap: () => context.push('/quick-reorder'),
                  ),
                  const Divider(color: AppColors.lightBorder, height: 1, indent: 16, endIndent: 16),
                  _buildMenuItem(
                    icon: Icons.receipt_long_rounded,
                    title: 'My Orders',
                    subtitle: 'Track active orders & history',
                    onTap: () => context.push('/my-orders'),
                  ),
                  const Divider(color: AppColors.lightBorder, height: 1, indent: 16, endIndent: 16),
                  _buildMenuItem(
                    icon: Icons.favorite_border_rounded,
                    title: 'Wishlist',
                    subtitle: 'Your saved dry fruits & spices',
                    onTap: () => context.push('/wishlist'),
                  ),
                  const Divider(color: AppColors.lightBorder, height: 1, indent: 16, endIndent: 16),
                  _buildMenuItem(
                    icon: Icons.location_on_outlined,
                    title: 'Saved Addresses',
                    subtitle: 'Home, office and delivery addresses',
                    onTap: () => context.push('/saved-addresses'),
                  ),
                  const Divider(color: AppColors.lightBorder, height: 1, indent: 16, endIndent: 16),
                  _buildMenuItem(
                    icon: Icons.notifications_none_rounded,
                    title: 'Notifications',
                    subtitle: 'Discounts, seasonal harvest & status',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('All notifications are up to date!')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // More Options
            Container(
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.headset_mic_outlined,
                    title: 'Help & Customer Support',
                    subtitle: 'Direct support & WhatsApp query',
                    onTap: () {
                      _showSupportDialog(context);
                    },
                  ),
                  const Divider(color: AppColors.lightBorder, height: 1, indent: 16, endIndent: 16),
                  _buildMenuItem(
                    icon: Icons.info_outline_rounded,
                    title: 'About Naturale',
                    subtitle: 'Pure dry fruits, heritage spices & cereals',
                    onTap: () {
                      _showAboutDialog(context);
                    },
                  ),
                  const Divider(color: AppColors.lightBorder, height: 1, indent: 16, endIndent: 16),
                  _buildMenuItem(
                    icon: Icons.security_rounded,
                    title: 'Privacy Policy & Terms',
                    subtitle: 'Data protection and shopping standards',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Privacy Policy: 100% encrypted & local')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout or Sign In Button
            if (isLoggedIn)
              OutlinedButton(
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    context.go('/main');
                  }
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Color(0xFFFCA5A5), width: 1.5),
                  backgroundColor: const Color(0xFFFEF2F2),
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.logout_rounded, size: 18, color: Colors.red),
                    const SizedBox(width: 8),
                    Text(
                      'Log Out',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
              )
            else
              ElevatedButton.icon(
                onPressed: () => context.push('/login'),
                icon: const Icon(Icons.login_rounded, size: 18, color: Colors.white),
                label: Text(
                  'Sign In / Register',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryOrange,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            const SizedBox(height: 110),
          ],
        ),
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context, WidgetRef ref, UserProfile user) {
    final nameCtrl = TextEditingController(text: user.name);
    final emailCtrl = TextEditingController(text: user.email);
    final phoneCtrl = TextEditingController(text: user.phone);
    final shopCtrl = TextEditingController(text: user.shopName);
    final bizCtrl = TextEditingController(text: user.businessName);
    final gstCtrl = TextEditingController(text: user.gstNumber);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Edit Profile & Store', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Full Name / Owner Name')),
              const SizedBox(height: 12),
              TextField(controller: shopCtrl, decoration: const InputDecoration(labelText: 'Shop / Store Name')),
              const SizedBox(height: 12),
              TextField(controller: bizCtrl, decoration: const InputDecoration(labelText: 'Business / Firm Name')),
              const SizedBox(height: 12),
              TextField(controller: gstCtrl, decoration: const InputDecoration(labelText: 'GST Number (Optional)')),
              const SizedBox(height: 12),
              TextField(controller: emailCtrl, decoration: const InputDecoration(labelText: 'Email Address')),
              const SizedBox(height: 12),
              TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Phone Number')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(authProvider.notifier).updateProfile(
                user.copyWith(
                  name: nameCtrl.text.trim(),
                  shopName: shopCtrl.text.trim(),
                  businessName: bizCtrl.text.trim(),
                  gstNumber: gstCtrl.text.trim().toUpperCase(),
                  email: emailCtrl.text.trim(),
                  phone: phoneCtrl.text.trim(),
                ),
              );
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryOrange),
            child: const Text('Save Changes'),
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
        title: Text('Help & Customer Care', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Customer service hours: 9 AM – 9 PM', style: TextStyle(fontSize: 13)),
            const SizedBox(height: 10),
            const Text('Email: care@naturale.com', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 4),
            const Text('WhatsApp: +91 800-NATURALE', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('About Naturale', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: const Text(
          'Naturale is dedicated exclusively to sourcing and delivering 100% natural, ethically harvested dry fruits, single-origin whole spices, stone-ground authentic blends, and gluten-free cereals.',
          style: TextStyle(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: AppColors.lightPeach,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.primaryOrange, size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.darkText,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryText),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.secondaryText),
    );
  }
}
