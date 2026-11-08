const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { getPool, isPostgresConnected } = require('../config/db');

// Master product catalogue dedicated strictly to Dry Fruits, Whole Spices, Blended Spices & Cereals
const COMPREHENSIVE_PRODUCTS = [
  // DRY FRUITS
  {
    id: "p_ajwa_dates",
    name: "Saudi Royal Ajwa Dates (Ajwa Khejur)",
    brand: "Naturale Royal",
    categoryId: "cat_dry_fruits",
    categoryName: "Dry Fruits",
    subcategoryId: "Dates",
    subcategoryName: "Dates",
    shortDescription: "Soft, dark, luscious sacred Ajwa dates from Madinah.",
    description: "Authentic Saudi Arabian Royal Ajwa dates (Ajwa Khejur) carefully sun-ripened in Madinah orchards. Revered for their distinctive fine texture, rich natural sweetness, and exceptional antioxidant, potassium, and magnesium content.",
    rating: 4.9,
    reviewCount: 380,
    image: "assets/images/cat_dryfruits.jpg",
    galleryImages: [
      "assets/images/cat_dryfruits.jpg",
      "assets/images/banner_discount.jpg"
    ],
    origin: "Al-Madinah, Saudi Arabia",
    ingredients: "100% Pure Natural Sun-ripened Ajwa Dates",
    nutritionFacts: {
      "Energy": "282 kcal",
      "Carbohydrates": "75.0 g",
      "Dietary Fiber": "8.0 g",
      "Potassium": "696 mg",
      "Protein": "2.5 g",
      "Iron": "1.2 mg"
    },
    storageInstructions: "Store in a cool dry place or refrigerate for maximum freshness.",
    specifications: {
      "Grade": "Jumbo Premium Royal",
      "Moisture": "18 - 22%",
      "Shelf Life": "12 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_ajwa_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 160, originalPrice: 199, stockQuantity: 95, sku: "DF-AJW-100", isAvailable: true },
      { id: "v_ajwa_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 380, originalPrice: 475, stockQuantity: 70, sku: "DF-AJW-250", isAvailable: true },
      { id: "v_ajwa_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 740, originalPrice: 920, stockQuantity: 50, sku: "DF-AJW-500", isAvailable: true },
      { id: "v_ajwa_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1450, originalPrice: 1800, stockQuantity: 30, sku: "DF-AJW-1000", isAvailable: true }
    ]
  },
  {
    id: "p_almonds",
    name: "California Whole Almonds (Almond Nut)",
    brand: "Naturale Pure",
    categoryId: "cat_dry_fruits",
    categoryName: "Dry Fruits",
    subcategoryId: "Almonds",
    subcategoryName: "Almonds",
    shortDescription: "Jumbo crisp California nonpareil almonds rich in Vitamin E.",
    description: "Our premium California almonds are carefully selected from the finest orchards. Naturally rich in protein, healthy monounsaturated fats, fiber, and antioxidant Vitamin E, these crunchy nuts offer unmatched freshness and natural buttery flavor.",
    rating: 4.9,
    reviewCount: 420,
    image: "assets/images/cat_dryfruits.jpg",
    galleryImages: [
      "assets/images/cat_dryfruits.jpg"
    ],
    origin: "California, USA",
    ingredients: "100% Pure Raw California Almonds",
    nutritionFacts: {
      "Energy": "579 kcal",
      "Protein": "21.2 g",
      "Total Fat": "49.9 g",
      "Fiber": "12.5 g",
      "Carbohydrates": "21.6 g"
    },
    storageInstructions: "Store in an airtight container in a cool, dry place away from sunlight.",
    specifications: {
      "Grade": "Extra No. 1 Jumbo",
      "Moisture": "< 6%",
      "Shelf Life": "12 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_almonds_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 120, originalPrice: 150, stockQuantity: 85, sku: "DF-ALM-100", isAvailable: true },
      { id: "v_almonds_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 280, originalPrice: 350, stockQuantity: 60, sku: "DF-ALM-250", isAvailable: true },
      { id: "v_almonds_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 540, originalPrice: 650, stockQuantity: 40, sku: "DF-ALM-500", isAvailable: true },
      { id: "v_almonds_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1050, originalPrice: 1280, stockQuantity: 25, sku: "DF-ALM-1000", isAvailable: true }
    ]
  },
  {
    id: "p_mixed_dry_fruits",
    name: "Gourmet Royal Mixed Dry Fruits Bowl",
    brand: "Naturale Gourmet",
    categoryId: "cat_dry_fruits",
    categoryName: "Dry Fruits",
    subcategoryId: "Mixed Dry Fruits",
    subcategoryName: "Mixed Dry Fruits",
    shortDescription: "Signature mix of almonds, cashews, walnuts, pistachios, dates & apricots.",
    description: "The ultimate power booster mix! Hand-curated proportions of Californian Almonds, Mangalore Cashews, Snow White Walnuts, Afghan Green Pistachios, Dried Apricots, and Royal Dates. Rich in vitamins and micro-minerals for sustained energy, brain health, and immunity.",
    rating: 4.9,
    reviewCount: 520,
    image: "assets/images/banner_discount.jpg",
    galleryImages: [
      "assets/images/banner_discount.jpg",
      "assets/images/cat_dryfruits.jpg"
    ],
    origin: "Global Selection (Handpicked in India)",
    ingredients: "Almonds (25%), Cashews (20%), Walnuts (20%), Pistachios (15%), Apricots (10%), Dates (10%)",
    nutritionFacts: {
      "Energy": "540 kcal",
      "Protein": "17.5 g",
      "Total Fat": "42.0 g",
      "Fiber": "9.5 g",
      "Carbohydrates": "26.0 g"
    },
    storageInstructions: "Store in sealed pouch or airtight glass container.",
    specifications: {
      "Processing": "Slow-roasted & unseasoned",
      "Shelf Life": "9 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isSpecialOffer: true,
    isNewArrival: false,
    variants: [
      { id: "v_mixed_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 150, originalPrice: 180, stockQuantity: 120, sku: "DF-MIX-100", isAvailable: true },
      { id: "v_mixed_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 350, originalPrice: 420, stockQuantity: 80, sku: "DF-MIX-250", isAvailable: true },
      { id: "v_mixed_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 680, originalPrice: 820, stockQuantity: 65, sku: "DF-MIX-500", isAvailable: true },
      { id: "v_mixed_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1320, originalPrice: 1600, stockQuantity: 40, sku: "DF-MIX-1000", isAvailable: true }
    ]
  },
  {
    id: "p_cashews",
    name: "Royal Mangalore Cashews (W240 Jumbo)",
    brand: "Naturale Pure",
    categoryId: "cat_dry_fruits",
    categoryName: "Dry Fruits",
    subcategoryId: "Cashews",
    subcategoryName: "Cashews",
    shortDescription: "Whole jumbo W240 cashews, velvety, creamy & naturally sweet.",
    description: "Graded W240 jumbo cashew nuts hand-processed in coastal Karnataka. Sweet, buttery crunch with zero cholesterol. Exceptional quality for daily snacking, festive gifting, or gourmet culinary creations.",
    rating: 4.8,
    reviewCount: 310,
    image: "assets/images/cat_dryfruits.jpg",
    galleryImages: [
      "assets/images/cat_dryfruits.jpg"
    ],
    origin: "Mangalore, India",
    ingredients: "100% Whole Cashew Kernels (W240)",
    nutritionFacts: {
      "Energy": "553 kcal",
      "Protein": "18.2 g",
      "Total Fat": "43.8 g",
      "Fiber": "3.3 g",
      "Carbohydrates": "30.1 g"
    },
    storageInstructions: "Store in a cool dry place in sealed glass or airtight jar.",
    specifications: {
      "Grade": "W240 Jumbo Whole",
      "Shelf Life": "9 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_cashews_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 140, originalPrice: 170, stockQuantity: 50, sku: "DF-CSH-100", isAvailable: true },
      { id: "v_cashews_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 320, originalPrice: 390, stockQuantity: 45, sku: "DF-CSH-250", isAvailable: true },
      { id: "v_cashews_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 620, originalPrice: 750, stockQuantity: 30, sku: "DF-CSH-500", isAvailable: true },
      { id: "v_cashews_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1190, originalPrice: 1450, stockQuantity: 20, sku: "DF-CSH-1000", isAvailable: true }
    ]
  },
  {
    id: "p_pistachios",
    name: "Roasted & Lightly Salted Afghan Pistachios",
    brand: "Naturale Pure",
    categoryId: "cat_dry_fruits",
    categoryName: "Dry Fruits",
    subcategoryId: "Pistachios",
    subcategoryName: "Pistachios",
    shortDescription: "Naturally opened emerald green Afghan pistachios, toasted to perfection.",
    description: "Sourced from the sun-drenched orchards of Afghanistan, these in-shell pistachios are dry roasted and lightly salted with natural rock salt. Known for their vibrant emerald hue and distinct nutty aroma.",
    rating: 4.9,
    reviewCount: 285,
    image: "assets/images/cat_dryfruits.jpg",
    galleryImages: ["assets/images/cat_dryfruits.jpg"],
    origin: "Herat, Afghanistan",
    ingredients: "Roasted In-Shell Pistachios, Himalayan Rock Salt (1%)",
    nutritionFacts: {
      "Energy": "562 kcal",
      "Protein": "20.3 g",
      "Total Fat": "45.3 g",
      "Fiber": "10.6 g",
      "Carbohydrates": "27.5 g"
    },
    storageInstructions: "Store sealed in pouch to preserve crisp shell crackle.",
    specifications: {
      "Grade": "Super Jumbo Natural Open",
      "Shelf Life": "9 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: false,
    isTrending: true,
    isSpecialOffer: false,
    isNewArrival: true,
    variants: [
      { id: "v_pista_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 160, originalPrice: 195, stockQuantity: 40, sku: "DF-PIS-100", isAvailable: true },
      { id: "v_pista_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 380, originalPrice: 460, stockQuantity: 35, sku: "DF-PIS-250", isAvailable: true },
      { id: "v_pista_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 740, originalPrice: 890, stockQuantity: 25, sku: "DF-PIS-500", isAvailable: true },
      { id: "v_pista_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1440, originalPrice: 1750, stockQuantity: 15, sku: "DF-PIS-1000", isAvailable: true }
    ]
  },
  {
    id: "p_walnuts",
    name: "Kashmir Snow White Walnut Kernels (Akhrot)",
    brand: "Naturale Pure",
    categoryId: "cat_dry_fruits",
    categoryName: "Dry Fruits",
    subcategoryId: "Walnuts",
    subcategoryName: "Walnuts",
    shortDescription: "Extra light organic halves rich in plant-based Omega-3 ALA.",
    description: "Hand-cracked raw walnut halves from high altitudes of Kashmir Valley. Crisp, bitter-free, with pearly white color. The king of nuts for brain function and cardiovascular wellness.",
    rating: 4.7,
    reviewCount: 190,
    image: "assets/images/cat_dryfruits.jpg",
    galleryImages: ["assets/images/cat_dryfruits.jpg"],
    origin: "Kashmir, India",
    ingredients: "100% Pure Raw Walnut Kernels",
    nutritionFacts: {
      "Energy": "654 kcal",
      "Protein": "15.2 g",
      "Total Fat": "65.2 g",
      "Omega-3": "9.1 g",
      "Carbohydrates": "13.7 g"
    },
    storageInstructions: "Best kept refrigerated in an airtight container.",
    specifications: {
      "Grade": "Extra Light Halves (80%+ Halves)",
      "Shelf Life": "6 Months"
    },
    allowCustomWeight: true,
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
    isSpecialOffer: true,
    isNewArrival: false,
    variants: [
      { id: "v_walnut_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 150, originalPrice: 185, stockQuantity: 60, sku: "DF-WAL-100", isAvailable: true },
      { id: "v_walnut_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 360, originalPrice: 440, stockQuantity: 50, sku: "DF-WAL-250", isAvailable: true },
      { id: "v_walnut_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 690, originalPrice: 850, stockQuantity: 30, sku: "DF-WAL-500", isAvailable: true },
      { id: "v_walnut_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1350, originalPrice: 1650, stockQuantity: 18, sku: "DF-WAL-1000", isAvailable: true }
    ]
  },
  {
    id: "p_figs",
    name: "Turkish Premium Dried Sun Figs (Anjeer)",
    brand: "Naturale Royal",
    categoryId: "cat_dry_fruits",
    categoryName: "Dry Fruits",
    subcategoryId: "Anjeer",
    subcategoryName: "Anjeer",
    shortDescription: "Plump, naturally dried Turkish Garland figs loaded with calcium & iron.",
    description: "Sun-dried natural Turkish figs strung into garlands. Juicy, fleshy, with a delightful natural seed crunch. Excellent for digestive health, bone strength, and hemoglobin maintenance.",
    rating: 4.8,
    reviewCount: 215,
    image: "assets/images/cat_dryfruits.jpg",
    galleryImages: ["assets/images/cat_dryfruits.jpg"],
    origin: "Izmir, Turkey",
    ingredients: "100% Sun-Dried Natural Figs",
    nutritionFacts: {
      "Energy": "249 kcal",
      "Protein": "3.3 g",
      "Fiber": "9.8 g",
      "Calcium": "162 mg",
      "Iron": "2.0 mg"
    },
    storageInstructions: "Store in a cool dry pantry or glass container.",
    specifications: {
      "Grade": "Size 1 Jumbo Garland",
      "Shelf Life": "12 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_fig_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 140, originalPrice: 175, stockQuantity: 70, sku: "DF-FIG-100", isAvailable: true },
      { id: "v_fig_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 340, originalPrice: 420, stockQuantity: 55, sku: "DF-FIG-250", isAvailable: true },
      { id: "v_fig_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 660, originalPrice: 800, stockQuantity: 40, sku: "DF-FIG-500", isAvailable: true },
      { id: "v_fig_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1290, originalPrice: 1550, stockQuantity: 22, sku: "DF-FIG-1000", isAvailable: true }
    ]
  },

  // WHOLE SPICES
  {
    id: "p_cardamom",
    name: "Idukki Green Cardamom (Elaichi 8mm Bold)",
    brand: "Naturale Spices",
    categoryId: "cat_whole_spices",
    categoryName: "Whole Spices",
    subcategoryId: "Green Cardamom",
    subcategoryName: "Green Cardamom",
    shortDescription: "Hand-harvested 8mm+ giant emerald green cardamom pods.",
    description: "Sourced directly from certified plantations in the mist-clad hills of Idukki, Kerala. Known as the 'Queen of Spices', each plump pod is packed with intensely aromatic, essential-oil-rich dark seeds.",
    rating: 4.9,
    reviewCount: 350,
    image: "assets/images/cat_wholespices.jpg",
    galleryImages: ["assets/images/cat_wholespices.jpg"],
    origin: "Idukki, Kerala, India",
    ingredients: "100% Whole Green Cardamom Pods",
    nutritionFacts: {
      "Energy": "311 kcal",
      "Essential Oils": "7.5% - 8.2%",
      "Iron": "13.97 mg",
      "Fiber": "28.0 g"
    },
    storageInstructions: "Store in a hermetically sealed jar to trap volatiles.",
    specifications: {
      "Size": "8mm+ Extra Bold",
      "Volatile Oil": "> 7.5%",
      "Shelf Life": "18 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_card_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 320, originalPrice: 390, stockQuantity: 50, sku: "WS-CAR-100", isAvailable: true },
      { id: "v_card_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 760, originalPrice: 920, stockQuantity: 40, sku: "WS-CAR-250", isAvailable: true },
      { id: "v_card_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 1480, originalPrice: 1800, stockQuantity: 25, sku: "WS-CAR-500", isAvailable: true },
      { id: "v_card_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 2900, originalPrice: 3500, stockQuantity: 12, sku: "WS-CAR-1000", isAvailable: true }
    ]
  },
  {
    id: "p_black_pepper",
    name: "Malabar Tellicherry Black Pepper (TGSEB)",
    brand: "Naturale Spices",
    categoryId: "cat_whole_spices",
    categoryName: "Whole Spices",
    subcategoryId: "Black Pepper",
    subcategoryName: "Black Pepper",
    shortDescription: "Tellicherry Garbled Special Extra Bold whole peppercorns.",
    description: "The world's gold standard of black pepper. Hand-selected ripe berries from the Malabar coast, dried under tropical sun. Robust, woody heat with citrusy and pine undertones.",
    rating: 4.8,
    reviewCount: 180,
    image: "assets/images/cat_wholespices.jpg",
    galleryImages: ["assets/images/cat_wholespices.jpg"],
    origin: "Malabar Coast, Kerala, India",
    ingredients: "100% Whole Tellicherry Black Peppercorns",
    nutritionFacts: {
      "Energy": "251 kcal",
      "Piperine": "5.5%",
      "Fiber": "25.3 g",
      "Calcium": "443 mg"
    },
    storageInstructions: "Store away from heat and light.",
    specifications: {
      "Grade": "TGSEB (4.75mm+ Bold)",
      "Shelf Life": "24 Months"
    },
    allowCustomWeight: true,
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_pep_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 110, originalPrice: 140, stockQuantity: 75, sku: "WS-PEP-100", isAvailable: true },
      { id: "v_pep_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 260, originalPrice: 320, stockQuantity: 60, sku: "WS-PEP-250", isAvailable: true },
      { id: "v_pep_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 500, originalPrice: 620, stockQuantity: 40, sku: "WS-PEP-500", isAvailable: true },
      { id: "v_pep_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 960, originalPrice: 1180, stockQuantity: 25, sku: "WS-PEP-1000", isAvailable: true }
    ]
  },
  {
    id: "p_cinnamon",
    name: "Royal Ceylon Cinnamon Sticks (True Cinnamon)",
    brand: "Naturale Spices",
    categoryId: "cat_whole_spices",
    categoryName: "Whole Spices",
    subcategoryId: "Cinnamon Sticks",
    subcategoryName: "Cinnamon Sticks",
    shortDescription: "Ultra-thin multi-layered Alba grade quills with low coumarin.",
    description: "Authentic 'True' Ceylon cinnamon quills from Sri Lanka. Unlike harsh cassia bark, Ceylon cinnamon is fragile, paper-thin, soft, sweet, and safe for daily therapeutic consumption.",
    rating: 4.8,
    reviewCount: 160,
    image: "assets/images/cat_wholespices.jpg",
    galleryImages: ["assets/images/cat_wholespices.jpg"],
    origin: "Southern Province, Sri Lanka",
    ingredients: "100% Pure Ceylon Cinnamon Quills",
    nutritionFacts: {
      "Energy": "247 kcal",
      "Coumarin": "< 0.004% (Trace)",
      "Calcium": "1002 mg",
      "Fiber": "53.1 g"
    },
    storageInstructions: "Store in a cool dry dark cupboard in airtight tin.",
    specifications: {
      "Grade": "Alba / C5 Special",
      "Shelf Life": "24 Months"
    },
    allowCustomWeight: true,
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_cin_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 180, originalPrice: 220, stockQuantity: 60, sku: "WS-CIN-100", isAvailable: true },
      { id: "v_cin_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 420, originalPrice: 510, stockQuantity: 45, sku: "WS-CIN-250", isAvailable: true },
      { id: "v_cin_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 810, originalPrice: 980, stockQuantity: 30, sku: "WS-CIN-500", isAvailable: true },
      { id: "v_cin_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1550, originalPrice: 1900, stockQuantity: 15, sku: "WS-CIN-1000", isAvailable: true }
    ]
  },

  // BLENDED SPICES
  {
    id: "p_garam_masala",
    name: "Royal Heritage Shahi Garam Masala",
    brand: "Naturale Heritage",
    categoryId: "cat_blended_spices",
    categoryName: "Blended Spices",
    subcategoryId: "Garam Masala",
    subcategoryName: "Garam Masala",
    shortDescription: "Artisanal stone-ground blend of 16 whole roasted royal spices.",
    description: "An authentic culinary masterpiece formulated with 16 royal spices including green cardamom, mace, nutmeg, star anise, and stone flower. Slow roasted and gently pounded to keep essential oils intact.",
    rating: 4.9,
    reviewCount: 395,
    image: "assets/images/cat_blendedspices.jpg",
    galleryImages: ["assets/images/cat_blendedspices.jpg"],
    origin: "Lucknow / Old Delhi Heritage recipe",
    ingredients: "Cardamom, Cinnamon, Cloves, Cumin, Coriander, Mace, Nutmeg, Star Anise, Bay Leaf, Black Pepper, Dagad Phool",
    nutritionFacts: {
      "Energy": "382 kcal",
      "Protein": "12.8 g",
      "Dietary Fiber": "29.4 g",
      "Iron": "18.2 mg"
    },
    storageInstructions: "Store sealed in dry opaque container.",
    specifications: {
      "Grinding": "Cold ground stone mill",
      "Artificial Flavors": "0% (None)",
      "Shelf Life": "12 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_gm_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 130, originalPrice: 160, stockQuantity: 90, sku: "BS-GM-100", isAvailable: true },
      { id: "v_gm_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 300, originalPrice: 380, stockQuantity: 65, sku: "BS-GM-250", isAvailable: true },
      { id: "v_gm_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 580, originalPrice: 720, stockQuantity: 40, sku: "BS-GM-500", isAvailable: true },
      { id: "v_gm_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1100, originalPrice: 1400, stockQuantity: 25, sku: "BS-GM-1000", isAvailable: true }
    ]
  },
  {
    id: "p_turmeric",
    name: "Organic Salem Turmeric Powder (Curcumin 4.5%)",
    brand: "Naturale Pure",
    categoryId: "cat_blended_spices",
    categoryName: "Blended Spices",
    subcategoryId: "Turmeric Powder",
    subcategoryName: "Turmeric Powder",
    shortDescription: "High-curcumin golden Salem turmeric ground from cured whole fingers.",
    description: "Sourced from Salem, Tamil Nadu, renowned for soil producing the most vibrant golden turmeric. Certified pesticide-free with laboratory-tested 4.5% natural Curcumin potency.",
    rating: 4.8,
    reviewCount: 220,
    image: "assets/images/cat_blendedspices.jpg",
    galleryImages: ["assets/images/cat_blendedspices.jpg"],
    origin: "Salem, Tamil Nadu, India",
    ingredients: "100% Pure Organic Salem Turmeric Finger Roots",
    nutritionFacts: {
      "Energy": "354 kcal",
      "Natural Curcumin": "4.5%",
      "Iron": "41.4 mg",
      "Fiber": "21.1 g"
    },
    storageInstructions: "Store away from humidity and direct sunlight.",
    specifications: {
      "Curcumin Content": "4.5% Guaranteed",
      "Color Grade": "Deep Golden Yellow",
      "Shelf Life": "18 Months"
    },
    allowCustomWeight: true,
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_tur_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 80, originalPrice: 105, stockQuantity: 110, sku: "BS-TUR-100", isAvailable: true },
      { id: "v_tur_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 180, originalPrice: 240, stockQuantity: 85, sku: "BS-TUR-250", isAvailable: true },
      { id: "v_tur_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 350, originalPrice: 460, stockQuantity: 55, sku: "BS-TUR-500", isAvailable: true },
      { id: "v_tur_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 680, originalPrice: 880, stockQuantity: 35, sku: "BS-TUR-1000", isAvailable: true }
    ]
  },

  // CEREALS & SUPERFOODS
  {
    id: "p_rolled_oats",
    name: "Gluten-Free Jumbo Rolled Oats",
    brand: "Naturale Grains",
    categoryId: "cat_cereals",
    categoryName: "Cereals",
    subcategoryId: "Rolled Oats",
    subcategoryName: "Rolled Oats",
    shortDescription: "100% whole grain rolled oats rich in beta-glucan heart fibers.",
    description: "Steamed and gently rolled whole oat groats. Packed with soluble beta-glucan fiber to support cardiovascular health, sustain energetic mornings, and provide creamy textured oatmeal or homemade granola.",
    rating: 4.8,
    reviewCount: 260,
    image: "assets/images/cat_cereals.jpg",
    galleryImages: ["assets/images/cat_cereals.jpg"],
    origin: "Australia",
    ingredients: "100% Certified Gluten-Free Whole Grain Oats",
    nutritionFacts: {
      "Energy": "389 kcal",
      "Protein": "16.9 g",
      "Total Fat": "6.9 g",
      "Fiber": "10.6 g",
      "Beta-Glucan": "4.2 g"
    },
    storageInstructions: "Keep tightly closed in cool pantry.",
    specifications: {
      "Flake Thickness": "0.75 mm",
      "Gluten Level": "< 5 ppm (Gluten Free)",
      "Shelf Life": "12 Months"
    },
    allowCustomWeight: true,
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isSpecialOffer: false,
    isNewArrival: false,
    variants: [
      { id: "v_oats_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 45, originalPrice: 60, stockQuantity: 120, sku: "CR-OAT-100", isAvailable: true },
      { id: "v_oats_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 90, originalPrice: 120, stockQuantity: 80, sku: "CR-OAT-250", isAvailable: true },
      { id: "v_oats_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 160, originalPrice: 210, stockQuantity: 60, sku: "CR-OAT-500", isAvailable: true },
      { id: "v_oats_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 290, originalPrice: 380, stockQuantity: 45, sku: "CR-OAT-1000", isAvailable: true }
    ]
  },
  {
    id: "p_quinoa",
    name: "Organic Royal White Quinoa",
    brand: "Naturale Grains",
    categoryId: "cat_cereals",
    categoryName: "Cereals",
    subcategoryId: "Quinoa",
    subcategoryName: "Quinoa",
    shortDescription: "Saponin-free pre-washed Andean supergrain with all 9 essential amino acids.",
    description: "Complete plant protein loaded with iron, magnesium, fiber and antioxidants. Pre-washed to eliminate bitterness and cooks into a fluffy, slightly nutty grain ideal for wholesome bowls and salads.",
    rating: 4.9,
    reviewCount: 145,
    image: "assets/images/cat_cereals.jpg",
    galleryImages: ["assets/images/cat_cereals.jpg"],
    origin: "Peru / Bolivia",
    ingredients: "100% Organic White Quinoa Seeds",
    nutritionFacts: {
      "Energy": "368 kcal",
      "Protein": "14.1 g",
      "Total Fat": "6.1 g",
      "Fiber": "7.0 g",
      "Iron": "4.6 mg"
    },
    storageInstructions: "Airtight container in a dry location.",
    specifications: {
      "Pre-washed": "Yes (Bitter Saponin Removed)",
      "Organic Certified": "Yes",
      "Shelf Life": "18 Months"
    },
    allowCustomWeight: true,
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isSpecialOffer: true,
    isNewArrival: true,
    variants: [
      { id: "v_qui_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 65, originalPrice: 85, stockQuantity: 80, sku: "CR-QUI-100", isAvailable: true },
      { id: "v_qui_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 140, originalPrice: 180, stockQuantity: 50, sku: "CR-QUI-250", isAvailable: true },
      { id: "v_qui_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 260, originalPrice: 340, stockQuantity: 40, sku: "CR-QUI-500", isAvailable: true },
      { id: "v_qui_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 490, originalPrice: 620, stockQuantity: 25, sku: "CR-QUI-1000", isAvailable: true }
    ]
  }
];

async function seedPostgres(poolInstance) {
  const pool = poolInstance || getPool();
  console.log('🌱 Seeding PostgreSQL database with comprehensive Dry Fruits, Spices & Cereals catalogue...');

  try {
    // 1. Seed Admin User
    const adminPassHash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO admin_users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET password_hash = $4
    `, ['usr_admin_1', 'Store Manager', 'admin@naturale.com', adminPassHash, 'SUPER_ADMIN']);

    // 2. Categories
    const categories = [
      {
        id: "cat_dry_fruits",
        name: "Dry Fruits",
        slug: "dry-fruits",
        image: "assets/images/cat_dryfruits.jpg",
        description: "Rich in essential nutrients, vitamins, and healthy fats.",
        order: 1,
        subcategories: ["Almonds", "Cashews", "Pistachios", "Walnuts", "Dates", "Raisins", "Figs", "Anjeer", "Apricots", "Mixed Dry Fruits"]
      },
      {
        id: "cat_whole_spices",
        name: "Whole Spices",
        slug: "whole-spices",
        image: "assets/images/cat_wholespices.jpg",
        description: "Aromatic, pure and hand-selected whole spices.",
        order: 2,
        subcategories: ["Green Cardamom", "Black Pepper", "Cinnamon Sticks", "Cloves", "Cumin Seeds", "Coriander Seeds", "Star Anise"]
      },
      {
        id: "cat_blended_spices",
        name: "Blended Spices",
        slug: "blended-spices",
        image: "assets/images/cat_blendedspices.jpg",
        description: "Authentic heritage spice blends ground to perfection.",
        order: 3,
        subcategories: ["Garam Masala", "Turmeric Powder", "Kashmiri Chilli", "Kitchen King", "Biryani Masala"]
      },
      {
        id: "cat_cereals",
        name: "Cereals",
        slug: "cereals",
        image: "assets/images/cat_cereals.jpg",
        description: "Nutritious whole grains, millets, oats and superfoods.",
        order: 4,
        subcategories: ["Rolled Oats", "Quinoa", "Millets", "Ragi", "Jowar", "Multigrain Mix"]
      }
    ];

    for (const cat of categories) {
      await pool.query(`
        INSERT INTO categories (id, name, slug, image, description, display_order, is_active, subcategories)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          subcategories = EXCLUDED.subcategories,
          image = EXCLUDED.image
      `, [
        cat.id,
        cat.name,
        cat.slug,
        cat.image,
        cat.description,
        cat.order,
        true,
        JSON.stringify(cat.subcategories),
      ]);
    }

    // 3. Insert / Update Products & Weight Variants
    for (const prod of COMPREHENSIVE_PRODUCTS) {
      await pool.query(`
        INSERT INTO products (
          id, name, brand, category_id, category_name, subcategory_id, subcategory_name,
          short_description, description, rating, review_count, image, gallery_images,
          origin, ingredients, nutrition_facts, storage_instructions, specifications,
          allow_custom_weight, is_featured, is_best_seller, is_trending, is_special_offer, is_new_arrival
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          image = EXCLUDED.image
      `, [
        prod.id,
        prod.name,
        prod.brand,
        prod.categoryId,
        prod.categoryName,
        prod.subcategoryId,
        prod.subcategoryName,
        prod.shortDescription,
        prod.description,
        prod.rating,
        prod.reviewCount,
        prod.image,
        JSON.stringify(prod.galleryImages || []),
        prod.origin,
        prod.ingredients,
        JSON.stringify(prod.nutritionFacts || {}),
        prod.storageInstructions,
        JSON.stringify(prod.specifications || {}),
        prod.allowCustomWeight,
        prod.isFeatured,
        prod.isBestSeller,
        prod.isTrending,
        prod.isSpecialOffer,
        prod.isNewArrival,
      ]);

      // Seed Variants
      for (const v of prod.variants) {
        await pool.query(`
          INSERT INTO product_variants (
            id, product_id, weight_in_grams, unit, title, price, original_price,
            stock_quantity, sku, min_order_quantity, max_order_quantity, is_available
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            price = EXCLUDED.price,
            original_price = EXCLUDED.original_price,
            stock_quantity = EXCLUDED.stock_quantity
        `, [
          v.id,
          prod.id,
          v.weightInGrams,
          v.unit,
          v.title,
          v.price,
          v.originalPrice,
          v.stockQuantity,
          v.sku,
          1,
          20,
          true,
        ]);
      }
    }

    // 4. Save to fallback json as well (strictly clean orders & customers)
    const fallbackPath = path.join(__dirname, '..', 'data', 'db.json');
    let fbData = { categories, products: COMPREHENSIVE_PRODUCTS, orders: [], customers: [], coupons: [], banners: [], settings: {} };
    try {
      if (fs.existsSync(fallbackPath)) {
        const existing = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        fbData = {
          ...existing,
          categories,
          products: COMPREHENSIVE_PRODUCTS,
          orders: Array.isArray(existing.orders) ? existing.orders : [],
          customers: Array.isArray(existing.customers) ? existing.customers : [],
        };
      }
      fs.writeFileSync(fallbackPath, JSON.stringify(fbData, null, 2), 'utf8');
    } catch (_) {}

    console.log(`✅ PostgreSQL Database successfully populated with ${COMPREHENSIVE_PRODUCTS.length} products and all weight variants!`);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  }
}

if (require.main === module) {
  seedPostgres().then(() => process.exit(0));
}

module.exports = { seedPostgres, COMPREHENSIVE_PRODUCTS };
