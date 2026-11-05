class PromoBanner {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String image;
  final String ctaText;
  final String targetCategory;
  final String badge;
  final int order;
  final bool isActive;

  const PromoBanner({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.image,
    required this.ctaText,
    required this.targetCategory,
    this.badge = '',
    this.order = 1,
    this.isActive = true,
  });

  factory PromoBanner.fromJson(Map<String, dynamic> json) {
    return PromoBanner(
      id: json['id'] as String,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String? ?? '',
      description: json['description'] as String? ?? '',
      image: json['image'] as String? ?? '',
      ctaText: json['ctaText'] as String? ?? 'Shop Now',
      targetCategory: json['targetCategory'] as String? ?? '',
      badge: json['badge'] as String? ?? '',
      order: (json['order'] as num?)?.toInt() ?? 1,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'description': description,
      'image': image,
      'ctaText': ctaText,
      'targetCategory': targetCategory,
      'badge': badge,
      'order': order,
      'isActive': isActive,
    };
  }
}

