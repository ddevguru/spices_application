import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../models/order_model.dart';
import '../../services/mock_data_service.dart';
import '../../widgets/custom_button.dart';

class SavedAddressesScreen extends StatefulWidget {
  const SavedAddressesScreen({super.key});

  @override
  State<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends State<SavedAddressesScreen> {
  late List<OrderAddress> _addresses;

  @override
  void initState() {
    super.initState();
    _addresses = List.from(MockDataService().getProfile().addresses);
  }

  void _addNewAddress() {
    final labelCtrl = TextEditingController(text: 'Home');
    final streetCtrl = TextEditingController();
    final areaCtrl = TextEditingController();
    final cityCtrl = TextEditingController(text: 'Bengaluru');
    final stateCtrl = TextEditingController(text: 'Karnataka');
    final pinCtrl = TextEditingController(text: '560038');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.creamBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusExtraLarge)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Add New Address', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 14),
              TextField(controller: labelCtrl, decoration: const InputDecoration(labelText: 'Address Label (Home / Office)')),
              const SizedBox(height: 10),
              TextField(controller: streetCtrl, decoration: const InputDecoration(labelText: 'Flat / House / Street')),
              const SizedBox(height: 10),
              TextField(controller: areaCtrl, decoration: const InputDecoration(labelText: 'Area / Locality')),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: TextField(controller: cityCtrl, decoration: const InputDecoration(labelText: 'City'))),
                  const SizedBox(width: 10),
                  Expanded(child: TextField(controller: pinCtrl, decoration: const InputDecoration(labelText: 'Pincode'))),
                ],
              ),
              const SizedBox(height: 20),
              CustomButton(
                text: 'Save Address',
                onPressed: () {
                  if (streetCtrl.text.isNotEmpty && areaCtrl.text.isNotEmpty) {
                    final newAddr = OrderAddress(
                      label: labelCtrl.text.trim(),
                      street: streetCtrl.text.trim(),
                      area: areaCtrl.text.trim(),
                      city: cityCtrl.text.trim(),
                      state: stateCtrl.text.trim(),
                      pincode: pinCtrl.text.trim(),
                    );
                    setState(() {
                      _addresses.add(newAddr);
                    });
                    final curUser = MockDataService().getProfile();
                    MockDataService().updateProfile(curUser.copyWith(addresses: _addresses));
                    Navigator.pop(ctx);
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.peachBackground,
      appBar: AppBar(
        title: Text('Saved Addresses', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ..._addresses.map((addr) => Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.creamBackground,
                  borderRadius: AppDimensions.roundedMedium,
                  border: Border.all(color: AppColors.lightBorder),
                  boxShadow: AppDimensions.cardShadow,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on_outlined, color: AppColors.primaryOrange, size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            addr.label,
                            style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            addr.fullAddress,
                            style: GoogleFonts.inter(fontSize: 13, color: AppColors.secondaryText, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
          const SizedBox(height: 20),
          CustomButton(
            text: '+ Add New Address',
            isOutlined: true,
            icon: Icons.add,
            onPressed: _addNewAddress,
          ),
        ],
      ),
    );
  }
}

