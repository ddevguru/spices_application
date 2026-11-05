import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_dimensions.dart';
import '../core/utils/currency_formatter.dart';
import '../models/product_model.dart';
import '../models/variant_model.dart';

class WeightVariantSelector extends StatelessWidget {
  final Product product;
  final ProductVariant selectedVariant;
  final ValueChanged<ProductVariant> onVariantSelected;

  const WeightVariantSelector({
    super.key,
    required this.product,
    required this.selectedVariant,
    required this.onVariantSelected,
  });

  void _showCustomWeightDialog(BuildContext context) {
    final TextEditingController gramsController = TextEditingController();
    final baseVariant = product.variants.isNotEmpty ? product.variants.first : null;
    final double basePrice100g = baseVariant != null 
        ? (baseVariant.price / baseVariant.weightInGrams) * 100 
        : 100.0;
    final double baseOrigPrice100g = baseVariant != null 
        ? (baseVariant.originalPrice / baseVariant.weightInGrams) * 100 
        : 120.0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.creamBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusExtraLarge)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            final int enteredGrams = int.tryParse(gramsController.text.trim()) ?? 0;
            final double previewPrice = (basePrice100g / 100.0) * enteredGrams;

            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Custom Weight Quantity',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkText,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Enter exact weight in grams (Min: 50 GM, Max: 5000 GM)',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.secondaryText,
                    ),
                  ),
                  const SizedBox(height: 18),
                  TextField(
                    controller: gramsController,
                    keyboardType: TextInputType.number,
                    autofocus: true,
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.darkText,
                    ),
                    decoration: InputDecoration(
                      labelText: 'Weight (Grams)',
                      suffixText: 'GM',
                      suffixStyle: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryOrange,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onChanged: (val) {
                      setSheetState(() {});
                    },
                  ),
                  const SizedBox(height: 16),
                  if (enteredGrams >= 50) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.lightPeach,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Estimated Price:',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: AppColors.darkText,
                            ),
                          ),
                          Text(
                            CurrencyFormatter.format(previewPrice),
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryOrange,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],
                  ElevatedButton(
                    onPressed: enteredGrams >= 50 && enteredGrams <= 5000
                        ? () {
                            final custom = ProductVariant.custom(
                              grams: enteredGrams,
                              basePricePer100g: basePrice100g,
                              baseOriginalPricePer100g: baseOrigPrice100g,
                            );
                            onVariantSelected(custom);
                            Navigator.pop(ctx);
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryOrange,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                    child: Text(
                      'Confirm Custom Weight',
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Select Weight / Pack Size',
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.darkText,
              ),
            ),
            if (product.allowCustomWeight)
              GestureDetector(
                onTap: () => _showCustomWeightDialog(context),
                child: Row(
                  children: [
                    const Icon(Icons.tune_rounded, size: 14, color: AppColors.primaryOrange),
                    const SizedBox(width: 4),
                    Text(
                      'Custom Grams',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryOrange,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: product.variants.map((variant) {
            final isSelected = selectedVariant.id == variant.id;
            final isOutOfStock = variant.stockQuantity <= 0;

            return GestureDetector(
              onTap: isOutOfStock ? null : () => onVariantSelected(variant),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.lightPeach
                      : (isOutOfStock ? Colors.grey.shade100 : Colors.white),
                  borderRadius: AppDimensions.roundedMedium,
                  border: Border.all(
                    color: isSelected
                        ? AppColors.primaryOrange
                        : (isOutOfStock ? Colors.grey.shade300 : AppColors.lightBorder),
                    width: isSelected ? 2 : 1,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primaryOrange.withOpacity(0.18),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          )
                        ]
                      : null,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          variant.title,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                            color: isOutOfStock
                                ? AppColors.secondaryText
                                : (isSelected ? AppColors.primaryOrange : AppColors.darkText),
                          ),
                        ),
                        if (variant.discountPercentage > 0 && !isOutOfStock) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primaryOrange.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${variant.discountPercentage}% OFF',
                              style: GoogleFonts.inter(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryOrange,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isOutOfStock ? 'Out of Stock' : CurrencyFormatter.format(variant.price),
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isOutOfStock ? Colors.red : AppColors.darkText,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

