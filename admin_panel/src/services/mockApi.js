import axios from 'axios';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL)
  ? (import.meta.env.VITE_API_URL.startsWith('http')
      ? `${import.meta.env.VITE_API_URL}/api`
      : `https://${import.meta.env.VITE_API_URL}/api`)
  : 'https://dryfruits-api.onrender.com/api';

// Authentic Store Data (Strictly Categories & Products only - ZERO Mock Orders / Mock Revenue)
const INITIAL_DB = {
  categories: [
    {
      id: "cat_dry_fruits",
      name: "Dry Fruits",
      slug: "dry-fruits",
      image: "/assets/images/cat_dryfruits.jpg",
      description: "Rich in essential nutrients, vitamins, and healthy fats.",
      order: 1,
      isActive: true,
      subcategories: ["Almonds", "Cashews", "Pistachios", "Walnuts", "Dates", "Raisins", "Figs", "Anjeer", "Apricots", "Mixed Dry Fruits"]
    },
    {
      id: "cat_whole_spices",
      name: "Whole Spices",
      slug: "whole-spices",
      image: "/assets/images/cat_wholespices.jpg",
      description: "Aromatic, pure and hand-selected whole spices.",
      order: 2,
      isActive: true,
      subcategories: ["Green Cardamom", "Black Pepper", "Cinnamon Sticks", "Cloves", "Cumin Seeds", "Coriander Seeds", "Star Anise"]
    },
    {
      id: "cat_blended_spices",
      name: "Blended Spices",
      slug: "blended-spices",
      image: "/assets/images/cat_blendedspices.jpg",
      description: "Authentic heritage spice blends ground to perfection.",
      order: 3,
      isActive: true,
      subcategories: ["Garam Masala", "Turmeric Powder", "Kashmiri Chilli", "Kitchen King", "Biryani Masala"]
    },
    {
      id: "cat_cereals",
      name: "Cereals",
      slug: "cereals",
      image: "/assets/images/cat_cereals.jpg",
      description: "Nutritious whole grains, millets, oats and superfoods.",
      order: 4,
      isActive: true,
      subcategories: ["Rolled Oats", "Quinoa", "Millets", "Ragi", "Jowar", "Multigrain Mix"]
    }
  ],
  products: [
    {
      id: "p_ajwa_dates",
      name: "Saudi Royal Ajwa Dates (Ajwa Khejur)",
      brand: "Naturale Royal",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Dates",
      subcategoryName: "Dates",
      shortDescription: "Soft, dark, luscious sacred Ajwa dates from Madinah.",
      description: "Authentic Saudi Arabian Royal Ajwa dates carefully sun-ripened in Madinah orchards.",
      rating: 4.9,
      reviewCount: 380,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "Al-Madinah, Saudi Arabia",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
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
      shortDescription: "Jumbo California almonds, crisp & rich in Vitamin E.",
      description: "Our premium California almonds are carefully selected from the finest orchards.",
      rating: 4.9,
      reviewCount: 420,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "California, USA",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_almonds_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 120, originalPrice: 150, stockQuantity: 85, sku: "DF-ALM-100", isAvailable: true },
        { id: "v_almonds_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 280, originalPrice: 350, stockQuantity: 60, sku: "DF-ALM-250", isAvailable: true },
        { id: "v_almonds_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 540, originalPrice: 650, stockQuantity: 40, sku: "DF-ALM-500", isAvailable: true },
        { id: "v_almonds_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1050, originalPrice: 1280, stockQuantity: 25, sku: "DF-ALM-1000", isAvailable: true }
      ]
    },
    {
      id: "p_almonds_mamra",
      name: "Iranian Mamra Almonds",
      brand: "Naturale Royal",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Almonds",
      subcategoryName: "Almonds",
      shortDescription: "100% authentic Mamra almonds with exceptional natural oil content.",
      description: "Prized worldwide for their distinctive curved boat shape and high natural almond oil content.",
      rating: 4.95,
      reviewCount: 380,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "Iran",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_mamra_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 260, originalPrice: 320, stockQuantity: 60, sku: "DF-MMR-100", isAvailable: true },
        { id: "v_mamra_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 620, originalPrice: 750, stockQuantity: 45, sku: "DF-MMR-250", isAvailable: true },
        { id: "v_mamra_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 1180, originalPrice: 1450, stockQuantity: 30, sku: "DF-MMR-500", isAvailable: true },
        { id: "v_mamra_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 2250, originalPrice: 2800, stockQuantity: 15, sku: "DF-MMR-1000", isAvailable: true }
      ]
    },
    {
      id: "p_almonds_gurbandi",
      name: "Gurbandi Almonds (Chhoti Giri)",
      brand: "Naturale Pure",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Almonds",
      subcategoryName: "Almonds",
      shortDescription: "High-energy Afghan Gurbandi almonds packed with natural nutrients.",
      description: "Small in size yet remarkably potent in natural oils and antioxidants.",
      rating: 4.85,
      reviewCount: 210,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "Afghanistan",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: false,
      variants: [
        { id: "v_gurbandi_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 180, originalPrice: 220, stockQuantity: 70, sku: "DF-GRB-100", isAvailable: true },
        { id: "v_gurbandi_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 420, originalPrice: 520, stockQuantity: 50, sku: "DF-GRB-250", isAvailable: true },
        { id: "v_gurbandi_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 800, originalPrice: 990, stockQuantity: 35, sku: "DF-GRB-500", isAvailable: true },
        { id: "v_gurbandi_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1550, originalPrice: 1900, stockQuantity: 20, sku: "DF-GRB-1000", isAvailable: true }
      ]
    },
    {
      id: "p_almonds_regular",
      name: "Regular Almonds",
      brand: "Naturale Daily",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Almonds",
      subcategoryName: "Almonds",
      shortDescription: "Affordable, crunchy wholesome everyday almonds.",
      description: "Carefully sorted whole almonds ideal for daily soaking, milk shakes, homemade almond butter.",
      rating: 4.75,
      reviewCount: 165,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "India",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: false,
      variants: [
        { id: "v_reg_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 100, originalPrice: 130, stockQuantity: 120, sku: "DF-REG-100", isAvailable: true },
        { id: "v_reg_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 240, originalPrice: 300, stockQuantity: 80, sku: "DF-REG-250", isAvailable: true },
        { id: "v_reg_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 460, originalPrice: 580, stockQuantity: 60, sku: "DF-REG-500", isAvailable: true },
        { id: "v_reg_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 890, originalPrice: 1100, stockQuantity: 40, sku: "DF-REG-1000", isAvailable: true }
      ]
    },
    {
      id: "p_almonds_roasted",
      name: "Premium Roasted Almonds",
      brand: "Naturale Gourmet",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Almonds",
      subcategoryName: "Almonds",
      shortDescription: "Slow dry-roasted to golden crunch without added oil.",
      description: "Freshly roasted whole almonds with an aromatic, deep toasted nutty aroma.",
      rating: 4.9,
      reviewCount: 290,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "California, USA",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: true,
      variants: [
        { id: "v_roast_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 140, originalPrice: 175, stockQuantity: 90, sku: "DF-RST-100", isAvailable: true },
        { id: "v_roast_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 320, originalPrice: 400, stockQuantity: 65, sku: "DF-RST-250", isAvailable: true },
        { id: "v_roast_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 620, originalPrice: 760, stockQuantity: 40, sku: "DF-RST-500", isAvailable: true },
        { id: "v_roast_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1190, originalPrice: 1450, stockQuantity: 25, sku: "DF-RST-1000", isAvailable: true }
      ]
    },
    {
      id: "p_almonds_salted",
      name: "Salted Almonds",
      brand: "Naturale Gourmet",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Almonds",
      subcategoryName: "Almonds",
      shortDescription: "Roasted almonds lightly dusted with pure Himalayan pink salt.",
      description: "Crispy roasted whole almonds seasoned with a balanced touch of fine Himalayan pink rock salt.",
      rating: 4.88,
      reviewCount: 240,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "California, USA",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: true,
      variants: [
        { id: "v_salt_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 150, originalPrice: 185, stockQuantity: 85, sku: "DF-SLT-100", isAvailable: true },
        { id: "v_salt_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 340, originalPrice: 420, stockQuantity: 60, sku: "DF-SLT-250", isAvailable: true },
        { id: "v_salt_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 650, originalPrice: 800, stockQuantity: 40, sku: "DF-SLT-500", isAvailable: true },
        { id: "v_salt_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1250, originalPrice: 1550, stockQuantity: 20, sku: "DF-SLT-1000", isAvailable: true }
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
      description: "The ultimate power booster mix with almonds, cashews, walnuts, pistachios, apricots, and dates.",
      rating: 4.9,
      reviewCount: 520,
      image: "/assets/images/banner_discount.jpg",
      origin: "Global Selection",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
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
      shortDescription: "Whole jumbo W240 cashews, velvety, creamy & sweet.",
      description: "Graded W240 jumbo cashew nuts hand-processed in Karnataka.",
      rating: 4.8,
      reviewCount: 310,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "Mangalore, India",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
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
      description: "Sourced from the sun-drenched orchards of Afghanistan.",
      rating: 4.9,
      reviewCount: 285,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "Herat, Afghanistan",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: false,
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
      description: "Hand-cracked raw walnut halves from high altitudes of Kashmir Valley.",
      rating: 4.7,
      reviewCount: 190,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "Kashmir, India",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: false,
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
      description: "Sun-dried natural Turkish figs strung into garlands.",
      rating: 4.8,
      reviewCount: 215,
      image: "/assets/images/cat_dryfruits.jpg",
      origin: "Izmir, Turkey",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_fig_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 140, originalPrice: 175, stockQuantity: 70, sku: "DF-FIG-100", isAvailable: true },
        { id: "v_fig_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 340, originalPrice: 420, stockQuantity: 55, sku: "DF-FIG-250", isAvailable: true },
        { id: "v_fig_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 660, originalPrice: 800, stockQuantity: 40, sku: "DF-FIG-500", isAvailable: true },
        { id: "v_fig_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1290, originalPrice: 1550, stockQuantity: 22, sku: "DF-FIG-1000", isAvailable: true }
      ]
    },
    {
      id: "p_cardamom",
      name: "Idukki Green Cardamom (Elaichi 8mm Bold)",
      brand: "Naturale Spices",
      categoryId: "cat_whole_spices",
      categoryName: "Whole Spices",
      subcategoryId: "Green Cardamom",
      subcategoryName: "Green Cardamom",
      shortDescription: "Hand-harvested 8mm+ giant emerald green cardamom pods.",
      description: "Directly sourced from mist-clad hills of Idukki, Kerala.",
      rating: 4.9,
      reviewCount: 350,
      image: "/assets/images/cat_wholespices.jpg",
      origin: "Idukki, Kerala, India",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
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
      description: "The gold standard of black pepper hand-selected from the Malabar coast.",
      rating: 4.8,
      reviewCount: 180,
      image: "/assets/images/cat_wholespices.jpg",
      origin: "Malabar Coast, Kerala, India",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: true,
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
      description: "Authentic True Ceylon cinnamon quills from Sri Lanka.",
      rating: 4.8,
      reviewCount: 160,
      image: "/assets/images/cat_wholespices.jpg",
      origin: "Southern Province, Sri Lanka",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: false,
      variants: [
        { id: "v_cin_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 180, originalPrice: 220, stockQuantity: 60, sku: "WS-CIN-100", isAvailable: true },
        { id: "v_cin_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 420, originalPrice: 510, stockQuantity: 45, sku: "WS-CIN-250", isAvailable: true },
        { id: "v_cin_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 810, originalPrice: 980, stockQuantity: 30, sku: "WS-CIN-500", isAvailable: true },
        { id: "v_cin_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1550, originalPrice: 1900, stockQuantity: 15, sku: "WS-CIN-1000", isAvailable: true }
      ]
    },
    {
      id: "p_garam_masala",
      name: "Royal Heritage Shahi Garam Masala",
      brand: "Naturale Heritage",
      categoryId: "cat_blended_spices",
      categoryName: "Blended Spices",
      subcategoryId: "Garam Masala",
      subcategoryName: "Garam Masala",
      shortDescription: "Artisanal stone-ground blend of 16 whole roasted royal spices.",
      description: "Authentic culinary blend formulated with 16 royal spices.",
      rating: 4.9,
      reviewCount: 395,
      image: "/assets/images/cat_blendedspices.jpg",
      origin: "Lucknow Heritage recipe",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
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
      description: "Certified pesticide-free golden turmeric with 4.5% natural Curcumin potency.",
      rating: 4.8,
      reviewCount: 220,
      image: "/assets/images/cat_blendedspices.jpg",
      origin: "Salem, Tamil Nadu, India",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: true,
      variants: [
        { id: "v_tur_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 80, originalPrice: 105, stockQuantity: 110, sku: "BS-TUR-100", isAvailable: true },
        { id: "v_tur_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 180, originalPrice: 240, stockQuantity: 85, sku: "BS-TUR-250", isAvailable: true },
        { id: "v_tur_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 350, originalPrice: 460, stockQuantity: 55, sku: "BS-TUR-500", isAvailable: true },
        { id: "v_tur_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 680, originalPrice: 880, stockQuantity: 35, sku: "BS-TUR-1000", isAvailable: true }
      ]
    },
    {
      id: "p_rolled_oats",
      name: "Gluten-Free Jumbo Rolled Oats",
      brand: "Naturale Grains",
      categoryId: "cat_cereals",
      categoryName: "Cereals",
      subcategoryId: "Rolled Oats",
      subcategoryName: "Rolled Oats",
      shortDescription: "100% whole grain rolled oats rich in beta-glucan heart fibers.",
      description: "Steamed and gently rolled whole oat groats packed with soluble beta-glucan.",
      rating: 4.8,
      reviewCount: 260,
      image: "/assets/images/cat_cereals.jpg",
      origin: "Australia",
      allowCustomWeight: true,
      isFeatured: true,
      isBestSeller: true,
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
      description: "Complete plant protein loaded with iron, magnesium, fiber and antioxidants.",
      rating: 4.9,
      reviewCount: 145,
      image: "/assets/images/cat_cereals.jpg",
      origin: "Peru / Bolivia",
      allowCustomWeight: true,
      isFeatured: false,
      isBestSeller: false,
      variants: [
        { id: "v_qui_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 65, originalPrice: 85, stockQuantity: 80, sku: "CR-QUI-100", isAvailable: true },
        { id: "v_qui_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 140, originalPrice: 180, stockQuantity: 50, sku: "CR-QUI-250", isAvailable: true },
        { id: "v_qui_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 260, originalPrice: 340, stockQuantity: 40, sku: "CR-QUI-500", isAvailable: true },
        { id: "v_qui_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 490, originalPrice: 620, stockQuantity: 25, sku: "CR-QUI-1000", isAvailable: true }
      ]
    }
  ],
  // STRICTLY NO MOCK ORDERS OR MOCK CUSTOMERS
  orders: [],
  customers: [],
  coupons: [
    { id: "cpn_1", code: "WELCOME20", description: "20% off on your first order above ₹500", discountType: "percentage", discountValue: 20, minOrderValue: 500, maxDiscount: 300, expiryDate: "2026-12-31", isActive: true },
    { id: "cpn_2", code: "NATURALE100", description: "Flat ₹100 instant discount on orders above ₹800", discountType: "fixed", discountValue: 100, minOrderValue: 800, maxDiscount: 100, expiryDate: "2026-12-31", isActive: true }
  ],
  banners: [
    { id: "bnr_1", title: "20% Discount", subtitle: "Premium Dry Fruits Collection", image: "/assets/banners/banner_discount.jpg", ctaText: "Shop Collection", targetCategory: "cat_dry_fruits", isActive: true },
    { id: "bnr_2", title: "Authentic Spices", subtitle: "Discover Our Best Sellers", image: "/assets/banners/banner_collection.jpg", ctaText: "Explore Flavours", targetCategory: "cat_whole_spices", isActive: true },
    { id: "bnr_3", title: "Healthy Grains", subtitle: "Nutritious Cereals & Millets", image: "/assets/banners/banner_cereals.jpg", ctaText: "Discover Cereals", targetCategory: "cat_cereals", isActive: true }
  ],
  settings: {
    storeName: "Naturale - Premium Dry Fruits & Spices",
    contactEmail: "care@naturale.com",
    contactPhone: "+91 800-NATURALE",
    currencySymbol: "₹",
    standardDeliveryFee: 40,
    freeDeliveryThreshold: 500,
    minimumOrderValue: 150,
    lowStockThreshold: 15
  }
};

// Clean local storage helper (strictly no mock orders/customers)
function getLocalDb() {
  localStorage.removeItem('naturale_admin_db');
  localStorage.removeItem('naturale_admin_db_v2');
  const data = localStorage.getItem('naturale_admin_db_v3');
  if (!data) {
    localStorage.setItem('naturale_admin_db_v3', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  try {
    const parsed = JSON.parse(data);
    parsed.orders = [];
    parsed.customers = [];
    return parsed;
  } catch {
    return INITIAL_DB;
  }
}

function saveLocalDb(db) {
  db.orders = [];
  db.customers = [];
  localStorage.setItem('naturale_admin_db_v3', JSON.stringify(db));
}

// API methods
export const mockApi = {
  // Auth
  async login(email, password) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password }, { timeout: 6000 });
      return res.data;
    } catch {
      if (email === 'admin@naturale.com' && password === 'admin123') {
        return {
          token: 'demo_token_admin_2026',
          user: { name: 'Store Manager', email: 'admin@naturale.com', role: 'SUPER_ADMIN' }
        };
      }
      throw new Error('Invalid credentials. Use admin@naturale.com / admin123');
    }
  },

  // Fast Synchronous Getters (0ms Instant Load)
  getProductsSync() {
    return getLocalDb().products || [];
  },

  getCategoriesSync() {
    return getLocalDb().categories || [];
  },

  getOrdersSync() {
    return getLocalDb().orders || [];
  },

  getCustomersSync() {
    return getLocalDb().customers || [];
  },

  getCouponsSync() {
    return getLocalDb().coupons || [];
  },

  getBannersSync() {
    return getLocalDb().banners || [];
  },

  getSettingsSync() {
    return getLocalDb().settings || {};
  },

  // Products
  async getProducts() {
    const db = getLocalDb();
    try {
      const res = await axios.get(`${API_BASE}/products`, { timeout: 2500 });
      const products = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (products.length > 0) {
        db.products = products;
        saveLocalDb(db);
        return products;
      }
    } catch (_) {}
    return db.products || [];
  },

  async createProduct(productData) {
    const db = getLocalDb();
    const newProduct = {
      id: `p_${Date.now()}`,
      rating: 4.8,
      reviewCount: 0,
      variants: productData.variants || [],
      ...productData
    };
    db.products.push(newProduct);
    saveLocalDb(db);

    try {
      const res = await axios.post(`${API_BASE}/products`, productData, { timeout: 3500 });
      if (res.data?.id) {
        const idx = db.products.findIndex(p => p.id === newProduct.id);
        if (idx !== -1) {
          db.products[idx] = res.data;
          saveLocalDb(db);
        }
        return res.data;
      }
    } catch (_) {}
    return newProduct;
  },

  async updateProduct(id, productData) {
    const db = getLocalDb();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...productData };
      saveLocalDb(db);
    }

    try {
      const res = await axios.put(`${API_BASE}/products/${id}`, productData, { timeout: 3500 });
      if (res.data) {
        if (idx !== -1) {
          db.products[idx] = { ...db.products[idx], ...res.data };
          saveLocalDb(db);
        }
        return res.data;
      }
    } catch (_) {}

    return idx !== -1 ? db.products[idx] : productData;
  },

  async deleteProduct(id) {
    const db = getLocalDb();
    db.products = db.products.filter(p => p.id !== id);
    saveLocalDb(db);

    try {
      await axios.delete(`${API_BASE}/products/${id}`, { timeout: 3500 });
    } catch (_) {}
    return true;
  },

  // Weight Variants
  async updateVariant(productId, variantId, variantData) {
    const db = getLocalDb();
    const prod = db.products.find(p => p.id === productId);
    let updatedV = variantData;
    if (prod) {
      const vIdx = prod.variants.findIndex(v => v.id === variantId);
      if (vIdx !== -1) {
        prod.variants[vIdx] = { ...prod.variants[vIdx], ...variantData };
        saveLocalDb(db);
        updatedV = prod.variants[vIdx];
      }
    }

    try {
      const res = await axios.put(`${API_BASE}/products/${productId}/variants/${variantId}`, variantData, { timeout: 3500 });
      return res.data || updatedV;
    } catch (_) {}

    return updatedV;
  },

  async addVariant(productId, variantData) {
    const db = getLocalDb();
    const prod = db.products.find(p => p.id === productId);
    const newV = { id: `v_${Date.now()}`, isAvailable: true, ...variantData };
    if (prod) {
      prod.variants.push(newV);
      saveLocalDb(db);
    }

    try {
      const res = await axios.post(`${API_BASE}/products/${productId}/variants`, variantData, { timeout: 3500 });
      return res.data || newV;
    } catch (_) {}

    return newV;
  },

  async deleteVariant(productId, variantId) {
    const db = getLocalDb();
    const prod = db.products.find(p => p.id === productId);
    if (prod) {
      prod.variants = prod.variants.filter(v => v.id !== variantId);
      saveLocalDb(db);
    }

    try {
      await axios.delete(`${API_BASE}/products/${productId}/variants/${variantId}`, { timeout: 3500 });
    } catch (_) {}
    return true;
  },

  // Categories
  async getCategories() {
    const db = getLocalDb();
    try {
      const res = await axios.get(`${API_BASE}/categories`, { timeout: 2500 });
      const categories = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (categories.length > 0) {
        db.categories = categories;
        saveLocalDb(db);
        return categories;
      }
    } catch (_) {}
    return db.categories || [];
  },

  async createCategory(catData) {
    const db = getLocalDb();
    const newCat = {
      id: `cat_${Date.now()}`,
      isActive: true,
      subcategories: [],
      ...catData
    };
    db.categories.push(newCat);
    saveLocalDb(db);

    try {
      const res = await axios.post(`${API_BASE}/categories`, catData, { timeout: 3500 });
      if (res.data?.id) {
        const idx = db.categories.findIndex(c => c.id === newCat.id);
        if (idx !== -1) {
          db.categories[idx] = res.data;
          saveLocalDb(db);
        }
        return res.data;
      }
    } catch (_) {}
    return newCat;
  },

  async updateCategory(id, catData) {
    const db = getLocalDb();
    const idx = db.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.categories[idx] = { ...db.categories[idx], ...catData };
      saveLocalDb(db);
    }

    try {
      const res = await axios.put(`${API_BASE}/categories/${id}`, catData, { timeout: 3500 });
      if (res.data) {
        if (idx !== -1) {
          db.categories[idx] = { ...db.categories[idx], ...res.data };
          saveLocalDb(db);
        }
        return res.data;
      }
    } catch (_) {}

    return idx !== -1 ? db.categories[idx] : catData;
  },

  async deleteCategory(id) {
    const db = getLocalDb();
    db.categories = db.categories.filter(c => c.id !== id);
    saveLocalDb(db);

    try {
      await axios.delete(`${API_BASE}/categories/${id}`, { timeout: 3500 });
    } catch (_) {}
    return true;
  },

  async bulkImportCategories(categoryList, replaceExisting = false) {
    const db = getLocalDb();
    if (!db.categories) db.categories = [];

    const now = Date.now();
    const imported = [];

    if (replaceExisting) {
      db.categories = [];
    }

    categoryList.forEach((cat, i) => {
      const existingIdx = db.categories.findIndex(
        c => c.name.toLowerCase() === cat.name.toLowerCase() || (cat.slug && c.slug === cat.slug)
      );

      if (existingIdx !== -1 && !replaceExisting) {
        const mergedSubcategories = Array.from(
          new Set([...(db.categories[existingIdx].subcategories || []), ...(cat.subcategories || [])])
        );
        db.categories[existingIdx] = {
          ...db.categories[existingIdx],
          ...cat,
          subcategories: mergedSubcategories,
        };
        imported.push(db.categories[existingIdx]);
      } else {
        const newCat = {
          id: cat.id || `cat_${now}_${i}`,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          subcategories: cat.subcategories || [],
          order: cat.order || (db.categories.length + 1),
          image: cat.image || '/assets/images/cat_dryfruits.jpg',
          ...cat,
        };
        db.categories.push(newCat);
        imported.push(newCat);
      }
    });

    saveLocalDb(db);

    try {
      await axios.post(`${API_BASE}/categories/bulk`, { categories: imported }, { timeout: 3500 });
    } catch (_) {}

    return imported;
  },

  // Orders
  async getOrders() {
    try {
      const res = await axios.get(`${API_BASE}/orders`, { timeout: 2500 });
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    } catch {
      return [];
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const res = await axios.patch(`${API_BASE}/orders/${id}/status`, { status }, { timeout: 3500 });
      return res.data;
    } catch {
      return { id, status };
    }
  },

  // Customers
  async getCustomers() {
    try {
      const res = await axios.get(`${API_BASE}/customers`, { timeout: 2500 });
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    } catch {
      return [];
    }
  },

  // Coupons
  async getCoupons() {
    const db = getLocalDb();
    try {
      const res = await axios.get(`${API_BASE}/coupons`, { timeout: 2500 });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (list.length > 0) return list;
    } catch (_) {}
    return db.coupons || [];
  },

  async createCoupon(data) {
    const db = getLocalDb();
    const newC = { id: `cpn_${Date.now()}`, isActive: true, ...data };
    db.coupons.push(newC);
    saveLocalDb(db);
    return newC;
  },

  async deleteCoupon(id) {
    const db = getLocalDb();
    db.coupons = db.coupons.filter(c => c.id !== id);
    saveLocalDb(db);
    return true;
  },

  // Banners
  async getBanners() {
    const db = getLocalDb();
    try {
      const res = await axios.get(`${API_BASE}/banners`, { timeout: 2500 });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (list.length > 0) return list;
    } catch (_) {}
    return db.banners || [];
  },

  async createBanner(data) {
    const db = getLocalDb();
    const newB = { id: `bnr_${Date.now()}`, isActive: true, ...data };
    db.banners.push(newB);
    saveLocalDb(db);
    return newB;
  },

  async deleteBanner(id) {
    const db = getLocalDb();
    db.banners = db.banners.filter(b => b.id !== id);
    saveLocalDb(db);
    return true;
  },

  // Settings
  async getSettings() {
    const db = getLocalDb();
    try {
      const res = await axios.get(`${API_BASE}/settings`, { timeout: 2500 });
      if (res.data) return res.data;
    } catch (_) {}
    return db.settings || {};
  },

  async updateSettings(data) {
    const db = getLocalDb();
    db.settings = { ...db.settings, ...data };
    saveLocalDb(db);
    return db.settings;
  },

  // Instant Synchronous Dashboard Calculation (0ms)
  getDashboardMetricsSync() {
    const db = getLocalDb();
    const products = db.products || [];
    const categories = db.categories || [];
    const orders = db.orders || [];
    const customers = db.customers || [];

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

    let lowStockCount = 0;
    products.forEach(p => {
      (p.variants || []).forEach(v => {
        if (v.stockQuantity <= 15) lowStockCount++;
      });
    });

    const categoryCounts = {};
    categories.forEach(c => { categoryCounts[c.name] = 0; });
    products.forEach(p => {
      if (categoryCounts[p.categoryName] !== undefined) {
        categoryCounts[p.categoryName]++;
      }
    });

    const catColors = {
      'Dry Fruits': '#FF812E',
      'Whole Spices': '#FFA45B',
      'Blended Spices': '#27865F',
      'Cereals': '#898078'
    };

    const categorySales = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: count,
      color: catColors[name] || '#FF812E'
    }));

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      pendingOrders,
      lowStockCount,
      recentOrders: orders.slice(0, 5),
      salesData: [],
      categorySales
    };
  },

  // Real Dashboard Aggregates with fast fallback
  async getDashboardMetrics() {
    const local = this.getDashboardMetricsSync();
    try {
      const res = await axios.get(`${API_BASE}/dashboard/metrics`, { timeout: 2500 });
      if (res.data && res.data.totalProducts !== undefined) {
        return res.data;
      }
    } catch (_) {}
    return local;
  }
};
