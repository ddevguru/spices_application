class Category {
  final String id;
  final String name;
  final String slug;
  final String image;
  final String description;
  final int order;
  final bool isActive;
  final List<String> subcategories;

  const Category({
    required this.id,
    required this.name,
    required this.slug,
    required this.image,
    required this.description,
    this.order = 0,
    this.isActive = true,
    required this.subcategories,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String? ?? '',
      image: json['image'] as String? ?? '',
      description: json['description'] as String? ?? '',
      order: (json['order'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? true,
      subcategories: (json['subcategories'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'image': image,
      'description': description,
      'order': order,
      'isActive': isActive,
      'subcategories': subcategories,
    };
  }
}

