import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../core/services/api_service.dart';
import '../models/driver_model.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  String _errorMessage = '';

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final phone = _phoneController.text.trim();
    final password = _passwordController.text.trim();

    if (phone.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter both mobile number and password.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    final result = await ApiService().login(phone, password);
    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true && result['driver'] is DriverModel) {
      final driver = result['driver'] as DriverModel;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(driver: driver)),
      );
    } else {
      setState(() {
        _errorMessage = (result['message'] as String?) ??
            'Invalid mobile number or password. Please try again.';
      });
    }
  }

  void _fillAccount(String phone) {
    setState(() {
      _phoneController.text = phone;
      _passwordController.text = 'driver123';
      _errorMessage = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.lightBackground,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Brand Header & Icon
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrange,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryOrange.withOpacity(0.35),
                          blurRadius: 18,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.delivery_dining_rounded, color: Colors.white, size: 46),
                  ),
                ),
                const SizedBox(height: 20),

                Center(
                  child: Text(
                    'NATURALE DRIVER',
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                Center(
                  child: Text(
                    'Official Wholesale Delivery Partner Portal',
                    style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(height: 36),

                // Login Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.borderLight),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Driver Login',
                        style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textDark),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Sign in with the credentials created by Admin',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                      ),
                      const SizedBox(height: 20),

                      if (_errorMessage.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFCA5A5)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: Color(0xFF991B1B), size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage,
                                  style: GoogleFonts.inter(
                                    color: const Color(0xFF991B1B),
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Phone Input
                      Text('Registered Phone Number', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.phone_outlined, color: AppColors.primaryOrange, size: 20),
                          hintText: '10-digit mobile number',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryOrange, width: 2)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Password Input
                      Text('Password', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => _isLoading ? null : _handleLogin(),
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.primaryOrange, size: 20),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              color: AppColors.textMuted,
                              size: 20,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                          hintText: 'Enter your password',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryOrange, width: 2)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Submit Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryOrange,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                              : Text(
                                  'Sign In to Duty',
                                  style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Fast Fill Demo Driver Chips
                Text(
                  'Quick Fill Registered Drivers:',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textMuted),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    ActionChip(
                      avatar: const Icon(Icons.two_wheeler, size: 16, color: AppColors.primaryOrange),
                      label: Text('Rajesh Kumar (9876543210)', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600)),
                      onPressed: () => _fillAccount('9876543210'),
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppColors.borderLight)),
                    ),
                    ActionChip(
                      avatar: const Icon(Icons.electric_scooter, size: 16, color: AppColors.primaryOrange),
                      label: Text('Amit Singh (9876543211)', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600)),
                      onPressed: () => _fillAccount('9876543211'),
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppColors.borderLight)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
