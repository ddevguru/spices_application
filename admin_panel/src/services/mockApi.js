import axios from 'axios';

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL)
  ? (process.env.NEXT_PUBLIC_API_URL.startsWith('http')
      ? `${process.env.NEXT_PUBLIC_API_URL}/api`
      : `https://${process.env.NEXT_PUBLIC_API_URL}/api`)
  : (typeof window !== 'undefined' && window.__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL)
      ? `${window.__NEXT_DATA__.env.NEXT_PUBLIC_API_URL}/api`
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
    "id": "p_almonds_1",
    "name": "California Whole Almonds (Badam Giri)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Almonds",
    "subcategoryName": "Almonds",
    "shortDescription": "Crisp jumbo California almonds rich in Vitamin E and healthy omega fats.",
    "description": "Crisp jumbo California almonds rich in Vitamin E and healthy omega fats. Sourced directly from renowned growers in California, USA, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "California, USA",
    "sku": "DF-ALM-101",
    "barcode": "890700100000",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_almonds_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 123,
        "originalPrice": 154,
        "stockQuantity": 65,
        "sku": "DF-ALM-101-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_almonds_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 280,
        "originalPrice": 342,
        "stockQuantity": 50,
        "sku": "DF-ALM-101-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_almonds_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 532,
        "originalPrice": 638,
        "stockQuantity": 40,
        "sku": "DF-ALM-101-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_almonds_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1022,
        "originalPrice": 1206,
        "stockQuantity": 25,
        "sku": "DF-ALM-101-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_almonds_2",
    "name": "Iranian Mamra Almonds",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Almonds",
    "subcategoryName": "Almonds",
    "shortDescription": "100% authentic boat-shaped Mamra almonds with superior natural almond oil.",
    "description": "100% authentic boat-shaped Mamra almonds with superior natural almond oil. Sourced directly from renowned growers in Iran, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Iran",
    "sku": "DF-ALM-102",
    "barcode": "890700100001",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_almonds_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 286,
        "originalPrice": 358,
        "stockQuantity": 65,
        "sku": "DF-ALM-102-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_almonds_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 650,
        "originalPrice": 793,
        "stockQuantity": 50,
        "sku": "DF-ALM-102-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_almonds_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 1235,
        "originalPrice": 1482,
        "stockQuantity": 40,
        "sku": "DF-ALM-102-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_almonds_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 2373,
        "originalPrice": 2800,
        "stockQuantity": 25,
        "sku": "DF-ALM-102-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_almonds_3",
    "name": "Afghan Gurbandi Almonds",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Almonds",
    "subcategoryName": "Almonds",
    "shortDescription": "Small-sized nutrient-dense Afghan Gurbandi badam, perfect for memory and health.",
    "description": "Small-sized nutrient-dense Afghan Gurbandi badam, perfect for memory and health. Sourced directly from renowned growers in Afghanistan, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Afghanistan",
    "sku": "DF-ALM-103",
    "barcode": "890700100002",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_almonds_3_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 167,
        "originalPrice": 209,
        "stockQuantity": 65,
        "sku": "DF-ALM-103-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_almonds_3_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 380,
        "originalPrice": 464,
        "stockQuantity": 50,
        "sku": "DF-ALM-103-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_almonds_3_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 722,
        "originalPrice": 866,
        "stockQuantity": 40,
        "sku": "DF-ALM-103-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_almonds_3_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1387,
        "originalPrice": 1637,
        "stockQuantity": 25,
        "sku": "DF-ALM-103-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_almonds_4",
    "name": "Roasted & Lightly Salted Almonds",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Almonds",
    "subcategoryName": "Almonds",
    "shortDescription": "Crunchy dry-roasted almonds seasoned with Himalayan pink rock salt.",
    "description": "Crunchy dry-roasted almonds seasoned with Himalayan pink rock salt. Sourced directly from renowned growers in California, USA, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 159,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "California, USA",
    "sku": "DF-ALM-104",
    "barcode": "890700100003",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_almonds_4_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 141,
        "originalPrice": 176,
        "stockQuantity": 65,
        "sku": "DF-ALM-104-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_almonds_4_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 320,
        "originalPrice": 390,
        "stockQuantity": 50,
        "sku": "DF-ALM-104-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_almonds_4_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 608,
        "originalPrice": 730,
        "stockQuantity": 40,
        "sku": "DF-ALM-104-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_almonds_4_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1168,
        "originalPrice": 1378,
        "stockQuantity": 25,
        "sku": "DF-ALM-104-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cashews_1",
    "name": "Goa Premium Cashews (Kaju W320)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Cashews",
    "subcategoryName": "Cashews",
    "shortDescription": "Whole pristine white W320 cashew nuts from coastal Goan orchards.",
    "description": "Whole pristine white W320 cashew nuts from coastal Goan orchards. Sourced directly from renowned growers in Goa, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Goa, India",
    "sku": "DF-CAS-105",
    "barcode": "890700100004",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cashews_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 136,
        "originalPrice": 170,
        "stockQuantity": 65,
        "sku": "DF-CAS-105-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cashews_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 310,
        "originalPrice": 378,
        "stockQuantity": 50,
        "sku": "DF-CAS-105-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cashews_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 589,
        "originalPrice": 707,
        "stockQuantity": 40,
        "sku": "DF-CAS-105-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cashews_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1132,
        "originalPrice": 1336,
        "stockQuantity": 25,
        "sku": "DF-CAS-105-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cashews_2",
    "name": "Royal Jumbo Cashews (Kaju W240)",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Cashews",
    "subcategoryName": "Cashews",
    "shortDescription": "Extra jumbo W240 whole cashew kernels, sweet and rich buttery flavor.",
    "description": "Extra jumbo W240 whole cashew kernels, sweet and rich buttery flavor. Sourced directly from renowned growers in Mangalore, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Mangalore, India",
    "sku": "DF-CAS-106",
    "barcode": "890700100005",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cashews_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 172,
        "originalPrice": 215,
        "stockQuantity": 65,
        "sku": "DF-CAS-106-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cashews_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 390,
        "originalPrice": 476,
        "stockQuantity": 50,
        "sku": "DF-CAS-106-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cashews_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 741,
        "originalPrice": 889,
        "stockQuantity": 40,
        "sku": "DF-CAS-106-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cashews_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1424,
        "originalPrice": 1680,
        "stockQuantity": 25,
        "sku": "DF-CAS-106-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cashews_3",
    "name": "Spicy Masala Roasted Cashews",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Cashews",
    "subcategoryName": "Cashews",
    "shortDescription": "Crispy roasted cashews coated with tangy chaat masala and black pepper.",
    "description": "Crispy roasted cashews coated with tangy chaat masala and black pepper. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "India",
    "sku": "DF-CAS-107",
    "barcode": "890700100006",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cashews_3_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 154,
        "originalPrice": 193,
        "stockQuantity": 65,
        "sku": "DF-CAS-107-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cashews_3_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 350,
        "originalPrice": 427,
        "stockQuantity": 50,
        "sku": "DF-CAS-107-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cashews_3_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 665,
        "originalPrice": 798,
        "stockQuantity": 40,
        "sku": "DF-CAS-107-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cashews_3_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1278,
        "originalPrice": 1508,
        "stockQuantity": 25,
        "sku": "DF-CAS-107-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cashews_4",
    "name": "Split Tukda Cashews (Kaju Tukda)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Cashews",
    "subcategoryName": "Cashews",
    "shortDescription": "Fresh clean cashew split halves, ideal for sweets, curries, and daily cooking.",
    "description": "Fresh clean cashew split halves, ideal for sweets, curries, and daily cooking. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 159,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "India",
    "sku": "DF-CAS-108",
    "barcode": "890700100007",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cashews_4_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 106,
        "originalPrice": 133,
        "stockQuantity": 65,
        "sku": "DF-CAS-108-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cashews_4_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 240,
        "originalPrice": 293,
        "stockQuantity": 50,
        "sku": "DF-CAS-108-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cashews_4_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 456,
        "originalPrice": 547,
        "stockQuantity": 40,
        "sku": "DF-CAS-108-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cashews_4_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 876,
        "originalPrice": 1034,
        "stockQuantity": 25,
        "sku": "DF-CAS-108-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_pistachios_1",
    "name": "Iranian Salted & Roasted Pistachios (Pista)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Pistachios",
    "subcategoryName": "Pistachios",
    "shortDescription": "Jumbo open-mouth roasted pistachios with savory sea salt.",
    "description": "Jumbo open-mouth roasted pistachios with savory sea salt. Sourced directly from renowned growers in Iran, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Iran",
    "sku": "DF-PIS-109",
    "barcode": "890700100008",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_pistachios_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 158,
        "originalPrice": 198,
        "stockQuantity": 65,
        "sku": "DF-PIS-109-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 360,
        "originalPrice": 439,
        "stockQuantity": 50,
        "sku": "DF-PIS-109-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 684,
        "originalPrice": 821,
        "stockQuantity": 40,
        "sku": "DF-PIS-109-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1314,
        "originalPrice": 1551,
        "stockQuantity": 25,
        "sku": "DF-PIS-109-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_pistachios_2",
    "name": "California Raw Green Pistachio Kernels",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Pistachios",
    "subcategoryName": "Pistachios",
    "shortDescription": "Unsalted shelled green pistachio kernels, rich in antioxidants and lutein.",
    "description": "Unsalted shelled green pistachio kernels, rich in antioxidants and lutein. Sourced directly from renowned growers in California, USA, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "California, USA",
    "sku": "DF-PIS-110",
    "barcode": "890700100009",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_pistachios_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 211,
        "originalPrice": 264,
        "stockQuantity": 65,
        "sku": "DF-PIS-110-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 480,
        "originalPrice": 586,
        "stockQuantity": 50,
        "sku": "DF-PIS-110-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 912,
        "originalPrice": 1094,
        "stockQuantity": 40,
        "sku": "DF-PIS-110-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1752,
        "originalPrice": 2067,
        "stockQuantity": 25,
        "sku": "DF-PIS-110-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_pistachios_3",
    "name": "Turkish Antep Royal Pistachios",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Pistachios",
    "subcategoryName": "Pistachios",
    "shortDescription": "Renowned intense nutty aroma and emerald green color.",
    "description": "Renowned intense nutty aroma and emerald green color. Sourced directly from renowned growers in Gaziantep, Turkey, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Gaziantep, Turkey",
    "sku": "DF-PIS-111",
    "barcode": "890700100010",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_pistachios_3_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 185,
        "originalPrice": 231,
        "stockQuantity": 65,
        "sku": "DF-PIS-111-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_3_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 420,
        "originalPrice": 512,
        "stockQuantity": 50,
        "sku": "DF-PIS-111-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_3_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 798,
        "originalPrice": 958,
        "stockQuantity": 40,
        "sku": "DF-PIS-111-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_pistachios_3_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1533,
        "originalPrice": 1809,
        "stockQuantity": 25,
        "sku": "DF-PIS-111-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_walnuts_1",
    "name": "Kashmiri Snow White Walnut Kernels (Akhrot Giri)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Walnuts",
    "subcategoryName": "Walnuts",
    "shortDescription": "Extra-light butterfly halves, cold-processed to retain pure walnut oil.",
    "description": "Extra-light butterfly halves, cold-processed to retain pure walnut oil. Sourced directly from renowned growers in Kashmir, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Kashmir, India",
    "sku": "DF-WAL-112",
    "barcode": "890700100011",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_walnuts_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 185,
        "originalPrice": 231,
        "stockQuantity": 65,
        "sku": "DF-WAL-112-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 420,
        "originalPrice": 512,
        "stockQuantity": 50,
        "sku": "DF-WAL-112-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 798,
        "originalPrice": 958,
        "stockQuantity": 40,
        "sku": "DF-WAL-112-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1533,
        "originalPrice": 1809,
        "stockQuantity": 25,
        "sku": "DF-WAL-112-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_walnuts_2",
    "name": "California Chandler Walnut Halves",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Walnuts",
    "subcategoryName": "Walnuts",
    "shortDescription": "Mild, buttery Chandler walnut halves with zero bitterness.",
    "description": "Mild, buttery Chandler walnut halves with zero bitterness. Sourced directly from renowned growers in California, USA, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "California, USA",
    "sku": "DF-WAL-113",
    "barcode": "890700100012",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_walnuts_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 158,
        "originalPrice": 198,
        "stockQuantity": 65,
        "sku": "DF-WAL-113-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 360,
        "originalPrice": 439,
        "stockQuantity": 50,
        "sku": "DF-WAL-113-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 684,
        "originalPrice": 821,
        "stockQuantity": 40,
        "sku": "DF-WAL-113-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1314,
        "originalPrice": 1551,
        "stockQuantity": 25,
        "sku": "DF-WAL-113-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_walnuts_3",
    "name": "Kashmiri Thin-Shell In-Shell Walnuts (Kagzi Akhrot)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Walnuts",
    "subcategoryName": "Walnuts",
    "shortDescription": "Paper-thin shell walnuts easy to crack by hand, freshly harvested.",
    "description": "Paper-thin shell walnuts easy to crack by hand, freshly harvested. Sourced directly from renowned growers in Kashmir, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Kashmir, India",
    "sku": "DF-WAL-114",
    "barcode": "890700100013",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_walnuts_3_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 114,
        "originalPrice": 143,
        "stockQuantity": 65,
        "sku": "DF-WAL-114-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_3_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 260,
        "originalPrice": 317,
        "stockQuantity": 50,
        "sku": "DF-WAL-114-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_3_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 494,
        "originalPrice": 593,
        "stockQuantity": 40,
        "sku": "DF-WAL-114-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_walnuts_3_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 949,
        "originalPrice": 1120,
        "stockQuantity": 25,
        "sku": "DF-WAL-114-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_dates_1",
    "name": "Saudi Royal Ajwa Dates (Ajwa Khejur)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Dates",
    "subcategoryName": "Dates",
    "shortDescription": "Soft, dark, luscious sacred Ajwa dates from Madinah with rich medicinal value.",
    "description": "Soft, dark, luscious sacred Ajwa dates from Madinah with rich medicinal value. Sourced directly from renowned growers in Al-Madinah, Saudi Arabia, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Al-Madinah, Saudi Arabia",
    "sku": "DF-DAT-115",
    "barcode": "890700100014",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_dates_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 167,
        "originalPrice": 209,
        "stockQuantity": 65,
        "sku": "DF-DAT-115-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_dates_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 380,
        "originalPrice": 464,
        "stockQuantity": 50,
        "sku": "DF-DAT-115-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_dates_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 722,
        "originalPrice": 866,
        "stockQuantity": 40,
        "sku": "DF-DAT-115-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_dates_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1387,
        "originalPrice": 1637,
        "stockQuantity": 25,
        "sku": "DF-DAT-115-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_dates_2",
    "name": "Jordanian Medjool Large Dates",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Dates",
    "subcategoryName": "Dates",
    "shortDescription": "The king of dates - oversized, caramel-sweet, and velvety soft.",
    "description": "The king of dates - oversized, caramel-sweet, and velvety soft. Sourced directly from renowned growers in Jordan Valley, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Jordan Valley",
    "sku": "DF-DAT-116",
    "barcode": "890700100015",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_dates_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 216,
        "originalPrice": 270,
        "stockQuantity": 65,
        "sku": "DF-DAT-116-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_dates_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 490,
        "originalPrice": 598,
        "stockQuantity": 50,
        "sku": "DF-DAT-116-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_dates_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 931,
        "originalPrice": 1117,
        "stockQuantity": 40,
        "sku": "DF-DAT-116-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_dates_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1789,
        "originalPrice": 2111,
        "stockQuantity": 25,
        "sku": "DF-DAT-116-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_dates_3",
    "name": "Iranian Kimia Black Dates",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Dates",
    "subcategoryName": "Dates",
    "shortDescription": "Luscious melt-in-the-mouth black dates in vacuum sealed trays.",
    "description": "Luscious melt-in-the-mouth black dates in vacuum sealed trays. Sourced directly from renowned growers in Bam, Iran, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Bam, Iran",
    "sku": "DF-DAT-117",
    "barcode": "890700100016",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_dates_3_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 84,
        "originalPrice": 105,
        "stockQuantity": 65,
        "sku": "DF-DAT-117-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_dates_3_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 190,
        "originalPrice": 232,
        "stockQuantity": 50,
        "sku": "DF-DAT-117-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_dates_3_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 361,
        "originalPrice": 433,
        "stockQuantity": 40,
        "sku": "DF-DAT-117-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_dates_3_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 694,
        "originalPrice": 819,
        "stockQuantity": 25,
        "sku": "DF-DAT-117-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_dates_4",
    "name": "Saudi Safawi / Kalmi Dates",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Dates",
    "subcategoryName": "Dates",
    "shortDescription": "Deep dark chewy dates packed with iron, potassium, and natural fiber.",
    "description": "Deep dark chewy dates packed with iron, potassium, and natural fiber. Sourced directly from renowned growers in Saudi Arabia, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 159,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Saudi Arabia",
    "sku": "DF-DAT-118",
    "barcode": "890700100017",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_dates_4_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 123,
        "originalPrice": 154,
        "stockQuantity": 65,
        "sku": "DF-DAT-118-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_dates_4_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 280,
        "originalPrice": 342,
        "stockQuantity": 50,
        "sku": "DF-DAT-118-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_dates_4_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 532,
        "originalPrice": 638,
        "stockQuantity": 40,
        "sku": "DF-DAT-118-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_dates_4_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1022,
        "originalPrice": 1206,
        "stockQuantity": 25,
        "sku": "DF-DAT-118-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_raisins_1",
    "name": "Afghan Royal Golden Long Kishmish",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Raisins",
    "subcategoryName": "Raisins",
    "shortDescription": "Naturally sun-dried long golden raisins, sweet and seedless.",
    "description": "Naturally sun-dried long golden raisins, sweet and seedless. Sourced directly from renowned growers in Kandahar, Afghanistan, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Kandahar, Afghanistan",
    "sku": "DF-RAI-119",
    "barcode": "890700100018",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_raisins_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 70,
        "originalPrice": 88,
        "stockQuantity": 65,
        "sku": "DF-RAI-119-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_raisins_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 160,
        "originalPrice": 195,
        "stockQuantity": 50,
        "sku": "DF-RAI-119-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_raisins_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 304,
        "originalPrice": 365,
        "stockQuantity": 40,
        "sku": "DF-RAI-119-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_raisins_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 584,
        "originalPrice": 689,
        "stockQuantity": 25,
        "sku": "DF-RAI-119-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_raisins_2",
    "name": "Black Raisins with Seeds (Kali Kishmish)",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Raisins",
    "subcategoryName": "Raisins",
    "shortDescription": "Traditional dark black raisins rich in iron and blood purifying nutrients.",
    "description": "Traditional dark black raisins rich in iron and blood purifying nutrients. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "India",
    "sku": "DF-RAI-120",
    "barcode": "890700100019",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_raisins_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 79,
        "originalPrice": 99,
        "stockQuantity": 65,
        "sku": "DF-RAI-120-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_raisins_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 180,
        "originalPrice": 220,
        "stockQuantity": 50,
        "sku": "DF-RAI-120-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_raisins_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 342,
        "originalPrice": 410,
        "stockQuantity": 40,
        "sku": "DF-RAI-120-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_raisins_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 657,
        "originalPrice": 775,
        "stockQuantity": 25,
        "sku": "DF-RAI-120-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_raisins_3",
    "name": "Green Indian Kishmish",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Raisins",
    "subcategoryName": "Raisins",
    "shortDescription": "Tangy-sweet fresh green raisins, ideal for daily desserts and cereals.",
    "description": "Tangy-sweet fresh green raisins, ideal for daily desserts and cereals. Sourced directly from renowned growers in Nashik, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Nashik, India",
    "sku": "DF-RAI-121",
    "barcode": "890700100020",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_raisins_3_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 57,
        "originalPrice": 71,
        "stockQuantity": 65,
        "sku": "DF-RAI-121-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_raisins_3_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 130,
        "originalPrice": 159,
        "stockQuantity": 50,
        "sku": "DF-RAI-121-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_raisins_3_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 247,
        "originalPrice": 296,
        "stockQuantity": 40,
        "sku": "DF-RAI-121-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_raisins_3_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 475,
        "originalPrice": 561,
        "stockQuantity": 25,
        "sku": "DF-RAI-121-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_figs_1",
    "name": "Afghan Jumbo Dried Garland Figs (Anjeer)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Figs",
    "subcategoryName": "Figs",
    "shortDescription": "String-tied round juicy dried figs rich in calcium and dietary fiber.",
    "description": "String-tied round juicy dried figs rich in calcium and dietary fiber. Sourced directly from renowned growers in Afghanistan, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Afghanistan",
    "sku": "DF-FIG-122",
    "barcode": "890700100021",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_figs_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 211,
        "originalPrice": 264,
        "stockQuantity": 65,
        "sku": "DF-FIG-122-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_figs_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 480,
        "originalPrice": 586,
        "stockQuantity": 50,
        "sku": "DF-FIG-122-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_figs_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 912,
        "originalPrice": 1094,
        "stockQuantity": 40,
        "sku": "DF-FIG-122-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_figs_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1752,
        "originalPrice": 2067,
        "stockQuantity": 25,
        "sku": "DF-FIG-122-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_figs_2",
    "name": "Royal Turkish Extra Large Figs",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Figs",
    "subcategoryName": "Figs",
    "shortDescription": "Naturally dried Turkish white figs with plump honeyed interiors.",
    "description": "Naturally dried Turkish white figs with plump honeyed interiors. Sourced directly from renowned growers in Izmir, Turkey, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Izmir, Turkey",
    "sku": "DF-FIG-123",
    "barcode": "890700100022",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_figs_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 229,
        "originalPrice": 286,
        "stockQuantity": 65,
        "sku": "DF-FIG-123-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_figs_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 520,
        "originalPrice": 634,
        "stockQuantity": 50,
        "sku": "DF-FIG-123-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_figs_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 988,
        "originalPrice": 1186,
        "stockQuantity": 40,
        "sku": "DF-FIG-123-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_figs_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1898,
        "originalPrice": 2240,
        "stockQuantity": 25,
        "sku": "DF-FIG-123-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_anjeer_1",
    "name": "Select Organic Kashmiri Anjeer",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Anjeer",
    "subcategoryName": "Anjeer",
    "shortDescription": "Naturally dehydrated Himalayan figs with delightfully crunchy seeds.",
    "description": "Naturally dehydrated Himalayan figs with delightfully crunchy seeds. Sourced directly from renowned growers in Kashmir, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Kashmir, India",
    "sku": "DF-ANJ-124",
    "barcode": "890700100023",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_anjeer_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 202,
        "originalPrice": 253,
        "stockQuantity": 65,
        "sku": "DF-ANJ-124-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_anjeer_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 460,
        "originalPrice": 561,
        "stockQuantity": 50,
        "sku": "DF-ANJ-124-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_anjeer_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 874,
        "originalPrice": 1049,
        "stockQuantity": 40,
        "sku": "DF-ANJ-124-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_anjeer_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1679,
        "originalPrice": 1981,
        "stockQuantity": 25,
        "sku": "DF-ANJ-124-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_anjeer_2",
    "name": "Heritage Afghan Fig Circles",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Anjeer",
    "subcategoryName": "Anjeer",
    "shortDescription": "Tender, naturally sweet circular sun-cured garland figs.",
    "description": "Tender, naturally sweet circular sun-cured garland figs. Sourced directly from renowned growers in Afghanistan, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Afghanistan",
    "sku": "DF-ANJ-125",
    "barcode": "890700100024",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_anjeer_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 180,
        "originalPrice": 225,
        "stockQuantity": 65,
        "sku": "DF-ANJ-125-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_anjeer_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 410,
        "originalPrice": 500,
        "stockQuantity": 50,
        "sku": "DF-ANJ-125-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_anjeer_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 779,
        "originalPrice": 935,
        "stockQuantity": 40,
        "sku": "DF-ANJ-125-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_anjeer_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1497,
        "originalPrice": 1766,
        "stockQuantity": 25,
        "sku": "DF-ANJ-125-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_apricots_1",
    "name": "Turkish Sweet Sun-Dried Apricots (Jardalu)",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Apricots",
    "subcategoryName": "Apricots",
    "shortDescription": "Plump bright orange sweet dried apricots, naturally sulphur-free.",
    "description": "Plump bright orange sweet dried apricots, naturally sulphur-free. Sourced directly from renowned growers in Malatya, Turkey, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Malatya, Turkey",
    "sku": "DF-APR-126",
    "barcode": "890700100025",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_apricots_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 114,
        "originalPrice": 143,
        "stockQuantity": 65,
        "sku": "DF-APR-126-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_apricots_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 260,
        "originalPrice": 317,
        "stockQuantity": 50,
        "sku": "DF-APR-126-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_apricots_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 494,
        "originalPrice": 593,
        "stockQuantity": 40,
        "sku": "DF-APR-126-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_apricots_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 949,
        "originalPrice": 1120,
        "stockQuantity": 25,
        "sku": "DF-APR-126-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_apricots_2",
    "name": "Ladakh Wild Organic Khubani",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Apricots",
    "subcategoryName": "Apricots",
    "shortDescription": "Traditional sweet-kernel Ladakhi apricots grown in high-altitude pristine air.",
    "description": "Traditional sweet-kernel Ladakhi apricots grown in high-altitude pristine air. Sourced directly from renowned growers in Ladakh, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Ladakh, India",
    "sku": "DF-APR-127",
    "barcode": "890700100026",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_apricots_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 141,
        "originalPrice": 176,
        "stockQuantity": 65,
        "sku": "DF-APR-127-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_apricots_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 320,
        "originalPrice": 390,
        "stockQuantity": 50,
        "sku": "DF-APR-127-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_apricots_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 608,
        "originalPrice": 730,
        "stockQuantity": 40,
        "sku": "DF-APR-127-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_apricots_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1168,
        "originalPrice": 1378,
        "stockQuantity": 25,
        "sku": "DF-APR-127-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_mixed_dry_fruits_1",
    "name": "Royal 5-in-1 Premium Dry Fruit Medley",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Mixed Dry Fruits",
    "subcategoryName": "Mixed Dry Fruits",
    "shortDescription": "Balanced blend of California almonds, W320 cashews, Afghan kishmish, Akhrot giri and pista.",
    "description": "Balanced blend of California almonds, W320 cashews, Afghan kishmish, Akhrot giri and pista. Sourced directly from renowned growers in India & USA, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "India & USA",
    "sku": "DF-MIX-128",
    "barcode": "890700100027",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_mixed_dry_fruits_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 167,
        "originalPrice": 209,
        "stockQuantity": 65,
        "sku": "DF-MIX-128-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 380,
        "originalPrice": 464,
        "stockQuantity": 50,
        "sku": "DF-MIX-128-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 722,
        "originalPrice": 866,
        "stockQuantity": 40,
        "sku": "DF-MIX-128-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1387,
        "originalPrice": 1637,
        "stockQuantity": 25,
        "sku": "DF-MIX-128-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_mixed_dry_fruits_2",
    "name": "Healthy Trail Nut & Berry Breakfast Mix",
    "brand": "Naturale Organic",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Mixed Dry Fruits",
    "subcategoryName": "Mixed Dry Fruits",
    "shortDescription": "Roasted almonds, cashews, cranberries, blueberries, pumpkin seeds and chia.",
    "description": "Roasted almonds, cashews, cranberries, blueberries, pumpkin seeds and chia. Sourced directly from renowned growers in Global Harvest, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "Global Harvest",
    "sku": "DF-MIX-129",
    "barcode": "890700100028",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_mixed_dry_fruits_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 180,
        "originalPrice": 225,
        "stockQuantity": 65,
        "sku": "DF-MIX-129-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 410,
        "originalPrice": 500,
        "stockQuantity": 50,
        "sku": "DF-MIX-129-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 779,
        "originalPrice": 935,
        "stockQuantity": 40,
        "sku": "DF-MIX-129-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1497,
        "originalPrice": 1766,
        "stockQuantity": 25,
        "sku": "DF-MIX-129-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_mixed_dry_fruits_3",
    "name": "Salted & Roasted Party Nut Mix",
    "brand": "Naturale Royal",
    "categoryId": "cat_dry_fruits",
    "categoryName": "Dry Fruits",
    "subcategoryId": "Mixed Dry Fruits",
    "subcategoryName": "Mixed Dry Fruits",
    "shortDescription": "Crunchy almonds, cashews, peanuts and corn crisps dusted with Himalayan salt.",
    "description": "Crunchy almonds, cashews, peanuts and corn crisps dusted with Himalayan salt. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.9,
    "reviewCount": 121,
    "image": "/assets/images/cat_dryfruits.jpg",
    "origin": "India",
    "sku": "DF-MIX-130",
    "barcode": "890700100029",
    "isFeatured": false,
    "isBestSeller": false,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_mixed_dry_fruits_3_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 154,
        "originalPrice": 193,
        "stockQuantity": 65,
        "sku": "DF-MIX-130-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_3_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 350,
        "originalPrice": 427,
        "stockQuantity": 50,
        "sku": "DF-MIX-130-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_3_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 665,
        "originalPrice": 798,
        "stockQuantity": 40,
        "sku": "DF-MIX-130-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_mixed_dry_fruits_3_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1278,
        "originalPrice": 1508,
        "stockQuantity": 25,
        "sku": "DF-MIX-130-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_green_cardamom_1",
    "name": "Kerala 8mm+ Royal Jumbo Green Cardamom (Elaichi)",
    "brand": "Naturale Royal",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Green Cardamom",
    "subcategoryName": "Green Cardamom",
    "shortDescription": "Handpicked extra-bold 8mm+ emerald green cardamom pods full of aromatic seeds.",
    "description": "Handpicked extra-bold 8mm+ emerald green cardamom pods full of aromatic seeds. Sourced directly from renowned growers in Idukki, Kerala, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Idukki, Kerala",
    "sku": "WS-GRE-131",
    "barcode": "890700100030",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_green_cardamom_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 198,
        "originalPrice": 248,
        "stockQuantity": 65,
        "sku": "WS-GRE-131-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_green_cardamom_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 450,
        "originalPrice": 549,
        "stockQuantity": 50,
        "sku": "WS-GRE-131-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_green_cardamom_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 855,
        "originalPrice": 1026,
        "stockQuantity": 40,
        "sku": "WS-GRE-131-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_green_cardamom_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1643,
        "originalPrice": 1939,
        "stockQuantity": 25,
        "sku": "WS-GRE-131-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_green_cardamom_2",
    "name": "Select 7mm Bold Green Cardamom",
    "brand": "Naturale Organic",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Green Cardamom",
    "subcategoryName": "Green Cardamom",
    "shortDescription": "Vibrant aromatic green cardamom pods for chai, biryani, and sweets.",
    "description": "Vibrant aromatic green cardamom pods for chai, biryani, and sweets. Sourced directly from renowned growers in Wayanad, Kerala, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Wayanad, Kerala",
    "sku": "WS-GRE-132",
    "barcode": "890700100031",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_green_cardamom_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 150,
        "originalPrice": 188,
        "stockQuantity": 65,
        "sku": "WS-GRE-132-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_green_cardamom_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 340,
        "originalPrice": 415,
        "stockQuantity": 50,
        "sku": "WS-GRE-132-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_green_cardamom_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 646,
        "originalPrice": 775,
        "stockQuantity": 40,
        "sku": "WS-GRE-132-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_green_cardamom_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 1241,
        "originalPrice": 1464,
        "stockQuantity": 25,
        "sku": "WS-GRE-132-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_black_pepper_1",
    "name": "Tellicherry Extra Bold Black Peppercorns (TGSEB)",
    "brand": "Naturale Royal",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Black Pepper",
    "subcategoryName": "Black Pepper",
    "shortDescription": "The gold standard in whole pepper: tellicherry garbled extra-bold corns with intense heat.",
    "description": "The gold standard in whole pepper: tellicherry garbled extra-bold corns with intense heat. Sourced directly from renowned growers in Malabar, Kerala, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Malabar, Kerala",
    "sku": "WS-BLA-133",
    "barcode": "890700100032",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_black_pepper_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 84,
        "originalPrice": 105,
        "stockQuantity": 65,
        "sku": "WS-BLA-133-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_black_pepper_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 190,
        "originalPrice": 232,
        "stockQuantity": 50,
        "sku": "WS-BLA-133-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_black_pepper_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 361,
        "originalPrice": 433,
        "stockQuantity": 40,
        "sku": "WS-BLA-133-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_black_pepper_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 694,
        "originalPrice": 819,
        "stockQuantity": 25,
        "sku": "WS-BLA-133-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_black_pepper_2",
    "name": "Crushed Black Pepper (Coarse Grind)",
    "brand": "Naturale Organic",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Black Pepper",
    "subcategoryName": "Black Pepper",
    "shortDescription": "Coarsely cracked aromatic black peppercorns for marinades and seasoning.",
    "description": "Coarsely cracked aromatic black peppercorns for marinades and seasoning. Sourced directly from renowned growers in Kerala, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Kerala, India",
    "sku": "WS-BLA-134",
    "barcode": "890700100033",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_black_pepper_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 70,
        "originalPrice": 88,
        "stockQuantity": 65,
        "sku": "WS-BLA-134-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_black_pepper_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 160,
        "originalPrice": 195,
        "stockQuantity": 50,
        "sku": "WS-BLA-134-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_black_pepper_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 304,
        "originalPrice": 365,
        "stockQuantity": 40,
        "sku": "WS-BLA-134-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_black_pepper_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 584,
        "originalPrice": 689,
        "stockQuantity": 25,
        "sku": "WS-BLA-134-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cinnamon_sticks_1",
    "name": "Ceylon True Sweet Cinnamon Quills (Dalchini)",
    "brand": "Naturale Royal",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Cinnamon Sticks",
    "subcategoryName": "Cinnamon Sticks",
    "shortDescription": "Delicate multi-layered Ceylon cinnamon quills with mild sweet fragrance and low coumarin.",
    "description": "Delicate multi-layered Ceylon cinnamon quills with mild sweet fragrance and low coumarin. Sourced directly from renowned growers in Sri Lanka, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Sri Lanka",
    "sku": "WS-CIN-135",
    "barcode": "890700100034",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cinnamon_sticks_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 97,
        "originalPrice": 121,
        "stockQuantity": 65,
        "sku": "WS-CIN-135-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cinnamon_sticks_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 220,
        "originalPrice": 268,
        "stockQuantity": 50,
        "sku": "WS-CIN-135-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cinnamon_sticks_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 418,
        "originalPrice": 502,
        "stockQuantity": 40,
        "sku": "WS-CIN-135-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cinnamon_sticks_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 803,
        "originalPrice": 948,
        "stockQuantity": 25,
        "sku": "WS-CIN-135-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cinnamon_sticks_2",
    "name": "Organic Cassia Cinnamon Bark",
    "brand": "Naturale Organic",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Cinnamon Sticks",
    "subcategoryName": "Cinnamon Sticks",
    "shortDescription": "Robust thick bark with bold pungent flavor, ideal for tadka and biryani.",
    "description": "Robust thick bark with bold pungent flavor, ideal for tadka and biryani. Sourced directly from renowned growers in Meghalaya, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Meghalaya, India",
    "sku": "WS-CIN-136",
    "barcode": "890700100035",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cinnamon_sticks_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 57,
        "originalPrice": 71,
        "stockQuantity": 65,
        "sku": "WS-CIN-136-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cinnamon_sticks_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 130,
        "originalPrice": 159,
        "stockQuantity": 50,
        "sku": "WS-CIN-136-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cinnamon_sticks_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 247,
        "originalPrice": 296,
        "stockQuantity": 40,
        "sku": "WS-CIN-136-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cinnamon_sticks_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 475,
        "originalPrice": 561,
        "stockQuantity": 25,
        "sku": "WS-CIN-136-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cloves_1",
    "name": "Zanzibar Handpicked Whole Cloves (Laung)",
    "brand": "Naturale Royal",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Cloves",
    "subcategoryName": "Cloves",
    "shortDescription": "Full-headed whole aromatic cloves with high natural essential eugenol oil.",
    "description": "Full-headed whole aromatic cloves with high natural essential eugenol oil. Sourced directly from renowned growers in Zanzibar, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Zanzibar",
    "sku": "WS-CLO-137",
    "barcode": "890700100036",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cloves_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 101,
        "originalPrice": 126,
        "stockQuantity": 65,
        "sku": "WS-CLO-137-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cloves_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 230,
        "originalPrice": 281,
        "stockQuantity": 50,
        "sku": "WS-CLO-137-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cloves_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 437,
        "originalPrice": 524,
        "stockQuantity": 40,
        "sku": "WS-CLO-137-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cloves_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 840,
        "originalPrice": 991,
        "stockQuantity": 25,
        "sku": "WS-CLO-137-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cloves_2",
    "name": "Organic Indian Hilltop Cloves",
    "brand": "Naturale Organic",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Cloves",
    "subcategoryName": "Cloves",
    "shortDescription": "Deep brown hand-sorted fragrant cloves for culinary and wellness use.",
    "description": "Deep brown hand-sorted fragrant cloves for culinary and wellness use. Sourced directly from renowned growers in Tamil Nadu, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Tamil Nadu, India",
    "sku": "WS-CLO-138",
    "barcode": "890700100037",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cloves_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 92,
        "originalPrice": 115,
        "stockQuantity": 65,
        "sku": "WS-CLO-138-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cloves_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 210,
        "originalPrice": 256,
        "stockQuantity": 50,
        "sku": "WS-CLO-138-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cloves_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 399,
        "originalPrice": 479,
        "stockQuantity": 40,
        "sku": "WS-CLO-138-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cloves_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 767,
        "originalPrice": 905,
        "stockQuantity": 25,
        "sku": "WS-CLO-138-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cumin_seeds_1",
    "name": "Unjha Premium Machine-Cleaned Cumin Seeds (Jeera)",
    "brand": "Naturale Royal",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Cumin Seeds",
    "subcategoryName": "Cumin Seeds",
    "shortDescription": "Bold aromatic cumin seeds from the capital of cumin, 99.5% pure.",
    "description": "Bold aromatic cumin seeds from the capital of cumin, 99.5% pure. Sourced directly from renowned growers in Gujarat, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Gujarat, India",
    "sku": "WS-CUM-139",
    "barcode": "890700100038",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cumin_seeds_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 53,
        "originalPrice": 66,
        "stockQuantity": 65,
        "sku": "WS-CUM-139-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cumin_seeds_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 120,
        "originalPrice": 146,
        "stockQuantity": 50,
        "sku": "WS-CUM-139-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cumin_seeds_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 228,
        "originalPrice": 274,
        "stockQuantity": 40,
        "sku": "WS-CUM-139-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cumin_seeds_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 438,
        "originalPrice": 517,
        "stockQuantity": 25,
        "sku": "WS-CUM-139-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_cumin_seeds_2",
    "name": "Organic Roasted Cumin Seeds",
    "brand": "Naturale Organic",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Cumin Seeds",
    "subcategoryName": "Cumin Seeds",
    "shortDescription": "Gently roasted cumin seeds imparting smoky earthy depth to raita and chaat.",
    "description": "Gently roasted cumin seeds imparting smoky earthy depth to raita and chaat. Sourced directly from renowned growers in Rajasthan, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Rajasthan, India",
    "sku": "WS-CUM-140",
    "barcode": "890700100039",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_cumin_seeds_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 62,
        "originalPrice": 78,
        "stockQuantity": 65,
        "sku": "WS-CUM-140-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_cumin_seeds_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 140,
        "originalPrice": 171,
        "stockQuantity": 50,
        "sku": "WS-CUM-140-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_cumin_seeds_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 266,
        "originalPrice": 319,
        "stockQuantity": 40,
        "sku": "WS-CUM-140-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_cumin_seeds_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 511,
        "originalPrice": 603,
        "stockQuantity": 25,
        "sku": "WS-CUM-140-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_coriander_seeds_1",
    "name": "Indore Eagle Whole Coriander Seeds (Dhaniya)",
    "brand": "Naturale Royal",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Coriander Seeds",
    "subcategoryName": "Coriander Seeds",
    "shortDescription": "Plump green-tinged coriander seeds with refreshing citrusy-sweet aroma.",
    "description": "Plump green-tinged coriander seeds with refreshing citrusy-sweet aroma. Sourced directly from renowned growers in Madhya Pradesh, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Madhya Pradesh, India",
    "sku": "WS-COR-141",
    "barcode": "890700100040",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_coriander_seeds_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 35,
        "originalPrice": 44,
        "stockQuantity": 65,
        "sku": "WS-COR-141-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_coriander_seeds_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 80,
        "originalPrice": 98,
        "stockQuantity": 50,
        "sku": "WS-COR-141-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_coriander_seeds_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 152,
        "originalPrice": 182,
        "stockQuantity": 40,
        "sku": "WS-COR-141-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_coriander_seeds_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 292,
        "originalPrice": 345,
        "stockQuantity": 25,
        "sku": "WS-COR-141-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_star_anise_1",
    "name": "Whole 8-Pointed Star Anise (Chakra Phool)",
    "brand": "Naturale Royal",
    "categoryId": "cat_whole_spices",
    "categoryName": "Whole Spices",
    "subcategoryId": "Star Anise",
    "subcategoryName": "Star Anise",
    "shortDescription": "Intact star-shaped spice pods delivering sweet liquorice and aniseed warmth.",
    "description": "Intact star-shaped spice pods delivering sweet liquorice and aniseed warmth. Sourced directly from renowned growers in Arunachal Pradesh, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_wholespices.jpg",
    "origin": "Arunachal Pradesh, India",
    "sku": "WS-STA-142",
    "barcode": "890700100041",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_star_anise_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 79,
        "originalPrice": 99,
        "stockQuantity": 65,
        "sku": "WS-STA-142-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_star_anise_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 180,
        "originalPrice": 220,
        "stockQuantity": 50,
        "sku": "WS-STA-142-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_star_anise_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 342,
        "originalPrice": 410,
        "stockQuantity": 40,
        "sku": "WS-STA-142-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_star_anise_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 657,
        "originalPrice": 775,
        "stockQuantity": 25,
        "sku": "WS-STA-142-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_garam_masala_1",
    "name": "Royal Shahi Heritage Garam Masala (18-Spices)",
    "brand": "Naturale Royal",
    "categoryId": "cat_blended_spices",
    "categoryName": "Blended Spices",
    "subcategoryId": "Garam Masala",
    "subcategoryName": "Garam Masala",
    "shortDescription": "Slow-roasted heirloom blend of 18 whole spices, stone-ground with no fillers.",
    "description": "Slow-roasted heirloom blend of 18 whole spices, stone-ground with no fillers. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_blendedspices.jpg",
    "origin": "India",
    "sku": "WS-GAR-143",
    "barcode": "890700100042",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_garam_masala_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 70,
        "originalPrice": 88,
        "stockQuantity": 65,
        "sku": "WS-GAR-143-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_garam_masala_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 160,
        "originalPrice": 195,
        "stockQuantity": 50,
        "sku": "WS-GAR-143-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_garam_masala_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 304,
        "originalPrice": 365,
        "stockQuantity": 40,
        "sku": "WS-GAR-143-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_garam_masala_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 584,
        "originalPrice": 689,
        "stockQuantity": 25,
        "sku": "WS-GAR-143-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_turmeric_powder_1",
    "name": "Lakadong Turmeric Powder (7%+ High Curcumin)",
    "brand": "Naturale Royal",
    "categoryId": "cat_blended_spices",
    "categoryName": "Blended Spices",
    "subcategoryId": "Turmeric Powder",
    "subcategoryName": "Turmeric Powder",
    "shortDescription": "World-renowned Lakadong turmeric with dark golden glow and medicinal curcumin.",
    "description": "World-renowned Lakadong turmeric with dark golden glow and medicinal curcumin. Sourced directly from renowned growers in Meghalaya, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_blendedspices.jpg",
    "origin": "Meghalaya, India",
    "sku": "WS-TUR-144",
    "barcode": "890700100043",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_turmeric_powder_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 62,
        "originalPrice": 78,
        "stockQuantity": 65,
        "sku": "WS-TUR-144-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_turmeric_powder_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 140,
        "originalPrice": 171,
        "stockQuantity": 50,
        "sku": "WS-TUR-144-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_turmeric_powder_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 266,
        "originalPrice": 319,
        "stockQuantity": 40,
        "sku": "WS-TUR-144-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_turmeric_powder_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 511,
        "originalPrice": 603,
        "stockQuantity": 25,
        "sku": "WS-TUR-144-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_turmeric_powder_2",
    "name": "Salem Pure Yellow Turmeric Powder",
    "brand": "Naturale Organic",
    "categoryId": "cat_blended_spices",
    "categoryName": "Blended Spices",
    "subcategoryId": "Turmeric Powder",
    "subcategoryName": "Turmeric Powder",
    "shortDescription": "Aromatic everyday cooking haldi powder ground from unpolished fingers.",
    "description": "Aromatic everyday cooking haldi powder ground from unpolished fingers. Sourced directly from renowned growers in Tamil Nadu, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_blendedspices.jpg",
    "origin": "Tamil Nadu, India",
    "sku": "WS-TUR-145",
    "barcode": "890700100044",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_turmeric_powder_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 40,
        "originalPrice": 50,
        "stockQuantity": 65,
        "sku": "WS-TUR-145-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_turmeric_powder_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 90,
        "originalPrice": 110,
        "stockQuantity": 50,
        "sku": "WS-TUR-145-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_turmeric_powder_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 171,
        "originalPrice": 205,
        "stockQuantity": 40,
        "sku": "WS-TUR-145-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_turmeric_powder_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 329,
        "originalPrice": 388,
        "stockQuantity": 25,
        "sku": "WS-TUR-145-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_kashmiri_chilli_1",
    "name": "Kashmiri Deggi Mirch (Stemless Mild & Red)",
    "brand": "Naturale Royal",
    "categoryId": "cat_blended_spices",
    "categoryName": "Blended Spices",
    "subcategoryId": "Kashmiri Chilli",
    "subcategoryName": "Kashmiri Chilli",
    "shortDescription": "Vibrant ruby-red colour with gentle mild heat, giving gravies legendary appeal.",
    "description": "Vibrant ruby-red colour with gentle mild heat, giving gravies legendary appeal. Sourced directly from renowned growers in Kashmir, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_blendedspices.jpg",
    "origin": "Kashmir, India",
    "sku": "WS-KAS-146",
    "barcode": "890700100045",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_kashmiri_chilli_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 66,
        "originalPrice": 83,
        "stockQuantity": 65,
        "sku": "WS-KAS-146-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_kashmiri_chilli_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 150,
        "originalPrice": 183,
        "stockQuantity": 50,
        "sku": "WS-KAS-146-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_kashmiri_chilli_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 285,
        "originalPrice": 342,
        "stockQuantity": 40,
        "sku": "WS-KAS-146-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_kashmiri_chilli_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 548,
        "originalPrice": 647,
        "stockQuantity": 25,
        "sku": "WS-KAS-146-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_kitchen_king_1",
    "name": "All-Purpose Kitchen King Master Masala",
    "brand": "Naturale Royal",
    "categoryId": "cat_blended_spices",
    "categoryName": "Blended Spices",
    "subcategoryId": "Kitchen King",
    "subcategoryName": "Kitchen King",
    "shortDescription": "Balanced versatile spice blend elevating paneer, vegetables, and everyday dals.",
    "description": "Balanced versatile spice blend elevating paneer, vegetables, and everyday dals. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_blendedspices.jpg",
    "origin": "India",
    "sku": "WS-KIT-147",
    "barcode": "890700100046",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_kitchen_king_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 57,
        "originalPrice": 71,
        "stockQuantity": 65,
        "sku": "WS-KIT-147-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_kitchen_king_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 130,
        "originalPrice": 159,
        "stockQuantity": 50,
        "sku": "WS-KIT-147-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_kitchen_king_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 247,
        "originalPrice": 296,
        "stockQuantity": 40,
        "sku": "WS-KIT-147-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_kitchen_king_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 475,
        "originalPrice": 561,
        "stockQuantity": 25,
        "sku": "WS-KIT-147-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_biryani_masala_1",
    "name": "Hyderabadi Dum Biryani Spices Blend",
    "brand": "Naturale Royal",
    "categoryId": "cat_blended_spices",
    "categoryName": "Blended Spices",
    "subcategoryId": "Biryani Masala",
    "subcategoryName": "Biryani Masala",
    "shortDescription": "Nizami blend featuring mace, javitri, shahi jeera, and saffron undertones.",
    "description": "Nizami blend featuring mace, javitri, shahi jeera, and saffron undertones. Sourced directly from renowned growers in Hyderabad, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_blendedspices.jpg",
    "origin": "Hyderabad, India",
    "sku": "WS-BIR-148",
    "barcode": "890700100047",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_biryani_masala_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 75,
        "originalPrice": 94,
        "stockQuantity": 65,
        "sku": "WS-BIR-148-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_biryani_masala_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 170,
        "originalPrice": 207,
        "stockQuantity": 50,
        "sku": "WS-BIR-148-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_biryani_masala_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 323,
        "originalPrice": 388,
        "stockQuantity": 40,
        "sku": "WS-BIR-148-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_biryani_masala_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 621,
        "originalPrice": 733,
        "stockQuantity": 25,
        "sku": "WS-BIR-148-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_rolled_oats_1",
    "name": "Gluten-Free 100% Jumbo Rolled Oats",
    "brand": "Naturale Royal",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Rolled Oats",
    "subcategoryName": "Rolled Oats",
    "shortDescription": "Whole grain oats rich in beta-glucan fiber for lasting morning energy.",
    "description": "Whole grain oats rich in beta-glucan fiber for lasting morning energy. Sourced directly from renowned growers in Australia, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "Australia",
    "sku": "CR-ROL-149",
    "barcode": "890700100048",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_rolled_oats_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 57,
        "originalPrice": 71,
        "stockQuantity": 65,
        "sku": "CR-ROL-149-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_rolled_oats_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 130,
        "originalPrice": 159,
        "stockQuantity": 50,
        "sku": "CR-ROL-149-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_rolled_oats_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 247,
        "originalPrice": 296,
        "stockQuantity": 40,
        "sku": "CR-ROL-149-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_rolled_oats_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 475,
        "originalPrice": 561,
        "stockQuantity": 25,
        "sku": "CR-ROL-149-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_rolled_oats_2",
    "name": "Quick Cooking Porridge Oats",
    "brand": "Naturale Organic",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Rolled Oats",
    "subcategoryName": "Rolled Oats",
    "shortDescription": "Finely flaked whole oats that cook into creamy smooth porridge in 3 minutes.",
    "description": "Finely flaked whole oats that cook into creamy smooth porridge in 3 minutes. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "India",
    "sku": "CR-ROL-150",
    "barcode": "890700100049",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_rolled_oats_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 48,
        "originalPrice": 60,
        "stockQuantity": 65,
        "sku": "CR-ROL-150-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_rolled_oats_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 110,
        "originalPrice": 134,
        "stockQuantity": 50,
        "sku": "CR-ROL-150-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_rolled_oats_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 209,
        "originalPrice": 251,
        "stockQuantity": 40,
        "sku": "CR-ROL-150-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_rolled_oats_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 402,
        "originalPrice": 474,
        "stockQuantity": 25,
        "sku": "CR-ROL-150-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_quinoa_1",
    "name": "Royal White Organic Quinoa",
    "brand": "Naturale Royal",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Quinoa",
    "subcategoryName": "Quinoa",
    "shortDescription": "Complete plant protein packed with all 9 essential amino acids, pre-washed.",
    "description": "Complete plant protein packed with all 9 essential amino acids, pre-washed. Sourced directly from renowned growers in Peru / India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "Peru / India",
    "sku": "CR-QUI-151",
    "barcode": "890700100050",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_quinoa_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 79,
        "originalPrice": 99,
        "stockQuantity": 65,
        "sku": "CR-QUI-151-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_quinoa_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 180,
        "originalPrice": 220,
        "stockQuantity": 50,
        "sku": "CR-QUI-151-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_quinoa_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 342,
        "originalPrice": 410,
        "stockQuantity": 40,
        "sku": "CR-QUI-151-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_quinoa_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 657,
        "originalPrice": 775,
        "stockQuantity": 25,
        "sku": "CR-QUI-151-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_quinoa_2",
    "name": "Tricolor Superfood Quinoa (White, Red, Black)",
    "brand": "Naturale Organic",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Quinoa",
    "subcategoryName": "Quinoa",
    "shortDescription": "Nutty textured blend adding vibrant crunch to salads and bowls.",
    "description": "Nutty textured blend adding vibrant crunch to salads and bowls. Sourced directly from renowned growers in Bolivia, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "Bolivia",
    "sku": "CR-QUI-152",
    "barcode": "890700100051",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_quinoa_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 97,
        "originalPrice": 121,
        "stockQuantity": 65,
        "sku": "CR-QUI-152-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_quinoa_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 220,
        "originalPrice": 268,
        "stockQuantity": 50,
        "sku": "CR-QUI-152-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_quinoa_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 418,
        "originalPrice": 502,
        "stockQuantity": 40,
        "sku": "CR-QUI-152-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_quinoa_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 803,
        "originalPrice": 948,
        "stockQuantity": 25,
        "sku": "CR-QUI-152-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_millets_1",
    "name": "Organic Unpolished Foxtail Millet (Kangni)",
    "brand": "Naturale Royal",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Millets",
    "subcategoryName": "Millets",
    "shortDescription": "Low glycemic index traditional grain rich in minerals and fiber.",
    "description": "Low glycemic index traditional grain rich in minerals and fiber. Sourced directly from renowned growers in Karnataka, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "Karnataka, India",
    "sku": "CR-MIL-153",
    "barcode": "890700100052",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_millets_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 40,
        "originalPrice": 50,
        "stockQuantity": 65,
        "sku": "CR-MIL-153-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_millets_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 90,
        "originalPrice": 110,
        "stockQuantity": 50,
        "sku": "CR-MIL-153-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_millets_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 171,
        "originalPrice": 205,
        "stockQuantity": 40,
        "sku": "CR-MIL-153-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_millets_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 329,
        "originalPrice": 388,
        "stockQuantity": 25,
        "sku": "CR-MIL-153-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_millets_2",
    "name": "Little Millet (Kutki / Sama Rice)",
    "brand": "Naturale Organic",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Millets",
    "subcategoryName": "Millets",
    "shortDescription": "Fast-cooking ancient supergrain suitable for diabetic diets and fasting.",
    "description": "Fast-cooking ancient supergrain suitable for diabetic diets and fasting. Sourced directly from renowned growers in Madhya Pradesh, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.8,
    "reviewCount": 83,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "Madhya Pradesh, India",
    "sku": "CR-MIL-154",
    "barcode": "890700100053",
    "isFeatured": false,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_millets_2_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 42,
        "originalPrice": 53,
        "stockQuantity": 65,
        "sku": "CR-MIL-154-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_millets_2_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 95,
        "originalPrice": 116,
        "stockQuantity": 50,
        "sku": "CR-MIL-154-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_millets_2_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 181,
        "originalPrice": 217,
        "stockQuantity": 40,
        "sku": "CR-MIL-154-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_millets_2_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 347,
        "originalPrice": 409,
        "stockQuantity": 25,
        "sku": "CR-MIL-154-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_ragi_1",
    "name": "Sprouted Finger Millet Flour (Ragi Atta)",
    "brand": "Naturale Royal",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Ragi",
    "subcategoryName": "Ragi",
    "shortDescription": "Calcium powerhouse sprouted ragi flour for rotis, dosas, and baby food.",
    "description": "Calcium powerhouse sprouted ragi flour for rotis, dosas, and baby food. Sourced directly from renowned growers in Karnataka, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "Karnataka, India",
    "sku": "CR-RAG-155",
    "barcode": "890700100054",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_ragi_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 37,
        "originalPrice": 46,
        "stockQuantity": 65,
        "sku": "CR-RAG-155-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_ragi_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 85,
        "originalPrice": 104,
        "stockQuantity": 50,
        "sku": "CR-RAG-155-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_ragi_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 162,
        "originalPrice": 194,
        "stockQuantity": 40,
        "sku": "CR-RAG-155-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_ragi_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 310,
        "originalPrice": 366,
        "stockQuantity": 25,
        "sku": "CR-RAG-155-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_jowar_1",
    "name": "High-Fiber Sorghum Grains (Whole Jowar)",
    "brand": "Naturale Royal",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Jowar",
    "subcategoryName": "Jowar",
    "shortDescription": "Naturally gluten-free whole jowar grains for hearty khichdi and flours.",
    "description": "Naturally gluten-free whole jowar grains for hearty khichdi and flours. Sourced directly from renowned growers in Maharashtra, India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "Maharashtra, India",
    "sku": "CR-JOW-156",
    "barcode": "890700100055",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_jowar_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 33,
        "originalPrice": 41,
        "stockQuantity": 65,
        "sku": "CR-JOW-156-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_jowar_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 75,
        "originalPrice": 92,
        "stockQuantity": 50,
        "sku": "CR-JOW-156-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_jowar_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 143,
        "originalPrice": 172,
        "stockQuantity": 40,
        "sku": "CR-JOW-156-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_jowar_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 274,
        "originalPrice": 323,
        "stockQuantity": 25,
        "sku": "CR-JOW-156-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
    ]
  },
  {
    "id": "p_multigrain_mix_1",
    "name": "Ancient 7-Grain Superfood Health Mix",
    "brand": "Naturale Royal",
    "categoryId": "cat_cereals",
    "categoryName": "Cereals",
    "subcategoryId": "Multigrain Mix",
    "subcategoryName": "Multigrain Mix",
    "shortDescription": "Wholesome blend of ragi, bajra, jowar, foxtail millet, oats, quinoa and flaxseeds.",
    "description": "Wholesome blend of ragi, bajra, jowar, foxtail millet, oats, quinoa and flaxseeds. Sourced directly from renowned growers in India, cleaned through hygienic multi-stage grading and packed in aroma-locking air-tight packaging.",
    "rating": 4.7,
    "reviewCount": 45,
    "image": "/assets/images/cat_cereals.jpg",
    "origin": "India",
    "sku": "CR-MUL-157",
    "barcode": "890700100056",
    "isFeatured": true,
    "isBestSeller": true,
    "allowCustomWeight": true,
    "variants": [
      {
        "id": "p_multigrain_mix_1_100",
        "weightInGrams": 100,
        "unit": "GM",
        "title": "100 GM",
        "price": 62,
        "originalPrice": 78,
        "stockQuantity": 65,
        "sku": "CR-MUL-157-100G",
        "barcode": "890700100100",
        "isAvailable": true
      },
      {
        "id": "p_multigrain_mix_1_250",
        "weightInGrams": 250,
        "unit": "GM",
        "title": "250 GM",
        "price": 140,
        "originalPrice": 171,
        "stockQuantity": 50,
        "sku": "CR-MUL-157-250G",
        "barcode": "890700100250",
        "isAvailable": true
      },
      {
        "id": "p_multigrain_mix_1_500",
        "weightInGrams": 500,
        "unit": "GM",
        "title": "500 GM",
        "price": 266,
        "originalPrice": 319,
        "stockQuantity": 40,
        "sku": "CR-MUL-157-500G",
        "barcode": "890700100500",
        "isAvailable": true
      },
      {
        "id": "p_multigrain_mix_1_1000",
        "weightInGrams": 1000,
        "unit": "KG",
        "title": "1 KG",
        "price": 511,
        "originalPrice": 603,
        "stockQuantity": 25,
        "sku": "CR-MUL-157-1KG",
        "barcode": "890700100999",
        "isAvailable": true
      }
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
  if (typeof window === 'undefined') {
    return INITIAL_DB;
  }
  try {
    localStorage.removeItem('naturale_admin_db');
    localStorage.removeItem('naturale_admin_db_v2');
    const data = localStorage.getItem('naturale_admin_db_v4');
    if (!data) {
      localStorage.setItem('naturale_admin_db_v4', JSON.stringify(INITIAL_DB));
      return INITIAL_DB;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed.orders)) parsed.orders = [];
    if (!Array.isArray(parsed.customers)) parsed.customers = [];
    return parsed;
  } catch {
    return INITIAL_DB;
  }
}

function saveLocalDb(db) {
  if (typeof window === 'undefined') return;
  if (!Array.isArray(db.orders)) db.orders = [];
  if (!Array.isArray(db.customers)) db.customers = [];
  try {
    localStorage.setItem('naturale_admin_db_v4', JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// API methods
export const mockApi = {
  // Auth
  async login(email, password) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password }, { timeout: 20000 });
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
      const res = await axios.get(`${API_BASE}/products`, { timeout: 20000 });
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
    const catPrefix = (productData.categoryId?.includes('spice') || productData.categoryName?.includes('Whole')) ? 'WS'
      : (productData.categoryId?.includes('blend') || productData.categoryName?.includes('Blend')) ? 'BS'
      : (productData.categoryId?.includes('cereal') || productData.categoryName?.includes('Cereal')) ? 'CR'
      : 'DF';
    const subPrefix = String(productData.subcategoryName || productData.subcategoryId || productData.name || 'PRD').replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'PRD';
    const autoSku = productData.sku || `${catPrefix}-${subPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    const autoBarcode = productData.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`;

    const variants = (productData.variants || []).map((v, i) => ({
      ...v,
      sku: v.sku || `${autoSku}-${v.weightInGrams || (i + 1) * 250}G`,
      barcode: v.barcode || `${autoBarcode.slice(0, -3)}${String(v.weightInGrams || (i + 1) * 100).padStart(3, '0')}`,
    }));

    const newProduct = {
      id: `p_${Date.now()}`,
      rating: 4.8,
      reviewCount: 0,
      ...productData,
      sku: autoSku,
      barcode: autoBarcode,
      variants,
    };
    db.products.push(newProduct);
    saveLocalDb(db);

    try {
      const res = await axios.post(`${API_BASE}/products`, newProduct, { timeout: 20000 });
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
      const res = await axios.put(`${API_BASE}/products/${id}`, productData, { timeout: 20000 });
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
      await axios.delete(`${API_BASE}/products/${id}`, { timeout: 20000 });
    } catch (_) {}
    return true;
  },

  async bulkImportProducts(productList, replaceExisting = false) {
    const db = getLocalDb();
    if (!db.products) db.products = [];
    if (!db.categories) db.categories = [];

    const now = Date.now();
    const imported = [];

    if (replaceExisting) {
      db.products = [];
    }

    productList.forEach((prod, i) => {
      const existingIdx = db.products.findIndex(
        p => p.name.toLowerCase() === prod.name.toLowerCase() || (prod.id && p.id === prod.id)
      );

      // Auto ensure category has this subcategory
      if (prod.categoryId && prod.subcategoryId) {
        const cat = db.categories.find(
          c => c.id === prod.categoryId || c.name.toLowerCase() === (prod.categoryName || '').toLowerCase()
        );
        if (cat) {
          if (!cat.subcategories) cat.subcategories = [];
          if (!cat.subcategories.includes(prod.subcategoryId)) {
            cat.subcategories.push(prod.subcategoryId);
          }
        }
      }

      if (existingIdx !== -1 && !replaceExisting) {
        db.products[existingIdx] = {
          ...db.products[existingIdx],
          ...prod,
          variants: (prod.variants && prod.variants.length > 0) ? prod.variants : db.products[existingIdx].variants,
        };
        imported.push(db.products[existingIdx]);
      } else {
        const newProd = {
          id: prod.id || `p_${now}_${i}`,
          rating: prod.rating || 4.85,
          reviewCount: prod.reviewCount || 15,
          brand: prod.brand || 'Naturale Pure',
          origin: prod.origin || 'India',
          image: prod.image || '/assets/images/cat_dryfruits.jpg',
          allowCustomWeight: true,
          isFeatured: !!prod.isFeatured,
          isBestSeller: !!prod.isBestSeller,
          variants: prod.variants || [],
          ...prod,
        };
        db.products.push(newProd);
        imported.push(newProd);
      }
    });

    saveLocalDb(db);

    try {
      await axios.post(`${API_BASE}/products/bulk`, { products: imported }, { timeout: 20000 });
    } catch (_) {}

    return imported;
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
      const res = await axios.put(`${API_BASE}/products/${productId}/variants/${variantId}`, variantData, { timeout: 20000 });
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
      const res = await axios.post(`${API_BASE}/products/${productId}/variants`, variantData, { timeout: 20000 });
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
      await axios.delete(`${API_BASE}/products/${productId}/variants/${variantId}`, { timeout: 20000 });
    } catch (_) {}
    return true;
  },

  // Categories
  async getCategories() {
    const db = getLocalDb();
    try {
      const res = await axios.get(`${API_BASE}/categories`, { timeout: 20000 });
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
      const res = await axios.post(`${API_BASE}/categories`, catData, { timeout: 20000 });
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
      const res = await axios.put(`${API_BASE}/categories/${id}`, catData, { timeout: 20000 });
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
      await axios.delete(`${API_BASE}/categories/${id}`, { timeout: 20000 });
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
      await axios.post(`${API_BASE}/categories/bulk`, { categories: imported }, { timeout: 20000 });
    } catch (_) {}

    return imported;
  },

  // Synchronize customers dynamically from all placed orders
  syncCustomersFromOrders(orders = []) {
    if (!Array.isArray(orders) || orders.length === 0) return [];
    const db = getLocalDb();
    if (!Array.isArray(db.customers)) db.customers = [];

    const custMap = new Map();
    // Pre-populate with existing customers
    for (const c of db.customers) {
      if (!c) continue;
      const key = (c.phone || c.mobile || c.email || c.name || '').toLowerCase().trim();
      if (key) custMap.set(key, { ...c });
    }

    // Aggregate from orders
    for (const ord of orders) {
      const c = ord.customer;
      if (!c || !c.name) continue;
      const key = (c.phone || c.mobile || c.email || c.name).toLowerCase().trim();
      if (!custMap.has(key)) {
        custMap.set(key, {
          id: 'cust_' + (c.phone || Math.random().toString(36).slice(2, 8)),
          name: c.name,
          businessName: c.businessName || '',
          gstNumber: c.gstNumber || '',
          email: c.email || '',
          mobile: c.phone || '',
          phone: c.phone || '',
          city: (c.address && c.address.city) || 'India',
          registeredDate: ord.createdAt ? String(ord.createdAt).slice(0, 10) : 'Recent',
          totalOrders: 0,
          totalSpent: 0,
          status: 'Active',
        });
      }
      const existing = custMap.get(key);
      existing.totalOrders = (existing.totalOrders || 0) + 1;
      existing.totalSpent = (existing.totalSpent || 0) + (Number(ord.totalAmount) || 0);
      if (c.address?.city && (!existing.city || existing.city === 'India')) {
        existing.city = c.address.city;
      }
      if (c.businessName && !existing.businessName) existing.businessName = c.businessName;
      if (c.gstNumber && !existing.gstNumber) existing.gstNumber = c.gstNumber;
    }

    db.customers = Array.from(custMap.values());
    saveLocalDb(db);
    return db.customers;
  },

  // Orders
  async getOrders() {
    try {
      const res = await axios.get(`${API_BASE}/orders`, { timeout: 20000 });
      const orders = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (orders.length > 0) {
        const db = getLocalDb();
        db.orders = orders;
        saveLocalDb(db);
        this.syncCustomersFromOrders(orders);
        return orders;
      }
    } catch (_) {}

    try {
      const fRes = await fetch('https://dryfruits-api.onrender.com/api/orders', {
        headers: { 'Accept': 'application/json' },
      });
      if (fRes.ok) {
        const fOrders = await fRes.json();
        if (Array.isArray(fOrders) && fOrders.length > 0) {
          const db = getLocalDb();
          db.orders = fOrders;
          saveLocalDb(db);
          this.syncCustomersFromOrders(fOrders);
          return fOrders;
        }
      }
    } catch (_) {}

    const local = getLocalDb().orders || [];
    this.syncCustomersFromOrders(local);
    return local;
  },

  generateCustomOrderId(items) {
    let shortName = 'dryfruit';
    if (items && items.length > 0) {
      const first = items[0];
      const name = String(first.productName || first.name || first.productId || '').toLowerCase();
      if (name.includes('almond') || name.includes('badam')) shortName = 'almond';
      else if (name.includes('cashew') || name.includes('kaju')) shortName = 'cashew';
      else if (name.includes('pista') || name.includes('pistachio')) shortName = 'pista';
      else if (name.includes('walnut') || name.includes('akhrot')) shortName = 'walnut';
      else if (name.includes('date') || name.includes('ajwa') || name.includes('khejur') || name.includes('khajoor')) shortName = 'dates';
      else if (name.includes('raisin') || name.includes('kishmish')) shortName = 'raisins';
      else if (name.includes('fig') || name.includes('anjeer')) shortName = 'anjeer';
      else if (name.includes('apricot') || name.includes('jardalu')) shortName = 'apricot';
      else if (name.includes('mixed') || name.includes('mix')) shortName = 'mixdryfruit';
      else if (name.includes('cardamom') || name.includes('elaichi')) shortName = 'cardamom';
      else if (name.includes('pepper') || name.includes('mirch')) shortName = 'blackpepper';
      else if (name.includes('cinnamon') || name.includes('dalchini')) shortName = 'cinnamon';
      else if (name.includes('clove') || name.includes('laung')) shortName = 'clove';
      else if (name.includes('cumin') || name.includes('jeera')) shortName = 'cumin';
      else if (name.includes('coriander') || name.includes('dhaniya')) shortName = 'coriander';
      else if (name.includes('garam') || name.includes('masala')) shortName = 'garammasala';
      else if (name.includes('turmeric') || name.includes('haldi')) shortName = 'turmeric';
      else if (name.includes('chilli') || name.includes('mirchi')) shortName = 'chilli';
      else if (name.includes('oat')) shortName = 'oats';
      else if (name.includes('quinoa')) shortName = 'quinoa';
      else if (name.includes('ragi')) shortName = 'ragi';
      else if (name.includes('jowar')) shortName = 'jowar';
      else if (name.includes('millet')) shortName = 'millets';
      else {
        const clean = name.replace(/[^a-z0-9]/g, '');
        shortName = clean ? clean.slice(0, 10) : 'dryfruit';
      }
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    const dateStr = `${day}${month}${year}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}${mins}${secs}`;

    const db = getLocalDb();
    const count = (db.orders || []).filter((o) => o.id && o.id.toLowerCase().startsWith(`${shortName}-`)).length;
    const numStr = String(count + 1).padStart(2, '0');

    return `${shortName}-${numStr}-${dateStr}-${timeStr}`;
  },

  async createManualOrder(orderData) {
    const orderId = orderData.id || this.generateCustomOrderId(orderData.items);
    const newOrder = {
      ...orderData,
      id: orderId,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'Confirmed',
      paymentStatus: orderData.paymentStatus || 'Paid',
    };

    try {
      const res = await axios.post(`${API_BASE}/orders`, newOrder, { timeout: 20000 });
      if (res.data && res.data.id) {
        const db = getLocalDb();
        db.orders = [res.data, ...(db.orders || []).filter((o) => o.id !== res.data.id)];
        saveLocalDb(db);
        this.syncCustomersFromOrders(db.orders);
        return res.data;
      }
    } catch (_) {}

    // Local DB Fallback
    const db = getLocalDb();
    if (!Array.isArray(db.orders)) db.orders = [];
    db.orders.unshift(newOrder);
    saveLocalDb(db);
    this.syncCustomersFromOrders(db.orders);
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    try {
      const res = await axios.patch(`${API_BASE}/orders/${id}/status`, { status }, { timeout: 20000 });
      return res.data;
    } catch {
      return { id, status };
    }
  },

  // Customers
  async getCustomers() {
    let customers = [];
    try {
      const res = await axios.get(`${API_BASE}/customers`, { timeout: 20000 });
      const apiCust = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (apiCust.length > 0) {
        customers = apiCust;
        const db = getLocalDb();
        db.customers = customers;
        saveLocalDb(db);
        return customers;
      }
    } catch (_) {}

    const db = getLocalDb();
    customers = db.customers || [];
    if (customers.length === 0) {
      const ords = db.orders || [];
      if (ords.length > 0) {
        customers = this.syncCustomersFromOrders(ords) || [];
      }
    }
    return customers;
  },

  // Coupons
  async getCoupons() {
    const db = getLocalDb();
    try {
      const res = await axios.get(`${API_BASE}/coupons`, { timeout: 20000 });
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
      const res = await axios.get(`${API_BASE}/banners`, { timeout: 20000 });
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
      const res = await axios.get(`${API_BASE}/settings`, { timeout: 20000 });
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
      const res = await axios.get(`${API_BASE}/dashboard/metrics`, { timeout: 20000 });
      if (res.data && res.data.totalProducts !== undefined) {
        return res.data;
      }
    } catch (_) {}
    return local;
  }
};
