import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/order_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../../services/mock_data_service.dart';
import '../../widgets/custom_button.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _selectedPaymentMethod = 'UPI'; // UPI, Card, NetBanking, COD
  final TextEditingController _instructionsController = TextEditingController();
  
  late final TextEditingController _ownerNameController;
  late final TextEditingController _businessNameController;
  late final TextEditingController _shopNameController;
  late final TextEditingController _gstController;
  late final TextEditingController _addressController;
  late final TextEditingController _cityController;
  late final TextEditingController _pincodeController;
  late final TextEditingController _phoneController;

  bool _isFirstTime = true;
  bool _isEditingDetails = false;
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _ownerNameController = TextEditingController();
    _businessNameController = TextEditingController();
    _shopNameController = TextEditingController();
    _gstController = TextEditingController();
    _addressController = TextEditingController();
    _cityController = TextEditingController(text: 'Mumbai');
    _pincodeController = TextEditingController();
    _phoneController = TextEditingController();

    _loadSavedBusinessProfile();
  }

  Future<void> _loadSavedBusinessProfile() async {
    try {
      final user = ref.read(authProvider).user;
      final userKey = (user != null && user.id.isNotEmpty) ? user.id : 'guest';
      final prefs = await SharedPreferences.getInstance();
      final savedStr = prefs.getString('saved_shop_business_profile_$userKey');

      if (savedStr != null && savedStr.isNotEmpty) {
        final data = jsonDecode(savedStr) as Map<String, dynamic>;
        setState(() {
          _ownerNameController.text = data['ownerName'] ?? '';
          _businessNameController.text = data['businessName'] ?? '';
          _shopNameController.text = data['shopName'] ?? '';
          _gstController.text = data['gstNumber'] ?? '';
          _addressController.text = data['shopAddress'] ?? '';
          _cityController.text = data['city'] ?? 'Mumbai';
          _pincodeController.text = data['pincode'] ?? '';
          _phoneController.text = data['phone'] ?? (user?.phone ?? '');
          _isFirstTime = false;
        });
        return;
      }

      if (user != null) {
        final hasSavedInfo = (user.shopName.isNotEmpty || user.businessName.isNotEmpty) &&
            user.addresses.isNotEmpty;

        setState(() {
          _ownerNameController.text = user.ownerName.isNotEmpty ? user.ownerName : user.name;
          _businessNameController.text = user.businessName;
          _shopNameController.text = user.shopName;
          _gstController.text = user.gstNumber;
          _phoneController.text = user.phone;
          if (user.addresses.isNotEmpty) {
            final addr = user.addresses.first;
            _addressController.text = '${addr.street}, ${addr.area}'.trim();
            _cityController.text = addr.city;
            _pincodeController.text = addr.pincode;
          }
          _isFirstTime = !hasSavedInfo;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _instructionsController.dispose();
    _ownerNameController.dispose();
    _businessNameController.dispose();
    _shopNameController.dispose();
    _gstController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _placeOrder() async {
    final cartState = ref.read(cartProvider);
    if (cartState.items.isEmpty) return;

    final authState = ref.read(authProvider);
    if (!authState.isAuthenticated || authState.user == null) {
      _showError('Please sign in to complete and place your order.');
      if (mounted) {
        context.push('/login');
      }
      return;
    }
    final authUser = authState.user!;

    final ownerName = _ownerNameController.text.trim();
    final businessName = _businessNameController.text.trim();
    final shopName = _shopNameController.text.trim();
    final gstNumber = _gstController.text.trim().toUpperCase();
    final addressText = _addressController.text.trim();
    final city = _cityController.text.trim();
    final pincode = _pincodeController.text.trim();
    final phone = _phoneController.text.trim();

    if (ownerName.isEmpty) {
      _showError('Please enter Business Owner Name');
      return;
    }
    if (shopName.isEmpty && businessName.isEmpty) {
      _showError('Please enter Shop or Business Name');
      return;
    }
    if (addressText.isEmpty) {
      _showError('Please enter Shop Delivery Address');
      return;
    }
    if (phone.isEmpty) {
      _showError('Please enter Contact Phone Number');
      return;
    }

    setState(() => _isPlacingOrder = true);

    // 1. Save locally for instant auto-fetch on all subsequent orders
    try {
      final prefs = await SharedPreferences.getInstance();
      final profileMap = {
        'ownerName': ownerName,
        'businessName': businessName,
        'shopName': shopName,
        'gstNumber': gstNumber,
        'shopAddress': addressText,
        'city': city,
        'pincode': pincode,
        'phone': phone,
      };
      await prefs.setString('saved_shop_business_profile_${authUser.id}', jsonEncode(profileMap));

      // 2. Sync to auth user state & backend
      final updatedUser = authUser.copyWith(
        ownerName: ownerName,
        businessName: businessName,
        shopName: shopName,
        gstNumber: gstNumber,
        phone: phone,
      );
      ref.read(authProvider.notifier).updateProfile(updatedUser);
    } catch (_) {}

    final orderAddress = OrderAddress(
      label: shopName.isNotEmpty ? shopName : 'Store Outlet',
      street: addressText,
      area: city,
      city: city.isNotEmpty ? city : 'India',
      state: 'India',
      pincode: pincode.isNotEmpty ? pincode : '400001',
    );

    final orderCustomer = OrderCustomer(
      name: ownerName.isNotEmpty ? ownerName : authUser.name,
      businessName: businessName.isNotEmpty ? businessName : shopName,
      gstNumber: gstNumber,
      phone: phone.isNotEmpty ? phone : authUser.phone,
      email: authUser.email.toLowerCase().trim(),
      address: orderAddress,
    );

    final orderItems = cartState.items.map((i) {
      return OrderItemRecord(
        productId: i.productId,
        productName: i.productName,
        variantId: i.variant.id,
        variantTitle: i.variant.title,
        weightInGrams: i.variant.weightInGrams,
        price: i.variant.price,
        quantity: i.quantity,
        image: i.image,
      );
    }).toList();

    try {
      final order = await ref.read(orderProvider.notifier).placeOrder(
            customer: orderCustomer,
            items: orderItems,
            subtotal: cartState.subtotal,
            discount: cartState.couponDiscount,
            couponCode: cartState.appliedCoupon?.code ?? '',
            deliveryFee: cartState.deliveryFee,
            totalAmount: cartState.grandTotal,
            paymentMethod: _selectedPaymentMethod,
          );

      ref.read(cartProvider.notifier).clearCart();

      if (mounted) {
        setState(() => _isPlacingOrder = false);
        context.go('/order-success', extra: order);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isPlacingOrder = false);
        _showError('Failed to place order: $e');
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text(
          'Checkout',
          style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Business / Shop Delivery Details
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '1. Business & Shop Details',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                ),
                if (!_isFirstTime && !_isEditingDetails)
                  GestureDetector(
                    onTap: () => setState(() => _isEditingDetails = true),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.lightPeach,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.edit_outlined, size: 14, color: AppColors.primaryOrange),
                          const SizedBox(width: 4),
                          Text(
                            'Edit',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryOrange,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),

            // Card Display: Either Verified Saved Card or Edit Form
            if (!_isFirstTime && !_isEditingDetails)
              _buildSavedBusinessCard()
            else
              _buildBusinessInputForm(),

            const SizedBox(height: 16),

            // Delivery instructions input
            TextField(
              controller: _instructionsController,
              decoration: const InputDecoration(
                hintText: 'Delivery instructions (optional, e.g. Call before delivery)',
                prefixIcon: Icon(Icons.notes_rounded, color: AppColors.secondaryText),
              ),
            ),
            const SizedBox(height: 24),

            // 2. Payment Method Selection
            Text(
              '2. Payment Method',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.creamBackground,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                children: [
                  _buildPaymentRadio('UPI / QR (Google Pay, PhonePe, Paytm)', 'UPI', Icons.qr_code_rounded),
                  const Divider(color: AppColors.lightBorder),
                  _buildPaymentRadio('Credit / Debit Card (Visa, Mastercard)', 'Card', Icons.credit_card_rounded),
                  const Divider(color: AppColors.lightBorder),
                  _buildPaymentRadio('Net Banking (All Indian Banks)', 'NetBanking', Icons.account_balance_rounded),
                  const Divider(color: AppColors.lightBorder),
                  _buildPaymentRadio('Cash on Delivery (COD)', 'COD', Icons.payments_outlined),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 3. Order Summary Box
            Text(
              '3. Order Summary (${cartState.totalItemCount} items)',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.creamBackground,
                borderRadius: AppDimensions.roundedLarge,
                border: Border.all(color: AppColors.lightBorder),
                boxShadow: AppDimensions.cardShadow,
              ),
              child: Column(
                children: [
                  ...cartState.items.map((item) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${item.quantity}x ${item.productName} (${item.variant.title})',
                                style: GoogleFonts.inter(fontSize: 13, color: AppColors.darkText),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              CurrencyFormatter.format(item.itemTotal),
                              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      )),
                  const Divider(height: 20, color: AppColors.lightBorder),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Subtotal', style: GoogleFonts.inter(color: AppColors.secondaryText, fontSize: 13)),
                      Text(CurrencyFormatter.format(cartState.subtotal), style: GoogleFonts.inter(fontSize: 13)),
                    ],
                  ),
                  if (cartState.couponDiscount > 0) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Discount', style: GoogleFonts.inter(color: AppColors.successGreen, fontSize: 13)),
                        Text('-${CurrencyFormatter.format(cartState.couponDiscount)}',
                            style: GoogleFonts.inter(color: AppColors.successGreen, fontSize: 13, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Delivery', style: GoogleFonts.inter(color: AppColors.secondaryText, fontSize: 13)),
                      Text(
                        cartState.deliveryFee == 0 ? 'FREE' : CurrencyFormatter.format(cartState.deliveryFee),
                        style: GoogleFonts.inter(
                          color: cartState.deliveryFee == 0 ? AppColors.successGreen : AppColors.darkText,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 20, color: AppColors.lightBorder),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Payable',
                        style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800),
                      ),
                      Text(
                        CurrencyFormatter.format(cartState.grandTotal),
                        style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primaryOrange),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            // Confirm & Place Order Button
            CustomButton(
              text: 'Place Order (${CurrencyFormatter.format(cartState.grandTotal)})',
              isLoading: _isPlacingOrder,
              icon: Icons.check_circle_outline,
              onPressed: _placeOrder,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSavedBusinessCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.creamBackground,
        borderRadius: AppDimensions.roundedMedium,
        border: Border.all(color: AppColors.primaryOrange, width: 1.5),
        boxShadow: AppDimensions.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF27865F).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle, size: 12, color: Color(0xFF27865F)),
                    const SizedBox(width: 4),
                    Text(
                      'Verified Shop & GST Details Auto-Fetched',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF27865F),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _shopNameController.text.isNotEmpty
                ? _shopNameController.text
                : (_businessNameController.text.isNotEmpty ? _businessNameController.text : 'Store Outlet'),
            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.darkText),
          ),
          if (_businessNameController.text.isNotEmpty && _businessNameController.text != _shopNameController.text)
            Text(
              'Firm: ${_businessNameController.text}',
              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryOrange),
            ),
          const SizedBox(height: 4),
          Text(
            'Owner: ${_ownerNameController.text}',
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.darkText),
          ),
          if (_gstController.text.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              'GSTIN: ${_gstController.text}',
              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.secondaryText),
            ),
          ],
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_outlined, size: 15, color: AppColors.secondaryText),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  '${_addressController.text}, ${_cityController.text} ${_pincodeController.text}',
                  style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.darkText.withOpacity(0.85), height: 1.3),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.phone_outlined, size: 14, color: AppColors.secondaryText),
              const SizedBox(width: 6),
              Text(
                _phoneController.text,
                style: GoogleFonts.inter(fontSize: 12.5, color: AppColors.darkText),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBusinessInputForm() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.creamBackground,
        borderRadius: AppDimensions.roundedLarge,
        border: Border.all(color: AppColors.lightBorder),
        boxShadow: AppDimensions.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.lightPeach,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 16, color: AppColors.primaryOrange),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Collected once on 1st order. Automatically saved and auto-fetched for all future orders.',
                    style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF7A3600), fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _ownerNameController,
            decoration: const InputDecoration(
              labelText: 'Business Owner Name *',
              hintText: 'e.g. Ramesh Patel',
              prefixIcon: Icon(Icons.person_outline),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _shopNameController,
            decoration: const InputDecoration(
              labelText: 'Shop / Store Outlet Name *',
              hintText: 'e.g. Patel Dryfruits & Spices',
              prefixIcon: Icon(Icons.storefront_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _businessNameController,
            decoration: const InputDecoration(
              labelText: 'Business / Firm Registered Name',
              hintText: 'e.g. Patel Enterprises LLP',
              prefixIcon: Icon(Icons.business_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _gstController,
            textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(
              labelText: 'GST Number (Optional)',
              hintText: 'e.g. 27AAAAA0000A1Z5',
              prefixIcon: Icon(Icons.receipt_long_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _addressController,
            maxLines: 2,
            decoration: const InputDecoration(
              labelText: 'Shop Delivery Address *',
              hintText: 'Shop No, Market, Road, Landmark',
              prefixIcon: Icon(Icons.location_on_outlined),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextField(
                  controller: _cityController,
                  decoration: const InputDecoration(
                    labelText: 'City *',
                    hintText: 'Mumbai',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _pincodeController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Pincode',
                    hintText: '400001',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Contact Phone Number *',
              hintText: '10-digit mobile number',
              prefixIcon: Icon(Icons.phone_outlined),
            ),
          ),
          if (_isEditingDetails) ...[
            const SizedBox(height: 14),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _isEditingDetails = false;
                    _isFirstTime = false;
                  });
                },
                icon: const Icon(Icons.check, size: 16),
                label: const Text('Save Details'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryOrange,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaymentRadio(String title, String method, IconData icon) {
    final isSelected = _selectedPaymentMethod == method;

    return InkWell(
      onTap: () => setState(() => _selectedPaymentMethod = method),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? AppColors.primaryOrange : AppColors.secondaryText,
              size: 20,
            ),
            const SizedBox(width: 12),
            Icon(icon, size: 20, color: AppColors.primaryOrange),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: AppColors.darkText,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
