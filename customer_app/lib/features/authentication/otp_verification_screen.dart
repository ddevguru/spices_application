import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String mobileNumber;

  const OtpVerificationScreen({super.key, required this.mobileNumber});

  @override
  ConsumerState<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  final _otpController = TextEditingController(text: '1234');

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _verify() async {
    final success = await ref.read(authProvider.notifier).verifyOtp(_otpController.text);
    if (success && mounted) {
      context.go('/main');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text('Verify OTP', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
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
                  'Verification Code',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Enter the 4-digit code sent to +91 ${widget.mobileNumber} (Demo: 1234)',
                  style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText),
                ),
                const SizedBox(height: 24),

                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 4,
                  style: GoogleFonts.poppins(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 16,
                    color: AppColors.primaryOrange,
                  ),
                  decoration: const InputDecoration(
                    hintText: '----',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 20),

                if (authState.error != null) ...[
                  Text(
                    authState.error!,
                    style: GoogleFonts.inter(color: Colors.red, fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                ],

                CustomButton(
                  text: 'Verify & Sign In',
                  isLoading: authState.isLoading,
                  onPressed: _verify,
                ),
                const SizedBox(height: 16),

                Center(
                  child: TextButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('New OTP sent! (Use 1234)')),
                      );
                    },
                    child: Text(
                      'Resend Code in 30s',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryOrange,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

