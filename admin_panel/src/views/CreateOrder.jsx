'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockApi } from '../services/mockApi';
import {
  ShoppingBag,
  User,
  Building2,
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  Layers,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Receipt,
  CreditCard,
  Truck,
  IndianRupee,
  AlertCircle,
  Mic,
  MicOff,
  PhoneCall,
  Sparkles,
  Bot,
  Zap,
  Volume2,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  PhoneIncoming,
  Headphones,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  UserCheck,
  CheckCircle
} from 'lucide-react';

export default function CreateOrder() {
  const router = useRouter();

  // Master Data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State: Shopkeeper / Business Details
  const [customer, setCustomer] = useState({
    name: '',
    businessName: '',
    gstNumber: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  // Cascading Selection State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [customWeightQty, setCustomWeightQty] = useState(1);
  const [customWeightUnit, setCustomWeightUnit] = useState('KG'); // KG or GM

  // Added Order Items
  const [items, setItems] = useState([]);

  // Pricing & Payment
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [orderStatus, setOrderStatus] = useState('Confirmed');
  const [notes, setNotes] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [formError, setFormError] = useState('');

  // Voice Bot Automated Feed States (Zero Twilio, Zero Ollama)
  const [recentCalls, setRecentCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [showCallsDrawer, setShowCallsDrawer] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [manualVoiceInput, setManualVoiceInput] = useState('');
  const [voiceBotStatus, setVoiceBotStatus] = useState('');
  const [autoFeedBanner, setAutoFeedBanner] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  // Step-by-Step Voice Assistant and Admin Verification States
  const [voiceStep, setVoiceStep] = useState(0); // 0: Idle, 1: Name, 2: Shop, 3: Address/City, 4: Product/Price, 5: Complete
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationPendingCall, setVerificationPendingCall] = useState(null);

  // Target Phone Number on which the bot is implemented (Admin Configurable)
  const [botPhoneNumber, setBotPhoneNumber] = useState('9820012345');
  const [isEditingBotPhone, setIsEditingBotPhone] = useState(false);
  const [tempBotPhone, setTempBotPhone] = useState('9820012345');
  const [phoneSavedToast, setPhoneSavedToast] = useState(false);
  const [voiceDrafts, setVoiceDrafts] = useState([]);
  const [speechLang, setSpeechLang] = useState('en-IN');
  const speechLangRef = useRef('en-IN');

  const requestedVariantIdRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const lastProcessedCallIdRef = useRef(null);
  const lastCollectedSelectionRef = useRef(null);

  // 1. Fetch Categories, Products & Recent Voice Calls on Load
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [cats, prods, calls] = await Promise.all([
          mockApi.getCategories(),
          mockApi.getProducts(),
          mockApi.getRecentVoiceCalls(),
        ]);
        setCategories(cats || []);
        setProducts(prods || []);
        setRecentCalls(calls || []);
      } catch (err) {
        console.error('Failed to load catalogue data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();

    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setSpeechSupported(true);
    }

    // Check if loading an AI Voice Draft Order from URL (?draftId=...)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('draftId');
      if (draftId) {
        mockApi.getVoiceDraftById(draftId).then((draft) => {
          if (draft) {
            setCustomer({
              name: draft.customerName || '',
              businessName: draft.businessName || '',
              gstNumber: draft.gstNumber || '',
              phone: draft.customerPhone || '',
              email: draft.customerEmail || '',
              street: draft.shippingAddress?.street || draft.shippingAddress?.address || '',
              city: draft.shippingAddress?.city || 'Navi Mumbai',
              state: draft.shippingAddress?.state || 'Maharashtra',
              pincode: draft.shippingAddress?.pincode || '400705',
            });

            if (Array.isArray(draft.items) && draft.items.length > 0) {
              setItems(
                draft.items.map((it) => ({
                  productId: it.productId,
                  productName: it.productName,
                  variantId: it.variantId,
                  variantTitle: it.variantTitle || `${it.weightInGrams || 100}g`,
                  weightInGrams: it.weightInGrams || 100,
                  unit: it.unit || 'GM',
                  price: Number(it.price || 0),
                  quantity: Number(it.quantity || 1),
                  image: it.image || '/assets/images/cat_dryfruits.jpg',
                  categoryName: it.categoryName || 'Dry Fruits',
                  subcategoryName: it.subcategoryName || 'General',
                  total: Number(it.price || 0) * Number(it.quantity || 1),
                }))
              );
            }

            if (draft.discount > 0) setDiscountAmount(draft.discount);
            if (draft.deliveryFee > 0) setDeliveryFee(draft.deliveryFee);
            if (draft.deliveryInstructions) setNotes(draft.deliveryInstructions);

            setAutoFeedBanner({
              text: `Order Source: AI Voice Call (Draft ID: #${draft.id}). Review details and click 'Confirm & Place Order' below.`,
              time: new Date(draft.createdAt || Date.now()).toLocaleTimeString(),
              price: draft.totalAmount || draft.subtotal || 'N/A'
            });
          }
        }).catch((err) => console.warn('Could not load voice draft:', err));
      }

      const savedPhone = localStorage.getItem('naturale_bot_phone');
      if (savedPhone) {
        setBotPhoneNumber(savedPhone);
        setTempBotPhone(savedPhone);
      }
    }
  }, []);

  // 1.1 Real-Time Polling for incoming phone calls and AI Drafts (every 3 seconds)
  // Per User Rule: Direct feed nahi hoga, pehle admin verify karega tab hi form me aayega
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const [calls, drafts] = await Promise.all([
          mockApi.getRecentVoiceCalls(),
          mockApi.getVoiceDraftOrders('pending_admin_review')
        ]);

        if (Array.isArray(calls)) {
          setRecentCalls(calls);
          // If a new real incoming call arrives from user's phone
          if (calls.length > 0) {
            const latest = calls[0];
            if (latest.id && latest.id !== lastProcessedCallIdRef.current) {
              lastProcessedCallIdRef.current = latest.id;
              // Open Admin Verification Modal!
              setVerificationPendingCall({
                id: latest.id,
                callerPhone: latest.callerPhone || latest.customer?.phone || '',
                callerName: latest.callerName || latest.customer?.name || '',
                businessName: latest.businessName || latest.customer?.businessName || '',
                city: latest.city || latest.customer?.city || 'Navi Mumbai',
                address: latest.address || latest.customer?.street || '',
                pincode: latest.pincode || latest.customer?.pincode || '400001',
                targetPrice: Number(latest.targetPrice || latest.selection?.targetPrice || 0),
                matchedProductName: latest.matchedProductName || latest.selection?.productName || 'California Whole Almonds (Badam Giri)',
                matchedProductId: latest.matchedProductId || latest.selection?.productId || '',
                matchedVariantTitle: latest.matchedVariantTitle || latest.selection?.variantTitle || '100 GM',
                price: Number(latest.price || 0),
                quantity: Number(latest.quantity || latest.selection?.quantity || 1),
                subcategoryId: latest.subcategoryId || latest.selection?.subcategoryId || 'Almonds',
                categoryId: latest.categoryId || latest.selection?.categoryId || 'cat_dry_fruits',
              });
              setShowVerificationModal(true);
            }
          }
        }

        if (Array.isArray(drafts)) {
          setVoiceDrafts(drafts);
        }
      } catch (_) {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [categories, products]);

  // 2. Cascading: Subcategories based on Selected Category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.id === selectedCategory || c.name === selectedCategory);
    if (!cat) return [];
    if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
      return cat.subcategories;
    }
    // Fallback subcategories by category slug/id
    if (cat.id?.includes('dry') || cat.name?.toLowerCase().includes('dry')) {
      return ['Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Dates', 'Raisins', 'Figs', 'Anjeer', 'Apricots', 'Mixed Dry Fruits', 'Seeds & Nuts'];
    }
    if (cat.id?.includes('whole') || cat.name?.toLowerCase().includes('whole')) {
      return ['Green Cardamom', 'Black Cardamom', 'Cinnamon Sticks', 'Cloves', 'Black Pepper', 'Cumin Seeds', 'Coriander Seeds', 'Fennel Seeds', 'Mustard Seeds', 'Star Anise'];
    }
    if (cat.id?.includes('blended') || cat.name?.toLowerCase().includes('blended')) {
      return ['Garam Masala', 'Kitchen King', 'Biryani Masala', 'Chole Masala', 'Pav Bhaji Masala', 'Turmeric Powder', 'Red Chilli Powder', 'Coriander Powder'];
    }
    return ['Oats', 'Rolled Oats', 'Quinoa', 'Millets', 'Ragi', 'Jowar', 'Bajra', 'Barley', 'Multigrain Mix'];
  }, [selectedCategory, categories]);

  // Reset dependent dropdowns when category changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('');
    setSelectedProduct('');
    setSelectedVariantId('');
  };

  // 3. Cascading: Products based on Selected Category & Subcategory
  const availableProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((p) => {
      const matchCat = p.categoryId === selectedCategory || p.categoryName === selectedCategory;
      if (!selectedSubcategory) return matchCat;
      const sub = selectedSubcategory.toLowerCase();
      const matchSub =
        (p.subcategoryId && p.subcategoryId.toLowerCase().includes(sub)) ||
        (p.subcategoryName && p.subcategoryName.toLowerCase().includes(sub)) ||
        p.name.toLowerCase().includes(sub);
      return matchCat && matchSub;
    });
  }, [selectedCategory, selectedSubcategory, products]);

  // Reset product when subcategory changes
  const handleSubcategoryChange = (sub) => {
    setSelectedSubcategory(sub);
    setSelectedProduct('');
    setSelectedVariantId('');
  };

  // Selected Product Object
  const currentProduct = useMemo(() => {
    return availableProducts.find((p) => p.id === selectedProduct);
  }, [selectedProduct, availableProducts]);

  // Available Variants for Selected Product
  const availableVariants = useMemo(() => {
    if (!currentProduct || !Array.isArray(currentProduct.variants)) return [];
    return currentProduct.variants;
  }, [currentProduct]);

  // Automatically select variant when product changes (respecting voice-bot matched variant)
  useEffect(() => {
    if (availableVariants.length > 0) {
      if (requestedVariantIdRef.current && availableVariants.some((v) => v.id === requestedVariantIdRef.current)) {
        setSelectedVariantId(requestedVariantIdRef.current);
        requestedVariantIdRef.current = null;
      } else if (!availableVariants.some((v) => v.id === selectedVariantId)) {
        setSelectedVariantId(availableVariants[0].id);
      }
    } else {
      setSelectedVariantId('');
    }
  }, [availableVariants]);

  // Current Selected Variant Object
  const currentVariant = useMemo(() => {
    return availableVariants.find((v) => v.id === selectedVariantId) || availableVariants[0];
  }, [selectedVariantId, availableVariants]);

  // Live item price calculation
  const currentItemPrice = useMemo(() => {
    if (!currentVariant) return 0;
    return Number(currentVariant.price || 0) * Number(customWeightQty || 1);
  }, [currentVariant, customWeightQty]);

  // Play natural studio audio prompt or fallback to SpeechSynthesis (Zero Twilio, 100% Free)
  const playNaturalAudioPrompt = (promptType, fallbackText) => {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(`/assets/voice/${promptType}.mp3`);
        setIsBotSpeaking(true);
        audio.onended = () => setIsBotSpeaking(false);
        audio.onerror = () => {
          speakBotAudio(fallbackText);
        };
        audio.play().catch(() => speakBotAudio(fallbackText));
        return;
      } catch (_) {}
    }
    speakBotAudio(fallbackText);
  };

  // Speak audio using browser speech synthesis fallback
  const speakBotAudio = (text, onDone) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 1.0;
        utterance.onstart = () => setIsBotSpeaking(true);
        utterance.onend = () => {
          setIsBotSpeaking(false);
          if (typeof onDone === 'function') onDone();
        };
        utterance.onerror = () => {
          setIsBotSpeaking(false);
          if (typeof onDone === 'function') onDone();
        };
        window.speechSynthesis.speak(utterance);
      } catch (_) {
        setIsBotSpeaking(false);
        if (typeof onDone === 'function') onDone();
      }
    } else {
      if (typeof onDone === 'function') onDone();
    }
  };

  // Automated Order Feeding from Voice Call & AI Matching
  const autoFeedFromCall = (callData) => {
    if (!callData) return;
    setFormError('');

    // 1. Fill Shopkeeper / Customer Details
    const cust = callData.customer || {};
    const populatedCustomer = {
      name: cust.name || callData.callerName || '',
      businessName: cust.businessName || callData.businessName || '',
      phone: cust.phone || callData.callerPhone || '',
      gstNumber: cust.gstNumber || callData.gstNumber || '',
      street: cust.street || callData.address || '',
      city: cust.city || callData.city || 'Navi Mumbai',
      state: cust.state || 'Maharashtra',
      pincode: cust.pincode || callData.pincode || '',
      email: cust.email || `${(cust.phone || callData.callerPhone || '9820012345')}@store.naturale.com`,
    };
    setCustomer(populatedCustomer);

    // 2. Select Category & Subcategory
    const targetCatId = callData.selection?.categoryId ||
      (callData.categoryName?.toLowerCase().includes('spice') ? 'cat_whole_spices' : 'cat_dry_fruits');
    const targetCat = categories.find(
      (c) => c.id === targetCatId || c.name.toLowerCase() === (callData.selection?.categoryName || callData.categoryName || '').toLowerCase()
    ) || categories[0];

    if (targetCat) {
      setSelectedCategory(targetCat.id);
    }

    const targetSub = callData.selection?.subcategoryId || callData.subcategoryId || 'Almonds';
    setSelectedSubcategory(targetSub);

    // 3. Match Product Variety based on Target Price
    const targetPrice = Number(callData.selection?.targetPrice || callData.targetPrice || 0);
    let matchedProductObj = null;

    // Filter candidate products
    const candidateProducts = products.filter((p) => {
      const matchCat = p.categoryId === (targetCat?.id || targetCatId);
      const sub = (p.subcategoryId || p.subcategoryName || p.name || '').toLowerCase();
      return matchCat && sub.includes(targetSub.toLowerCase());
    });

    const pool = candidateProducts.length > 0 ? candidateProducts : products.filter((p) => p.categoryId === (targetCat?.id || targetCatId));

    if (pool.length > 0) {
      if (targetPrice > 0) {
        let minDiff = Infinity;
        for (const prod of pool) {
          const pPrice = Number(prod.variants?.[0]?.price || prod.price || 0);
          const diff = Math.abs(pPrice - targetPrice);
          if (diff < minDiff) {
            minDiff = diff;
            matchedProductObj = prod;
          }
        }
      } else {
        matchedProductObj = pool[0];
      }
    }

    if (matchedProductObj) {
      setSelectedProduct(matchedProductObj.id);

      // 4. Match Weight Variant
      const requestedGrams = callData.selection?.weightInGrams || callData.weightInGrams;
      if (Array.isArray(matchedProductObj.variants) && matchedProductObj.variants.length > 0) {
        let matchedVar = matchedProductObj.variants[0];
        if (requestedGrams) {
          const found = matchedProductObj.variants.find((v) => Number(v.weightInGrams) === Number(requestedGrams));
          if (found) matchedVar = found;
        }
        requestedVariantIdRef.current = matchedVar.id;
        setSelectedVariantId(matchedVar.id);
      }
    }

    // 5. Quantity
    const qty = Number(callData.selection?.quantity || callData.quantity || 1);
    setCustomWeightQty(qty);

    const productName = matchedProductObj ? matchedProductObj.name : (callData.selection?.productName || callData.matchedProductName || 'Selected Variety');

    setAutoFeedBanner({
      text: `Order Auto-Fed Successfully! Shopkeeper "${populatedCustomer.name}" details filled, and variety "${productName}" selected matching target budget ₹${targetPrice || 'N/A'}.`,
      caller: populatedCustomer.name,
      business: populatedCustomer.businessName,
      product: productName,
      price: targetPrice,
      qty,
      time: new Date().toLocaleTimeString(),
    });
  };

  // 1-Click Simulation of Customer Incoming Call
  const handleSimulateCall = async () => {
    try {
      setLoadingCalls(true);
      setVoiceBotStatus('Simulating incoming customer wholesale phone call...');
      const sim = await mockApi.simulateVoiceCall();
      if (sim) {
        setRecentCalls((prev) => [sim, ...prev.filter((c) => c.id !== sim.id)]);
        autoFeedFromCall(sim);
        setVoiceBotStatus(`✅ Call from ${sim.callerName} received & auto-fed into order form!`);
      }
    } catch (err) {
      console.error('Call simulation failed:', err);
      setVoiceBotStatus('Failed to simulate call');
    } finally {
      setLoadingCalls(false);
    }
  };

  // Parse custom voice or typed text
  const handleParseVoiceText = async (textToParse) => {
    if (!textToParse || !textToParse.trim()) return;
    try {
      setLoadingCalls(true);
      setVoiceBotStatus('🤖 Parsing speech entities & matching variety by price...');
      const parsed = await mockApi.parseVoiceOrder(textToParse);
      autoFeedFromCall(parsed);
      setVoiceBotStatus('✅ Voice order parsed and auto-fed successfully!');
      playNaturalAudioPrompt('prompt_closing', `Order details note ho gayi hain. ${parsed.selection?.productName || 'Variety'} select kar diya hai.`);
    } catch (err) {
      console.error('Failed to parse text:', err);
      setVoiceBotStatus('Error parsing voice text');
    } finally {
      setLoadingCalls(false);
    }
  };

  // Step-by-Step Interactive Voice Assistant State Machine
  // Requirement: "haar ek input lene k baad he next input pr jana hai, phele customer ka naam sun k phir dal k phir aage ka sawaal puchna hai"
  const startStepByStepVoice = () => {
    if (isListening || voiceStep > 0) {
      stopVoiceAssistant();
      return;
    }

    setVoiceStep(1);
    setVoiceTranscript('');
    transcriptRef.current = '';
    setVoiceBotStatus('Starting Step 1: Asking Customer Name...');
    playStepAudioAndListen(1);
  };

  const stopVoiceAssistant = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    setIsListening(false);
    setIsBotSpeaking(false);
    setVoiceStep(0);
    setVoiceTranscript('');
    transcriptRef.current = '';
    setVoiceBotStatus('Voice assistant stopped');
  };

  const playStepAudioAndListen = (stepNum) => {
    setVoiceStep(stepNum);
    setVoiceTranscript('');
    transcriptRef.current = '';

    const audioMap = {
      1: { file: 'step_1_name', text: 'नमस्ते! नैचुरले ड्राई फ्रूट्स में आपका स्वागत है। कृपया अपना नाम बताएं?' },
      2: { file: 'step_2_shop', text: 'आपकी दुकान या बिज़नेस का नाम क्या है?' },
      3: { file: 'step_3_address', text: 'आपका डिलीवरी एड्रेस और शहर कौन सा है?' },
      4: { file: 'step_4_product_price', text: 'आपको कौन सा ड्राई फ्रूट या मसाला चाहिए, और कितने पैकेट चाहिए?' },
      5: { file: 'step_5_closing', text: 'जी धन्यवाद! आपकी डिटेल्स नोट हो गई हैं। एडमिन के वेरिफिकेशन के बाद आर्डर कन्फर्म हो जाएगा।' }
    };

    const target = audioMap[stepNum];
    if (!target) return;

    if (stepNum === 5) {
      playNaturalAudioPrompt(target.file, target.text);
      setTimeout(() => {
        setIsListening(false);
        setVoiceStep(0);
        openVerificationForCurrentVoiceSession();
      }, 3500);
      return;
    }

    setIsBotSpeaking(true);
    setVoiceBotStatus(`🔊 Asking Step ${stepNum}/4: "${target.text}"`);

    const onAudioFinished = () => {
      setIsBotSpeaking(false);
      listenForStepInput(stepNum);
    };

    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(`/assets/voice/${target.file}.mp3`);
        audio.onended = onAudioFinished;
        audio.onerror = () => speakBotAudio(target.text, onAudioFinished);
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => speakBotAudio(target.text, onAudioFinished));
        }
        return;
      } catch (_) {
        speakBotAudio(target.text, onAudioFinished);
        return;
      }
    }
    speakBotAudio(target.text, onAudioFinished);
  };

  const listenForStepInput = (stepNum) => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      setVoiceBotStatus('Speech Recognition not supported in this browser. Please use Chrome/Edge or type below.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Short utterance prevents persistent socket drops and "network" errors
    recognition.interimResults = true;
    recognition.lang = speechLangRef.current || 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      const langLabel = speechLangRef.current === 'hi-IN' ? 'Hindi' : 'Hinglish';
      if (stepNum === 1) setVoiceBotStatus(`🎙️ Mic Active (${langLabel}): Apna ya customer ka naam bolkar batayein...`);
      if (stepNum === 2) setVoiceBotStatus(`🎙️ Mic Active (${langLabel}): Dukaan / Store ka naam batayein...`);
      if (stepNum === 3) setVoiceBotStatus(`🎙️ Mic Active (${langLabel}): Delivery Address aur City batayein...`);
      if (stepNum === 4) setVoiceBotStatus(`🎙️ Mic Active (${langLabel}): Product aur quantity batayein...`);
    };

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = 0; i < event.results.length; ++i) {
        currentText += event.results[i][0].transcript;
      }
      if (currentText.trim()) {
        setVoiceTranscript(currentText);
        transcriptRef.current = currentText;
        setVoiceBotStatus(`🎙️ Heard: "${currentText}"`);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition warning on step', stepNum, event.error);
      if (event.error === 'network') {
        if (speechLangRef.current === 'hi-IN') {
          // If Hindi failed with network error, immediately retry with Hinglish (en-IN)
          speechLangRef.current = 'en-IN';
          setSpeechLang('en-IN');
          setVoiceBotStatus('Switching to Indian Hinglish (en-IN) to bypass network error...');
          setTimeout(() => listenForStepInput(stepNum), 400);
          return;
        }
        setIsListening(false);
        setVoiceBotStatus('⚠️ Browser network blocked Google Speech (Adblock/Brave Shield off karein ya niche type karein).');
        return;
      }
      if (event.error !== 'no-speech') {
        setIsListening(false);
        setVoiceBotStatus(`Microphone status: ${event.error}. You can speak again or type below.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      const text = transcriptRef.current || voiceTranscript;
      if (text && text.trim().length > 1) {
        setVoiceBotStatus(`✓ Captured: "${text}". Click "Next Step →" or edit below.`);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error('Error starting recognition on step', stepNum, e);
      setIsListening(false);
    }
  };

  // Explicit Next Step trigger (Called on Enter, Next button, or speech completion)
  const handleNextStep = (stepNum, textOverride) => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsListening(false);

    const text = (textOverride !== undefined && textOverride !== null && textOverride !== '' ? textOverride : (transcriptRef.current || voiceTranscript || '')).trim();
    if (!text) {
      setVoiceBotStatus(`⚠️ Step ${stepNum}: Please speak or type your answer before clicking next.`);
      return;
    }
    handleStepCompleted(stepNum, text);
  };

  const handleStepCompleted = (stepNum, text) => {
    if (!text || text.trim().length === 0) {
      setVoiceBotStatus(`⚠️ Step ${stepNum}: Please speak or type your answer.`);
      return;
    }

    const raw = text.trim();

    if (stepNum === 1) {
      // Step 1: Customer Name
      let cleanName = raw.replace(/^(?:namaste|hello|mera naam|naam hai|main hoon|main|shri|mr)\s+/gi, '').trim();
      cleanName = cleanName.replace(/\s+(?:hai|bol raha hoon|se)$/gi, '').trim();
      if (!cleanName) cleanName = raw;

      setCustomer((prev) => ({ ...prev, name: cleanName }));
      setVoiceBotStatus(`✓ Step 1 Captured: Name "${cleanName}". Moving to Step 2 (Shop Name)...`);
      setTimeout(() => playStepAudioAndListen(2), 1200);
    } else if (stepNum === 2) {
      // Step 2: Business / Store Name
      let cleanShop = raw.replace(/^(?:dukaan ka naam|shop ka naam|store name|meri dukaan|dukaan|shop|humara)\s+(?:hai)?\s*/gi, '').trim();
      cleanShop = cleanShop.replace(/\s+(?:hai|se)$/gi, '').trim();
      if (!cleanShop) cleanShop = raw;

      setCustomer((prev) => ({ ...prev, businessName: cleanShop }));
      setVoiceBotStatus(`✓ Step 2 Captured: Store "${cleanShop}". Moving to Step 3 (Address)...`);
      setTimeout(() => playStepAudioAndListen(3), 1400);
    } else if (stepNum === 3) {
      // Step 3: Address & City
      let detectedCity = 'Navi Mumbai';
      const commonCities = ['Navi Mumbai', 'Mumbai', 'Pune', 'Thane', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur', 'Delhi', 'Surat', 'Ahmedabad', 'Bengaluru', 'Indore'];
      for (const c of commonCities) {
        if (new RegExp(`\\b${c}\\b`, 'i').test(raw)) {
          detectedCity = c;
          break;
        }
      }

      setCustomer((prev) => ({
        ...prev,
        street: raw,
        city: detectedCity,
      }));
      setVoiceBotStatus(`✓ Step 3 Captured: Address recorded! Moving to Step 4 (Product & Budget Rate)...`);
      setTimeout(() => playStepAudioAndListen(4), 1400);
    } else if (stepNum === 4) {
      // Step 4: Product & Target Budget Rate & Quantity
      let targetBudget = 0;
      const pm = raw.match(/(?:rs\.?|inr|₹|\b)\s*(\d{2,4})\s*(?:ke\s*rate|rupaye|rs|wala|wali|rate|approx|budget|price)/i) ||
                 raw.match(/(\d{2,4})\s*(?:rupaye|rs)/i);
      if (pm && pm[1]) {
        targetBudget = parseInt(pm[1], 10);
      }

      // Detect category / subcategory
      const lower = raw.toLowerCase();
      let detectedCatId = 'cat_dry_fruits';
      let detectedSub = 'Almonds';

      if (lower.includes('spice') || lower.includes('masala') || lower.includes('elaichi') || lower.includes('cardamom')) {
        detectedCatId = 'cat_whole_spices';
        detectedSub = lower.includes('elaichi') || lower.includes('cardamom') ? 'Green Cardamom' : 'Black Pepper';
      } else {
        detectedCatId = 'cat_dry_fruits';
        if (lower.includes('kaju') || lower.includes('cashew')) detectedSub = 'Cashews';
        else if (lower.includes('pista') || lower.includes('pistachio')) detectedSub = 'Pistachios';
        else if (lower.includes('akhrot') || lower.includes('walnut')) detectedSub = 'Walnuts';
        else if (lower.includes('date') || lower.includes('khajoor')) detectedSub = 'Dates';
        else detectedSub = 'Almonds';
      }

      // Filter matching products
      const candidateProducts = products.filter((p) => {
        const matchCat = p.categoryId === detectedCatId;
        const sub = (p.subcategoryId || p.subcategoryName || p.name || '').toLowerCase();
        return matchCat && sub.includes(detectedSub.toLowerCase());
      });
      const pool = candidateProducts.length > 0 ? candidateProducts : products.filter((p) => p.categoryId === detectedCatId);

      // Match variety based on budget distance
      let matchedProd = null;
      if (pool.length > 0) {
        if (targetBudget > 0) {
          let minDiff = Infinity;
          for (const prod of pool) {
            const pPrice = Number(prod.variants?.[0]?.price || prod.price || 0);
            const diff = Math.abs(pPrice - targetBudget);
            if (diff < minDiff) {
              minDiff = diff;
              matchedProd = prod;
            }
          }
        } else {
          matchedProd = pool[0];
        }
      }

      // Quantity
      let qty = 1;
      const qm = raw.match(/(\d+)\s*(?:packet|packs?|units?|box|piece|kilo|kg)/i);
      if (qm && qm[1]) qty = Math.max(1, parseInt(qm[1], 10));

      const finalSelection = {
        categoryId: matchedProd?.categoryId || detectedCatId,
        categoryName: matchedProd?.categoryName || 'Dry Fruits',
        subcategoryId: matchedProd?.subcategoryId || detectedSub,
        productId: matchedProd?.id || 'p_almonds_1',
        productName: matchedProd?.name || 'California Whole Almonds (Badam Giri)',
        variantTitle: matchedProd?.variants?.[0]?.title || '100 GM',
        weightInGrams: matchedProd?.variants?.[0]?.weightInGrams || 100,
        price: Number(matchedProd?.variants?.[0]?.price || 123),
        quantity: qty,
        targetPrice: targetBudget || 123,
      };

      lastCollectedSelectionRef.current = finalSelection;

      setVoiceBotStatus(`✓ Step 4 Captured: Matched "${finalSelection.productName}" for budget ₹${finalSelection.targetPrice} (${qty} packs). Closing call...`);
      setTimeout(() => playStepAudioAndListen(5), 1500);
    }
  };

  // Open Admin Verification Modal for Current Live Voice Session
  const openVerificationForCurrentVoiceSession = () => {
    const sel = lastCollectedSelectionRef.current || {
      productName: 'Iranian Mamra Almonds',
      price: 286,
      quantity: 2,
      targetPrice: 280,
      variantTitle: '250 GM',
      categoryId: 'cat_dry_fruits',
      subcategoryId: 'Almonds'
    };

    const callRecord = {
      id: `session_${Date.now()}`,
      callerPhone: customer.phone || '9820012345',
      callerName: customer.name || 'Ramesh Bhai Sharma',
      businessName: customer.businessName || 'Sharma Kirana Mart',
      city: customer.city || 'Navi Mumbai',
      address: customer.street || 'APMC Market',
      pincode: customer.pincode || '400705',
      targetPrice: sel.targetPrice || 280,
      matchedProductName: sel.productName,
      matchedProductId: sel.productId,
      matchedVariantTitle: sel.variantTitle,
      price: sel.price,
      quantity: sel.quantity || 1,
      subcategoryId: sel.subcategoryId,
      categoryId: sel.categoryId,
    };

    setVerificationPendingCall(callRecord);
    setShowVerificationModal(true);
    // Sync call to backend recent-calls store
    mockApi.sendIncomingCallRecord(callRecord);
  };

  // Approve & Feed order into form after Admin reviews
  const handleApproveAndFeed = (verifiedData) => {
    autoFeedFromCall(verifiedData);
    setShowVerificationModal(false);
    setVerificationPendingCall(null);
    setAutoFeedBanner({
      text: `Order Verified & Approved by Admin! Shopkeeper "${verifiedData.callerName || verifiedData.customer?.name}" details and matched variety "${verifiedData.matchedProductName || verifiedData.selection?.productName}" fed into form.`,
      time: new Date().toLocaleTimeString(),
      price: verifiedData.targetPrice || verifiedData.selection?.targetPrice || 'N/A'
    });
  };

  // Discard incoming call without feeding
  const handleDiscardCall = () => {
    setShowVerificationModal(false);
    setVerificationPendingCall(null);
  };

  // Save Target Bot Phone Number (Admin Configurable)
  const handleSaveBotPhone = () => {
    const cleaned = tempBotPhone.replace(/\D/g, '').slice(-10);
    if (cleaned.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setBotPhoneNumber(cleaned);
    setTempBotPhone(cleaned);
    setIsEditingBotPhone(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('naturale_bot_phone', cleaned);
    }
    setPhoneSavedToast(true);
    setTimeout(() => setPhoneSavedToast(false), 3000);
  };

  // Feed AI Voice Draft directly into Create Order form
  const handleFeedDraftIntoForm = (draft) => {
    if (!draft) return;
    setCustomer({
      name: draft.customerName || '',
      businessName: draft.businessName || '',
      gstNumber: draft.gstNumber || '',
      phone: draft.customerPhone || '',
      email: draft.customerEmail || `${draft.customerPhone}@store.naturale.com`,
      street: draft.shippingAddress?.street || draft.shippingAddress?.address || '',
      city: draft.shippingAddress?.city || 'Navi Mumbai',
      state: draft.shippingAddress?.state || 'Maharashtra',
      pincode: draft.shippingAddress?.pincode || '400705',
    });

    if (Array.isArray(draft.items) && draft.items.length > 0) {
      setItems(
        draft.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          variantId: it.variantId,
          variantTitle: it.variantTitle || `${it.weightInGrams || 100}g`,
          weightInGrams: it.weightInGrams || 100,
          unit: it.unit || 'GM',
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          image: it.image || '/assets/images/cat_dryfruits.jpg',
          categoryName: it.categoryName || 'Dry Fruits',
          subcategoryName: it.subcategoryName || 'General',
          total: Number(it.price || 0) * Number(it.quantity || 1),
        }))
      );
    }

    if (draft.discount > 0) setDiscountAmount(draft.discount);
    if (draft.deliveryFee > 0) setDeliveryFee(draft.deliveryFee);
    if (draft.deliveryInstructions) setNotes(draft.deliveryInstructions);

    setAutoFeedBanner({
      text: `Draft Order for "${draft.customerName}" (+91 ${draft.customerPhone}) fed into form! Review details and click 'Confirm & Place Order' below.`,
      time: new Date(draft.createdAt || Date.now()).toLocaleTimeString(),
      price: draft.totalAmount || draft.subtotal || 'N/A'
    });
  };

  // Add Item to Order
  const handleAddItem = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedCategory) {
      setFormError('Please select a Category first.');
      return;
    }
    if (!currentProduct) {
      setFormError('Please select a Product / Variety.');
      return;
    }
    if (!currentVariant) {
      setFormError('Please select a Weight Variant.');
      return;
    }
    if (!customWeightQty || customWeightQty <= 0) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    const newItem = {
      productId: currentProduct.id,
      productName: currentProduct.name,
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      weightInGrams: currentVariant.weightInGrams,
      unit: currentVariant.unit,
      price: Number(currentVariant.price),
      quantity: Number(customWeightQty),
      image: currentProduct.image || '/assets/images/cat_dryfruits.jpg',
      categoryName: currentProduct.categoryName || selectedCategory,
      subcategoryName: selectedSubcategory || currentProduct.subcategoryName || 'General',
      total: Number(currentVariant.price) * Number(customWeightQty),
    };

    setItems((prev) => [...prev, newItem]);

    // Reset selection for quick next item entry
    setCustomWeightQty(1);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals Calculation
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    const total = subtotal - Number(discountAmount || 0) + Number(deliveryFee || 0);
    return Math.max(0, total);
  }, [subtotal, discountAmount, deliveryFee]);

  // Submit Order
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customer.name.trim()) {
      setFormError('Please enter the Shopkeeper / Customer Name.');
      return;
    }
    if (!customer.phone.trim()) {
      setFormError('Please enter a Contact Phone Number.');
      return;
    }
    if (!customer.city.trim()) {
      setFormError('Please enter the City.');
      return;
    }
    if (items.length === 0) {
      setFormError('Please add at least one product item to this order.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          name: customer.name.trim(),
          businessName: customer.businessName.trim(),
          gstNumber: customer.gstNumber.trim().toUpperCase(),
          phone: customer.phone.trim(),
          email: customer.email.trim() || `${customer.phone.trim()}@store.naturale.com`,
          address: {
            street: customer.street.trim() || 'Shop Address',
            area: customer.businessName.trim() || 'Market',
            city: customer.city.trim(),
            state: customer.state.trim() || 'Maharashtra',
            pincode: customer.pincode.trim() || '400001',
          },
        },
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          variantId: it.variantId,
          variantTitle: it.variantTitle,
          weightInGrams: it.weightInGrams,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
        subtotal,
        discount: Number(discountAmount || 0),
        couponCode: discountAmount > 0 ? 'WHOLESALE_DISCOUNT' : '',
        deliveryFee: Number(deliveryFee || 0),
        tax: 0,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus,
        status: orderStatus,
        deliveryInstructions: notes.trim(),
      };

      const created = await mockApi.createManualOrder(orderPayload);
      setConfirmedOrder(created);
    } catch (err) {
      console.error('Order creation error:', err);
      setFormError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForNewOrder = () => {
    setCustomer({
      name: '',
      businessName: '',
      gstNumber: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
    });
    setItems([]);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedProduct('');
    setSelectedVariantId('');
    setCustomWeightQty(1);
    setDiscountAmount(0);
    setDeliveryFee(0);
    setNotes('');
    setConfirmedOrder(null);
    setFormError('');
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-primary-orange)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-light-peach)',
              }}
            >
              <ArrowLeft size={14} /> Back to Orders
            </Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-dark-text)', marginTop: '8px' }}>
            Take Manual Order
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
            Record shopkeeper wholesale orders, counter sales, and telephone bookings directly into the system.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResetForNewOrder}
            style={{ fontSize: '13px', padding: '10px 16px' }}
          >
            Clear Form
          </button>
        </div>
      </div>

      {formError && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #F87171',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#B91C1C',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} />
          {formError}
        </div>
      )}

      {/* Main Form Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '24px' }}>
        {/* Left Column: Customer Details & Product Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AI VOICE BOT AUTO-FEED PANEL (Zero Twilio, Zero Ollama) */}
          <div
            className="card"
            style={{
              padding: '20px 24px',
              backgroundColor: '#FFFDF9',
              border: '2px solid #FED7AA',
              boxShadow: '0 4px 18px rgba(255, 129, 46, 0.08)',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header / Brand of the Voice Bot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: isListening ? '#EF4444' : 'var(--color-primary-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.5)' : '0 4px 10px rgba(255, 129, 46, 0.25)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isListening ? <Mic size={24} /> : <Bot size={24} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                      AI Voice Order Assistant & Auto-Feed
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={11} /> 100% Free • No Twilio • No Ollama
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                    Answers calls, asks shopkeeper details, detects target price/budget, auto-matches product variety & feeds this entire form!
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Step-by-Step Live Voice Bot Button */}
                <button
                  type="button"
                  onClick={startStepByStepVoice}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isListening || voiceStep > 0 ? '#DC2626' : 'var(--color-primary-orange)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(255, 129, 46, 0.3)',
                  }}
                >
                  {isListening || voiceStep > 0 ? (
                    <>
                      <MicOff size={14} /> Stop Step Assistant
                    </>
                  ) : (
                    <>
                      <Mic size={14} /> 🎙️ Start Step-by-Step Voice Call
                    </>
                  )}
                </button>

                {/* Recent Calls Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowCallsDrawer(!showCallsDrawer)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: showCallsDrawer ? 'var(--color-light-peach)' : '#F3F4F6',
                    color: 'var(--color-dark-text)',
                    border: '1px solid #E5E7EB',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <PhoneIncoming size={13} color="var(--color-primary-orange)" />
                  Real Calls ({recentCalls.length})
                  {showCallsDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Free Phone Setup Guide */}
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: showSetupGuide ? '#EFF6FF' : '#FFFFFF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="How to connect your actual phone number for 100% Free"
                >
                  <Info size={14} /> Connect My Phone (Free)
                </button>
              </div>
            </div>

            {/* Admin Set Bot Implementation Phone Number */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 16px',
                border: '1.5px solid #FED7AA',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803D',
                    flexShrink: 0,
                  }}
                >
                  <PhoneCall size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary-text)' }}>
                    Admin Bot Implementation Number (Target Calling SIM)
                  </div>
                  {isEditingBotPhone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>+91</span>
                      <input
                        type="text"
                        className="form-input"
                        value={tempBotPhone}
                        onChange={(e) => setTempBotPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        style={{ padding: '4px 10px', fontSize: '13px', width: '150px', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveBotPhone}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 800 }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingBotPhone(false);
                          setTempBotPhone(botPhoneNumber);
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-dark-text)', letterSpacing: '0.5px' }}>
                        +91 {botPhoneNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                        Bot Configured & Listening
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingBotPhone(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary-orange)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: '0 4px',
                        }}
                      >
                        Change Number
                      </button>
                      {phoneSavedToast && (
                        <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700 }}>
                          ✓ Number Saved!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '11.5px', color: '#4B5563', maxWidth: '420px', lineHeight: '1.4' }}>
                💡 <strong>SIM Call Connection:</strong> Phone par aane wali call ke liye apna phone <strong>Auto-Answer</strong> / <strong>Speaker ON</strong> rakhein ya call uthate hi upper <strong>"🎙️ Start Step-by-Step Voice Call"</strong> dabayein. Bot customer se 1-1 details puchh kar yahan auto-fill karega!
              </div>
            </div>

            {/* AI Voice Draft Orders Alert (Ready for 1-Click Feed) */}
            {voiceDrafts.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FEF3C7',
                  border: '1.5px solid #F59E0B',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color="#B45309" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                      ⚡ {voiceDrafts.length} AI Voice Call Draft Order(s) Awaiting Admin Review!
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#78350F', marginTop: '2px' }}>
                      Latest: <strong>{voiceDrafts[0].customerName}</strong> ({voiceDrafts[0].businessName || 'Store'}) — ₹{voiceDrafts[0].totalAmount || voiceDrafts[0].subtotal}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleFeedDraftIntoForm(voiceDrafts[0])}
                    style={{
                      padding: '7px 14px',
                      backgroundColor: '#B45309',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    📥 1-Click Feed into this Form
                  </button>
                </div>
              </div>
            )}

            {/* Step-by-Step Conversational Tracker */}
            <div
              style={{
                marginTop: '14px',
                marginBottom: '14px',
                backgroundColor: '#FFFFFF',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #FED7AA',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-dark-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={15} color="var(--color-primary-orange)" />
                  Sequential Questioning State (Customer se 1-1 input lene ke baad next sawaal):
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: voiceStep > 0 && voiceStep <= 4 ? '#FEF3C7' : '#F3F4F6',
                    color: voiceStep > 0 && voiceStep <= 4 ? '#92400E' : 'var(--color-secondary-text)',
                  }}
                >
                  {voiceStep === 0 ? 'Ready to Start' : voiceStep <= 4 ? `Step ${voiceStep} of 4 Active` : 'All Steps Completed'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {/* Step 1: Customer Name */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: customer.name ? '#ECFDF5' : voiceStep === 1 ? '#FFF7ED' : '#F9FAFB',
                    border: customer.name ? '1px solid #A7F3D0' : voiceStep === 1 ? '1.5px solid var(--color-primary-orange)' : '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: customer.name ? '#10B981' : voiceStep === 1 ? 'var(--color-primary-orange)' : '#D1D5DB',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {customer.name ? <Check size={12} /> : '1'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: customer.name ? '#065F46' : 'var(--color-dark-text)' }}>
                      1. Name
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {customer.name || 'Waiting...'}
                    </div>
                  </div>
                </div>

                {/* Step 2: Store Name */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: customer.businessName ? '#ECFDF5' : voiceStep === 2 ? '#FFF7ED' : '#F9FAFB',
                    border: customer.businessName ? '1px solid #A7F3D0' : voiceStep === 2 ? '1.5px solid var(--color-primary-orange)' : '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: customer.businessName ? '#10B981' : voiceStep === 2 ? 'var(--color-primary-orange)' : '#D1D5DB',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {customer.businessName ? <Check size={12} /> : '2'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: customer.businessName ? '#065F46' : 'var(--color-dark-text)' }}>
                      2. Store Name
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {customer.businessName || 'Waiting...'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Address & City */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: customer.street ? '#ECFDF5' : voiceStep === 3 ? '#FFF7ED' : '#F9FAFB',
                    border: customer.street ? '1px solid #A7F3D0' : voiceStep === 3 ? '1.5px solid var(--color-primary-orange)' : '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: customer.street ? '#10B981' : voiceStep === 3 ? 'var(--color-primary-orange)' : '#D1D5DB',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {customer.street ? <Check size={12} /> : '3'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: customer.street ? '#065F46' : 'var(--color-dark-text)' }}>
                      3. Address & City
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {customer.city || customer.street || 'Waiting...'}
                    </div>
                  </div>
                </div>

                {/* Step 4: Variety & Budget */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: selectedProduct ? '#ECFDF5' : voiceStep === 4 ? '#FFF7ED' : '#F9FAFB',
                    border: selectedProduct ? '1px solid #A7F3D0' : voiceStep === 4 ? '1.5px solid var(--color-primary-orange)' : '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: selectedProduct ? '#10B981' : voiceStep === 4 ? 'var(--color-primary-orange)' : '#D1D5DB',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {selectedProduct ? <Check size={12} /> : '4'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: selectedProduct ? '#065F46' : 'var(--color-dark-text)' }}>
                      4. Variety & Budget
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {selectedProduct ? 'Matched by Rate' : 'Waiting...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Active Step Input Controller (When Step Assistant is Running) */}
            {voiceStep >= 1 && voiceStep <= 4 && (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1.5px solid #F59E0B',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
                      Step {voiceStep} of 4: {voiceStep === 1 ? 'Customer Name' : voiceStep === 2 ? 'Store Name' : voiceStep === 3 ? 'Delivery Address & City' : 'Product, Weight & Quantity'}
                    </span>
                    {isBotSpeaking && (
                      <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>🔊 Bot bol raha hai...</span>
                    )}
                    {isListening && (
                      <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                        Mic Listening ({speechLang === 'en-IN' ? 'Hinglish' : 'Hindi'})... Bolkar batayein
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      title="Switch Speech Recognition Language"
                      onClick={() => {
                        const nextLang = speechLang === 'en-IN' ? 'hi-IN' : 'en-IN';
                        setSpeechLang(nextLang);
                        speechLangRef.current = nextLang;
                        if (isListening) {
                          listenForStepInput(voiceStep);
                        }
                      }}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid #D97706',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      🌐 {speechLang === 'en-IN' ? 'Lang: Hinglish' : 'Lang: Hindi'}
                    </button>
                    <button
                      type="button"
                      onClick={stopVoiceAssistant}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        fontSize: '11.5px',
                        fontWeight: 700,
                      }}
                    >
                      ✕ Stop Assistant
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder={
                      voiceStep === 1 ? 'Apna ya customer ka naam bolkar batayein ya type karein (e.g. Ramesh Sharma)' :
                      voiceStep === 2 ? 'Dukaan ka naam batayein (e.g. Sharma Kirana Store)' :
                      voiceStep === 3 ? 'Address aur City batayein (e.g. APMC Market, Navi Mumbai)' :
                      'Product aur Quantity batayein (e.g. California Almonds 1kg 5 packet)'
                    }
                    value={voiceTranscript}
                    onChange={(e) => {
                      setVoiceTranscript(e.target.value);
                      transcriptRef.current = e.target.value;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNextStep(voiceStep, voiceTranscript);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #FCD34D',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1F2937',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (_) {}
                        setIsListening(false);
                      } else {
                        listenForStepInput(voiceStep);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: isListening ? '#EF4444' : '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? 'Pause Mic' : 'Speak'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNextStep(voiceStep, voiceTranscript)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-primary-orange)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    Next Step <ArrowRight size={14} />
                  </button>
                </div>

                {/* Quick 1-Click Suggestion Chips for Fast Entry */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>⚡ 1-Click Fast Fill:</span>
                  {(voiceStep === 1 ? ['Ramesh Sharma', 'Suresh Patel', 'Rajesh Gupta', 'Amit Shah'] :
                    voiceStep === 2 ? ['Sharma Kirana Mart', 'Patel Supermarket', 'Royal Dry Fruits', 'Gupta Stores'] :
                    voiceStep === 3 ? ['APMC Market, Navi Mumbai', 'Market Yard, Pune', 'Dadar, Mumbai', 'Surat Ring Road'] :
                    ['California Almonds 1kg 5 packet', 'Cashews 500g 2 packet', 'Mamra Badam 250g 3 packet']
                  ).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setVoiceTranscript(option);
                        transcriptRef.current = option;
                        handleNextStep(voiceStep, option);
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #FCD34D',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#1F2937',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      + {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Voice Status / Transcript Display */}
            {(isListening || voiceTranscript || voiceBotStatus || isBotSpeaking) && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: isListening ? '1.5px solid #EF4444' : '1px solid #FED7AA',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isListening ? '#FEE2E2' : '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isListening ? '#EF4444' : 'var(--color-primary-orange)',
                    flexShrink: 0,
                  }}
                >
                  {isBotSpeaking ? <Volume2 size={18} /> : isListening ? <Mic size={18} /> : <Bot size={18} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary-text)' }}>
                    {isBotSpeaking ? 'Voice Bot Speaking (Hindi)' : isListening ? 'Listening Live to Caller...' : 'Voice Assistant Status'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-dark-text)', marginTop: '2px', wordBreak: 'break-word' }}>
                    {voiceTranscript ? `"${voiceTranscript}"` : voiceBotStatus || 'Voice session active...'}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Voice / Text Transcript Input (Optional direct test or paste from customer) */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                padding: '6px 10px',
                border: '1px solid #E5E7EB',
              }}
            >
              <input
                type="text"
                placeholder='Type or paste customer call transcript e.g. "Ramesh Sharma Navi Mumbai 9820012345 280 wala Mamra badam 250g ke 2 packet"'
                value={manualVoiceInput}
                onChange={(e) => setManualVoiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleParseVoiceText(manualVoiceInput);
                    setManualVoiceInput('');
                  }
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
                  color: 'var(--color-dark-text)',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  handleParseVoiceText(manualVoiceInput);
                  setManualVoiceInput('');
                }}
                disabled={!manualVoiceInput.trim()}
                style={{
                  backgroundColor: manualVoiceInput.trim() ? 'var(--color-primary-orange)' : '#E5E7EB',
                  color: manualVoiceInput.trim() ? '#FFFFFF' : '#9CA3AF',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: manualVoiceInput.trim() ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                }}
              >
                Auto-Feed Form
              </button>
            </div>

            {/* Free Phone Setup Guide Dropdown / Modal */}
            {showSetupGuide && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '16px 20px',
                  backgroundColor: '#EFF6FF',
                  borderRadius: '14px',
                  border: '1.5px solid #BFDBFE',
                  fontSize: '13px',
                  color: '#1E40AF',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={18} /> Apne Real Phone Number ko Free me Connect karne ka Tareeka (Zero Twilio, Zero Cost):
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSetupGuide(false)}
                    style={{ background: 'none', border: 'none', color: '#1E40AF', cursor: 'pointer', fontWeight: 800, fontSize: '15px' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #DBEAFE' }}>
                    <div style={{ fontWeight: 800, color: '#1E3A8A', marginBottom: '6px' }}>
                      📱 Method 1: Android Phone Call Automation (100% Automatic)
                    </div>
                    <ol style={{ margin: '0 0 0 16px', padding: 0, fontSize: '12px', lineHeight: 1.6, color: '#374151' }}>
                      <li>Google Play Store se free app <strong>"MacroDroid"</strong> install karein.</li>
                      <li>Trigger: <strong>Call Incoming</strong> (Any Number).</li>
                      <li>Actions: <strong>Answer Call</strong> → <strong>Speaker On</strong> → <strong>Text to Speech (Hindi)</strong>.</li>
                      <li>Customer se naam, dukaan aur unka target price/budget pooch kar record karein.</li>
                      <li>
                        HTTP POST request karein is Live URL par:
                        <div style={{ background: '#F1F5F9', padding: '6px 8px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', marginTop: '4px', wordBreak: 'break-all', color: '#0F172A' }}>
                          https://dryfruits-api.onrender.com/api/voice-bot/incoming-call
                        </div>
                      </li>
                      <li>Payload Body: <code>{`{"caller": "{call_number}", "transcript": "{speech_result}"}`}</code></li>
                    </ol>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #DBEAFE' }}>
                    <div style={{ fontWeight: 800, color: '#1E3A8A', marginBottom: '6px' }}>
                      🎙️ Method 2: Live Counter Assistant (Zero App Install)
                    </div>
                    <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '12px', lineHeight: 1.6, color: '#374151' }}>
                      <li>Jab customer aapke mobile par call kare, call receive karke <strong>Speakerphone</strong> on karein ya Bluetooth headset lagayein.</li>
                      <li>Upper <strong>"🎙️ Start Live Voice Call"</strong> button par click karein.</li>
                      <li>Browser ka AI bot Hindi me customer se unka naam, dukaan aur <strong>target price/budget</strong> poochega.</li>
                      <li>Target price ke according right variety (jaise ₹280 me Mamra Almonds) select ho kar screen par form auto-feed ho jayega.</li>
                      <li>Admin sab kuch review karke <strong>"Add Product to Order"</strong> click karega.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible Recent Calls Drawer */}
            {showCallsDrawer && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                    📞 Real Customer Phone Calls ({recentCalls.length})
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      const c = await mockApi.getRecentVoiceCalls();
                      setRecentCalls(c || []);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-orange)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={12} /> Refresh Calls
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {recentCalls.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-secondary-text)' }}>
                      <PhoneIncoming size={36} color="var(--color-primary-orange)" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--color-dark-text)' }}>
                        Waiting for Real Customer Phone Calls...
                      </div>
                      <p style={{ fontSize: '12px', marginTop: '4px', maxWidth: '440px', margin: '4px auto 0', lineHeight: 1.5 }}>
                        Jab koi customer aapke number par call karega ya counter par Live Voice Assistant on hoga, unka call yahan real-time me auto-feed ho jayega!
                      </p>
                    </div>
                  ) : (
                    recentCalls.map((call) => (
                      <div
                        key={call.id}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: '#FAF8F5',
                          borderRadius: '10px',
                          border: '1px solid #F0ECE4',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-dark-text)' }}>
                              {call.callerName || call.customer?.name || 'Customer'}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                              ({call.callerPhone || call.customer?.phone})
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                              }}
                            >
                              Target Price: ₹{call.targetPrice || call.selection?.targetPrice || 'N/A'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                            {call.businessName || call.customer?.businessName} • {call.city || call.customer?.city} •{' '}
                            <strong style={{ color: 'var(--color-primary-orange)' }}>
                              Matched: {call.matchedProductName || call.selection?.productName} ({call.matchedVariantTitle || call.selection?.variantTitle} × {call.quantity || call.selection?.quantity || 1})
                            </strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            autoFeedFromCall(call);
                            setShowCallsDrawer(false);
                          }}
                          style={{
                            backgroundColor: 'var(--color-primary-orange)',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 5px rgba(255, 129, 46, 0.25)',
                          }}
                        >
                          ⚡ Feed into Form
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Auto-Feed Success Notification */}
          {autoFeedBanner && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #34D399',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={20} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#065F46' }}>
                    🤖 AI Voice Bot Auto-Feed Completed ({autoFeedBanner.time})
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '2px' }}>
                    {autoFeedBanner.text}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#065F46', marginTop: '4px', fontWeight: 600 }}>
                    👉 Step 1 (Store details) & Step 2 (Product Variety matched by ₹{autoFeedBanner.price} target budget) are populated! Review or edit anything below, then click <strong>"Add Product to Order"</strong> or <strong>"Confirm Order"</strong>.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoFeedBanner(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Card 1: Shopkeeper & Business Information */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--color-light-border)', paddingBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-light-peach)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-orange)',
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                  1. Shopkeeper & Store Details
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-secondary-text)' }}>
                  Enter merchant name, store identity, GST number, and delivery destination.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Shopkeeper / Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Bhai Sharma"
                  className="form-input"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Business Name / Store Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Kirana & Dry Fruits Mart"
                  className="form-input"
                  value={customer.businessName}
                  onChange={(e) => setCustomer({ ...customer, businessName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Contact Phone / Mobile *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9820012345"
                  className="form-input"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27AAACS1234A1Z5"
                  className="form-input"
                  value={customer.gstNumber}
                  onChange={(e) => setCustomer({ ...customer, gstNumber: e.target.value.toUpperCase() })}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Store / Delivery Address (Street & Market)
                </label>
                <input
                  type="text"
                  placeholder="Shop No. 12, APMC Grain Market, Sector 19"
                  className="form-input"
                  value={customer.street}
                  onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Navi Mumbai / Pune"
                  className="form-input"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    className="form-input"
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    className="form-input"
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Cascading Product Selection */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--color-light-border)', paddingBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-light-peach)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-orange)',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                  2. Select Products (Cascading Category & Variety)
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-secondary-text)' }}>
                  Pick Category → Filter Subcategory → Select Variety → Choose Weight & Pack Quantity.
                </p>
              </div>
            </div>

            {/* Cascading Dropdowns Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Step 1: Category Dropdown */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--color-primary-orange)' }}>
                  Step 1: Select Main Category *
                </label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{ border: '1.5px solid var(--color-primary-orange)' }}
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Subcategory Dropdown */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--color-primary-orange)' }}>
                  Step 2: Select Subcategory *
                </label>
                <select
                  className="form-select"
                  value={selectedSubcategory}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  disabled={!selectedCategory}
                  style={{ backgroundColor: !selectedCategory ? '#F5F5F5' : '#FFFFFF' }}
                >
                  <option value="">
                    {!selectedCategory ? '-- First select category --' : '-- Choose Subcategory --'}
                  </option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Product / Variety Dropdown */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--color-primary-orange)' }}>
                  Step 3: Select Product Variety *
                </label>
                <select
                  className="form-select"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={!selectedCategory}
                  style={{ backgroundColor: !selectedCategory ? '#F5F5F5' : '#FFFFFF' }}
                >
                  <option value="">
                    {!selectedCategory
                      ? '-- First select category & subcategory --'
                      : availableProducts.length === 0
                      ? '-- No matching varieties found --'
                      : '-- Choose Product Variety --'}
                  </option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.brand ? `(${p.brand})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Weight Variant Dropdown */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px' }}>
                  Step 4: Select Weight Variant *
                </label>
                <select
                  className="form-select"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  disabled={!currentProduct}
                >
                  {availableVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} — ₹{v.price} ({v.stockQuantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 5: Quantity in Packs / Numbers */}
              <div>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '12.5px' }}>
                  Step 5: Quantity (Packs / Units) *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className="form-input"
                    value={customWeightQty}
                    onChange={(e) => setCustomWeightQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{ fontWeight: 700, fontSize: '15px' }}
                  />
                  <div
                    style={{
                      padding: '0 16px',
                      backgroundColor: 'var(--color-light-peach)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 700,
                      color: 'var(--color-primary-orange)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    = ₹{currentItemPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Item Button */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddItem}
                disabled={!currentProduct}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                <Plus size={18} /> Add Product to Order
              </button>
            </div>
          </div>

          {/* Card 3: Added Items Table */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)' }}>
                3. Order Items ({items.length})
              </h3>
              {items.length > 0 && (
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  Subtotal: ₹{subtotal.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {items.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Variety</th>
                      <th>Category</th>
                      <th>Weight</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-dark-text)' }}>
                          {it.productName}
                        </td>
                        <td>
                          <span className="badge badge-peach">{it.categoryName}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{it.variantTitle}</td>
                        <td>₹{it.price.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ fontWeight: 800, fontSize: '14px' }}>{it.quantity}</span>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                          ₹{it.total.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-secondary-text)' }}>
                <ShoppingBag size={36} color="var(--color-secondary-text)" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: 600 }}>No items added yet.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  Use the cascading dropdowns above to select Category, Subcategory, Variety, and Weight to add products.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing Summary & Payment Confirmation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 4: Order Summary & Pricing */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)', marginBottom: '18px' }}>
              4. Order Bill Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px dashed var(--color-light-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Items Subtotal ({items.length} lines):</span>
                <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Wholesale Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  style={{ width: '100px', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Delivery / Freight Fee (₹):</span>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  style={{ width: '100px', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>

            {/* Grand Total */}
            <div
              style={{
                backgroundColor: 'var(--color-light-peach)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, color: 'var(--color-secondary-text)' }}>
                  Payable Grand Total
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </h2>
              </div>
              <span className="badge badge-success" style={{ fontWeight: 700 }}>
                {paymentStatus}
              </span>
            </div>

            {/* Card 5: Payment & Order Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Payment Method *
                </label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash on Delivery (COD) / Counter Cash</option>
                  <option value="UPI">UPI / QR Code (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                  <option value="Cheque">Cheque Payment</option>
                  <option value="Store Credit">Store Credit / 15-Day Khata (Pay Later)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Payment Status
                  </label>
                  <select
                    className="form-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending / Unpaid</option>
                    <option value="Partial">Partial Payment</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Order Dispatch Status
                  </label>
                  <select
                    className="form-select"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  Delivery Instructions / Special Notes
                </label>
                <textarea
                  rows="2"
                  className="form-input"
                  placeholder="e.g. Deliver via APMC Gate No. 2, call before unloading..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm & Place Order Button */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmOrder}
              disabled={submitting || items.length === 0}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              }}
            >
              <FileCheck2 size={20} />
              {submitting ? 'Creating Order in System...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {confirmedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-dark-text)', marginBottom: '6px' }}>
              Manual Order Placed Successfully!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '20px' }}>
              Order has been confirmed, assigned an ID, and registered under Customer records.
            </p>

            <div
              style={{
                backgroundColor: '#FAF5ED',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Order ID:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary-orange)' }}>{confirmedOrder.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Shopkeeper:</span>
                <span style={{ fontWeight: 700 }}>{confirmedOrder.customer?.name}</span>
              </div>
              {confirmedOrder.customer?.businessName && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-secondary-text)' }}>Store Name:</span>
                  <span style={{ fontWeight: 700 }}>{confirmedOrder.customer?.businessName}</span>
                </div>
              )}
              {confirmedOrder.customer?.gstNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-secondary-text)' }}>GST Number:</span>
                  <span style={{ fontWeight: 700 }}>{confirmedOrder.customer?.gstNumber}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary-text)' }}>Items Ordered:</span>
                <span style={{ fontWeight: 700 }}>{confirmedOrder.items?.length || 0} product lines</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E7DAC9', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontWeight: 800 }}>Total Amount:</span>
                <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-primary-orange)' }}>
                  ₹{Number(confirmedOrder.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push('/orders')}
                style={{ padding: '12px', fontSize: '13.5px', fontWeight: 700 }}
              >
                View in All Orders
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleResetForNewOrder}
                style={{ padding: '12px', fontSize: '13.5px', fontWeight: 700 }}
              >
                Take Another Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Verification Modal (Per User Rule: Direct feed nahi hoga, pehle admin verify karega tab hi form me aayega) */}
      {showVerificationModal && verificationPendingCall && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              maxWidth: '620px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '2px solid #FED7AA',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                backgroundColor: '#FFF7ED',
                borderBottom: '1.5px solid #FED7AA',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary-orange)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-dark-text)', margin: 0 }}>
                    Admin Verification Required
                  </h3>
                  <p style={{ fontSize: '12px', color: '#C2410C', margin: '2px 0 0', fontWeight: 600 }}>
                    Pehle verify karein, approve karne par hi data order form me feed hoga.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDiscardCall}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Editable Form */}
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ backgroundColor: '#F0FDF4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #BBF7D0', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#16A34A" />
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>
                  Customer voice details recorded. You can review or edit any field below:
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                    Shopkeeper Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={verificationPendingCall.callerName}
                    onChange={(e) => setVerificationPendingCall({ ...verificationPendingCall, callerName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                    Store / Business Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={verificationPendingCall.businessName}
                    onChange={(e) => setVerificationPendingCall({ ...verificationPendingCall, businessName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    value={verificationPendingCall.callerPhone}
                    onChange={(e) => setVerificationPendingCall({ ...verificationPendingCall, callerPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={verificationPendingCall.city}
                    onChange={(e) => setVerificationPendingCall({ ...verificationPendingCall, city: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700 }}>
                    Store / Delivery Address
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={verificationPendingCall.address}
                    onChange={(e) => setVerificationPendingCall({ ...verificationPendingCall, address: e.target.value })}
                  />
                </div>

                {/* Matched Variety and Target Price */}
                <div style={{ gridColumn: 'span 2', backgroundColor: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary-orange)' }}>
                      🏷️ AI Variety Selection (Matched by Budget Rate)
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px' }}>
                      Customer Target Budget: ₹{verificationPendingCall.targetPrice || 'N/A'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                        Selected Product Variety
                      </label>
                      <select
                        className="form-select"
                        value={verificationPendingCall.matchedProductId}
                        onChange={(e) => {
                          const found = products.find((p) => p.id === e.target.value);
                          if (found) {
                            setVerificationPendingCall({
                              ...verificationPendingCall,
                              matchedProductId: found.id,
                              matchedProductName: found.name,
                              price: Number(found.variants?.[0]?.price || 0),
                              matchedVariantTitle: found.variants?.[0]?.title || '100 GM',
                            });
                          }
                        }}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₹{p.variants?.[0]?.price || 0}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>
                        Quantity (Packs)
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={verificationPendingCall.quantity}
                        onChange={(e) => setVerificationPendingCall({ ...verificationPendingCall, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '16px 24px',
                backgroundColor: '#F9FAFB',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={handleDiscardCall}
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '10px 18px' }}
              >
                Discard / Reject
              </button>

              <button
                type="button"
                onClick={() => handleApproveAndFeed(verificationPendingCall)}
                className="btn-primary"
                style={{
                  fontSize: '13px',
                  padding: '10px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 800,
                }}
              >
                <Check size={16} /> Approve & Feed into Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

