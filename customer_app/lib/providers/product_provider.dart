import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/category_model.dart';
import '../models/product_model.dart';
import '../models/banner_model.dart';
import '../services/mock_data_service.dart';

final dataServiceProvider = Provider<MockDataService>((ref) {
  return MockDataService();
});

final categoriesFutureProvider = FutureProvider<List<Category>>((ref) async {
  final service = ref.watch(dataServiceProvider);
  return service.getCategories();
});

final bannersFutureProvider = FutureProvider<List<PromoBanner>>((ref) async {
  final service = ref.watch(dataServiceProvider);
  return service.getBanners();
});

class ProductFilterState {
  final String? categoryId;
  final String? subcategory;
  final String? searchQuery;
  final String sortBy; // 'popularity', 'price_low_high', 'price_high_low', 'best_selling', 'new_arrivals'
  final double? minPrice;
  final double? maxPrice;
  final int? weightGrams;

  const ProductFilterState({
    this.categoryId,
    this.subcategory,
    this.searchQuery,
    this.sortBy = 'popularity',
    this.minPrice,
    this.maxPrice,
    this.weightGrams,
  });

  ProductFilterState copyWith({
    String? categoryId,
    String? subcategory,
    String? searchQuery,
    String? sortBy,
    double? minPrice,
    double? maxPrice,
    int? weightGrams,
    bool clearCategory = false,
    bool clearSubcategory = false,
    bool clearSearch = false,
  }) {
    return ProductFilterState(
      categoryId: clearCategory ? null : (categoryId ?? this.categoryId),
      subcategory: clearSubcategory ? null : (subcategory ?? this.subcategory),
      searchQuery: clearSearch ? null : (searchQuery ?? this.searchQuery),
      sortBy: sortBy ?? this.sortBy,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      weightGrams: weightGrams ?? this.weightGrams,
    );
  }
}

class ProductFilterNotifier extends StateNotifier<ProductFilterState> {
  ProductFilterNotifier() : super(const ProductFilterState());

  void setCategory(String? catId) {
    state = state.copyWith(categoryId: catId, clearSubcategory: true);
  }

  void setSubcategory(String? sub) {
    state = state.copyWith(subcategory: sub);
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setSortBy(String sort) {
    state = state.copyWith(sortBy: sort);
  }

  void setPriceRange(double min, double max) {
    state = state.copyWith(minPrice: min, maxPrice: max);
  }

  void setWeightFilter(int? grams) {
    state = state.copyWith(weightGrams: grams);
  }

  void resetFilters() {
    state = const ProductFilterState();
  }
}

final productFilterProvider = StateNotifierProvider<ProductFilterNotifier, ProductFilterState>((ref) {
  return ProductFilterNotifier();
});

final filteredProductsProvider = FutureProvider<List<Product>>((ref) async {
  final service = ref.watch(dataServiceProvider);
  final filter = ref.watch(productFilterProvider);

  return service.getProducts(
    categoryId: filter.categoryId,
    subcategory: filter.subcategory,
    searchQuery: filter.searchQuery,
    sortBy: filter.sortBy,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    filterWeightGrams: filter.weightGrams,
  );
});

final productDetailProvider = FutureProvider.family<Product?, String>((ref, id) async {
  final service = ref.watch(dataServiceProvider);
  return service.getProductById(id);
});

final subcategoryProductsFamily = FutureProvider.family<List<Product>, ({String? categoryId, String subcategory})>((ref, arg) async {
  final service = ref.watch(dataServiceProvider);
  return service.getProductsBySubcategory(arg.subcategory, categoryId: arg.categoryId);
});

