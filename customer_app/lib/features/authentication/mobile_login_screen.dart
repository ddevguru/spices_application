import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';

class MobileLoginScreen extends ConsumerStatefulWidget {
  const MobileLoginScreen({super.key});

  @override
  ConsumerState<MobileLoginScreen> createState() => _MobileLoginScreenState();
}

class _MobileLoginScreenState extends ConsumerState<MobileLoginScreen> {
  final _mobileController = TextEditingController();

  @override
  void dispose() {
    _mobileController.dispose();
    super.dispose();
  }

  void _sendOtp() async {
    final success = await ref.read(authProvider.notifier).loginWithMobile(_mobileController.text);
    if (success && mounted) {
      context.push('/otp-verification', extra: _mobileController.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text('Mobile Login', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.creamBackground,
              borderRadius: AppDimensions.roundedLarge,
              border: Border.all(color: AppColors.lightBorder),
              boxShadow: AppDimensions.cardShadow,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Enter Mobile Number',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'We will send a 4-digit verification OTP code to your number',
                  style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
                ),
                const SizedBox(height: 24),

                TextField(
                  controller: _mobileController,
                  keyboardType: TextInputType.phone,
                  style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600),
                  decoration: const InputDecoration(
                    prefixText: '+91  ',
                    prefixStyle: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
                    hintText: '10-digit number',
                  ),
                ),
                const SizedBox(height: 24),

                CustomButton(
                  text: 'Send Verification OTP',
                  isLoading: authState.isLoading,
                  onPressed: _sendOtp,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

