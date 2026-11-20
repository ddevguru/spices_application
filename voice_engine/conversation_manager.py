import re
import json
import logging
from catalogue_client import catalogue_client

logger = logging.getLogger("ConversationManager")

class CallSessionState:
    def __init__(self, call_id, caller_phone):
        self.call_id = call_id
        self.caller_phone = caller_phone
        self.is_registered = False
        self.customer_name = ""
        self.business_name = ""
        self.gst_number = ""
        self.street = ""
        self.city = ""
        self.state = "Maharashtra"
        self.pincode = ""
        self.delivery_instructions = ""
        
        # Shopping cart of multiple items
        self.items = [] # [{ product_id, product_name, variant_id, variant_title, quantity, price, weight }]
        
        # Dialogue state: 'GREETING', 'CUSTOMER_NAME', 'STORE_NAME', 'ADDRESS', 'PRODUCT_SELECTION', 'WEIGHT_SELECTION', 'QUANTITY_SELECTION', 'ASK_MORE', 'ORDER_SUMMARY', 'COMPLETED'
        self.stage = 'GREETING'
        
        # Current item under selection
        self.pending_category = None
        self.pending_subcategory = None
        self.pending_product = None
        self.pending_variant = None
        
        self.transcript_history = []
        self.requires_human_help = False

    def to_draft_payload(self):
        return {
            "customer": {
                "name": self.customer_name or "Valued Shopkeeper",
                "phone": self.caller_phone,
                "business_name": self.business_name or "Kirana Store",
                "gst_number": self.gst_number or None,
                "email": f"{self.caller_phone}@store.naturale.com"
            },
            "delivery": {
                "address": self.street or "Shop Delivery",
                "city": self.city or "Navi Mumbai",
                "state": self.state or "Maharashtra",
                "pincode": self.pincode or "400705"
            },
            "items": [
                {
                    "product_id": it["product_id"],
                    "variant_id": it.get("variant_id"),
                    "quantity": it.get("quantity", 1)
                }
                for it in self.items
            ],
            "delivery_instructions": self.delivery_instructions or ""
        }

class ConversationManager:
    def __init__(self):
        self.sessions = {} # call_id -> CallSessionState
        self.cached_categories = []
        self.cached_products = []
        self._refresh_catalogue_cache()

    def _refresh_catalogue_cache(self):
        try:
            self.cached_categories = catalogue_client.get_categories() or []
            self.cached_products = catalogue_client.get_products() or []
        except Exception as e:
            logger.warn(f"Catalogue cache refresh note: {e}")

    def get_or_create_session(self, call_id, caller_phone):
        if call_id not in self.sessions:
            session = CallSessionState(call_id, caller_phone)
            # 1. Lookup customer in existing database
            lookup = catalogue_client.lookup_customer(caller_phone)
            if lookup.get("isRegistered"):
                cust = lookup.get("customer", {})
                session.is_registered = True
                session.customer_name = cust.get("name", "")
                session.business_name = cust.get("businessName", "")
                session.gst_number = cust.get("gstNumber", "")
                session.city = cust.get("city", "")
                addr = cust.get("address", {})
                session.street = addr.get("street", "")
                session.pincode = addr.get("pincode", "")
            
            # Start call record in backend
            catalogue_client.start_call_session(call_id, caller_phone, session.customer_name, session.business_name)
            self.sessions[call_id] = session
        return self.sessions[call_id]

    def get_initial_greeting(self, session):
        if session.is_registered and session.customer_name:
            greeting = f"नमस्ते {session.customer_name} जी! NATURALE ड्राई फ्रूट्स में आपका फिर से स्वागत है। क्या आज आपकी दुकान {session.business_name or ''} के लिए नया होलसेल आर्डर लगाना है?"
            session.stage = 'PRODUCT_SELECTION'
        else:
            greeting = "नमस्ते! NATURALE में आपका स्वागत है। क्या आप होलसेल ड्राई फ्रूट्स या मसालों का आर्डर प्लेस करना चाहते हैं? कृपया पहले अपना नाम बताएं?"
            session.stage = 'CUSTOMER_NAME'
        
        session.transcript_history.append({"speaker": "AI", "text": greeting})
        return greeting

    def process_customer_speech(self, call_id, user_speech):
        session = self.sessions.get(call_id)
        if not session:
            return "नमस्ते! कृपया दोबारा बताएं?"

        text = (user_speech or "").strip()
        lower = text.lower()
        session.transcript_history.append({"speaker": "Customer", "text": text})

        logger.info(f"[{call_id}] Stage: {session.stage} | Customer said: {text}")

        # Check for emergency / human handover request
        if any(w in lower for w in ["insan", "human", "agent se baat", "manager", "complaint", "kisi se baat karao"]):
            session.requires_human_help = True
            reply = "जी बिल्कुल, मैं आपकी कॉल NATURALE सपोर्ट टीम को ट्रांसफर कर रहा हूँ। कृपया लाइन पर बने रहें।"
            session.transcript_history.append({"speaker": "AI", "text": reply})
            return reply

        # Stage 1: Customer Name
        if session.stage == 'CUSTOMER_NAME':
            name = re.sub(r'^(namaste|hello|mera naam|naam hai|main hoon|main|haan|ji)\s+', '', text, flags=re.I).strip()
            name = re.sub(r'\s+(bol raha hoon|hai|se)$', '', name, flags=re.I).strip()
            session.customer_name = name or text
            session.stage = 'STORE_NAME'
            reply = f"धन्यवाद {session.customer_name} जी! आपकी दुकान या व्यापारिक फर्म का क्या नाम है?"
            session.transcript_history.append({"speaker": "AI", "text": reply})
            return reply

        # Stage 2: Store / Business Name
        if session.stage == 'STORE_NAME':
            biz = re.sub(r'^(meri dukaan|shop|store|humari dukaan|naam hai)\s+', '', text, flags=re.I).strip()
            session.business_name = biz or text
            session.stage = 'ADDRESS'
            reply = "आपकी दुकान का डिलीवरी एड्रेस और शहर कौन सा है?"
            session.transcript_history.append({"speaker": "AI", "text": reply})
            return reply

        # Stage 3: Address & City
        if session.stage == 'ADDRESS':
            session.street = text
            cities = ['Navi Mumbai', 'Mumbai', 'Pune', 'Thane', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur', 'Delhi', 'Surat', 'Ahmedabad', 'Indore']
            for c in cities:
                if c.lower() in lower:
                    session.city = c
                    break
            if not session.city:
                session.city = 'Navi Mumbai'

            pin = re.search(r'\b([1-9]\d{5})\b', text)
            if pin:
                session.pincode = pin.group(1)

            session.stage = 'PRODUCT_SELECTION'
            reply = "बहुत बढ़िया! आपको कौन सा प्रोडक्ट चाहिए? जैसे बादाम (Almonds), काजू (Cashews), किशमिश, पिस्ता, या कोई मसाला?"
            session.transcript_history.append({"speaker": "AI", "text": reply})
            return reply

        # Stage 4: Product Selection & Extraction
        if session.stage in ['PRODUCT_SELECTION', 'ASK_MORE']:
            # Search matching products dynamically
            matched_product = self._match_product_from_speech(lower)
            if matched_product:
                session.pending_product = matched_product
                # Check if customer already mentioned weight and quantity in the same sentence
                extracted = self._extract_weight_and_qty(lower, matched_product)
                if extracted.get("variant") and extracted.get("quantity"):
                    # Both present! Add directly to cart
                    v = extracted["variant"]
                    q = extracted["quantity"]
                    session.items.append({
                        "product_id": matched_product["id"],
                        "product_name": matched_product["name"],
                        "variant_id": v["id"],
                        "variant_title": v["title"],
                        "weight_in_grams": v.get("weightInGrams", 1000),
                        "price": v.get("price", 0),
                        "quantity": q
                    })
                    session.stage = 'ASK_MORE'
                    reply = f"{matched_product['name']} का {v['title']} के {q} पैकेट नोट कर लिए हैं। क्या आपको कोई और प्रोडक्ट भी चाहिए?"
                    session.transcript_history.append({"speaker": "AI", "text": reply})
                    return reply
                else:
                    # Fetch available weight variants dynamically from backend
                    variants = catalogue_client.get_variants(matched_product["id"]) or matched_product.get("variants", [])
                    weight_titles = [v["title"] for v in variants]
                    session.stage = 'WEIGHT_SELECTION'
                    reply = f"{matched_product['name']} में उपलब्ध पैक हैं: {', '.join(weight_titles)}। आपको कौन सा वजन चाहिए?"
                    session.transcript_history.append({"speaker": "AI", "text": reply})
                    return reply
            elif session.stage == 'ASK_MORE' and any(w in lower for w in ['nahi', 'bas', 'done', 'nahi chahiye', 'complete', 'final karo', 'aur kuch nahi']):
                # Move to summary confirmation
                return self._generate_order_summary(session)
            else:
                reply = "क्षमा करें, यह प्रोडक्ट हमारी लिस्ट में नहीं मिला। हमारे पास बादाम, काजू, किशमिश, पिस्ता, अखरोट और मसाले उपलब्ध हैं। आप कौन सा लेना चाहेंगे?"
                session.transcript_history.append({"speaker": "AI", "text": reply})
                return reply

        # Stage 5: Weight Variant Selection
        if session.stage == 'WEIGHT_SELECTION':
            product = session.pending_product
            variants = catalogue_client.get_variants(product["id"]) or product.get("variants", [])
            matched_var = self._match_variant_from_speech(lower, variants)
            if matched_var:
                session.pending_variant = matched_var
                # Check quantity
                qty_match = re.search(r'(\d+)\s*(?:packet|packs?|kilo|kg|box|piece|pece)?', lower)
                if qty_match and int(qty_match.group(1)) > 0:
                    q = int(qty_match.group(1))
                    session.items.append({
                        "product_id": product["id"],
                        "product_name": product["name"],
                        "variant_id": matched_var["id"],
                        "variant_title": matched_var["title"],
                        "weight_in_grams": matched_var.get("weightInGrams", 1000),
                        "price": matched_var.get("price", 0),
                        "quantity": q
                    })
                    session.pending_product = None
                    session.pending_variant = None
                    session.stage = 'ASK_MORE'
                    reply = f"{product['name']} ({matched_var['title']}) के {q} पैकेट जोड़ दिए गए हैं। क्या आपको कोई और आइटम चाहिए?"
                    session.transcript_history.append({"speaker": "AI", "text": reply})
                    return reply
                else:
                    session.stage = 'QUANTITY_SELECTION'
                    reply = f"{matched_var['title']} पैक के आपको कितने पैकेट चाहिए?"
                    session.transcript_history.append({"speaker": "AI", "text": reply})
                    return reply
            else:
                available = ", ".join([v["title"] for v in variants])
                reply = f"कृपया उपलब्ध वजन में से बताएं: {available}?"
                session.transcript_history.append({"speaker": "AI", "text": reply})
                return reply

        # Stage 6: Quantity Selection
        if session.stage == 'QUANTITY_SELECTION':
            qty_match = re.search(r'(\d+)', lower)
            q = int(qty_match.group(1)) if qty_match else 1
            product = session.pending_product
            variant = session.pending_variant
            session.items.append({
                "product_id": product["id"],
                "product_name": product["name"],
                "variant_id": variant["id"],
                "variant_title": variant["title"],
                "weight_in_grams": variant.get("weightInGrams", 1000),
                "price": variant.get("price", 0),
                "quantity": q
            })
            session.pending_product = None
            session.pending_variant = None
            session.stage = 'ASK_MORE'
            reply = f"{product['name']} ({variant['title']}) के {q} पैकेट नोट कर लिए हैं। क्या आपको कोई और आइटम भी जोड़ना है?"
            session.transcript_history.append({"speaker": "AI", "text": reply})
            return reply

        # Stage 7: Order Summary Confirmation
        if session.stage == 'ORDER_SUMMARY':
            if any(w in lower for w in ['haan', 'yes', 'sahi', 'theek', 'confirm', 'barabar', 'ha']):
                # Submit Draft to Backend!
                draft_res = catalogue_client.create_draft_order(
                    call_id=session.call_id,
                    customer={
                        "name": session.customer_name,
                        "phone": session.caller_phone,
                        "business_name": session.business_name,
                        "gst_number": session.gst_number
                    },
                    delivery={
                        "address": session.street,
                        "city": session.city,
                        "state": session.state,
                        "pincode": session.pincode
                    },
                    items=session.items,
                    delivery_instructions=session.delivery_instructions
                )
                session.stage = 'COMPLETED'
                # End call log in backend
                full_transcript = " | ".join([f"{t['speaker']}: {t['text']}" for t in session.transcript_history])
                catalogue_client.end_call_session(
                    call_id=session.call_id,
                    duration_seconds=60,
                    status="completed",
                    transcript=full_transcript,
                    draft_id=draft_res.get("draft", {}).get("id") if draft_res else None
                )
                reply = "जी बहुत-बहुत धन्यवाद! आपका आर्डर ड्राफ्ट NATURALE एडमिन के पास वेरिफिकेशन के लिए दर्ज हो चुका है। एडमिन द्वारा कन्फर्म होते ही आपको डिस्पैच की जानकारी मिल जाएगी। शुभ दिन!"
                session.transcript_history.append({"speaker": "AI", "text": reply})
                return reply
            else:
                reply = "आप अपने आर्डर में क्या बदलाव करना चाहते हैं? कृपया बताएं?"
                session.stage = 'PRODUCT_SELECTION'
                session.transcript_history.append({"speaker": "AI", "text": reply})
                return reply

        return "जी, कृपया दोबारा बताएं?"

    def _generate_order_summary(self, session):
        if not session.items:
            session.stage = 'PRODUCT_SELECTION'
            return "आपने अभी कोई आइटम नहीं जोड़ा है। आपको कौन सा प्रोडक्ट चाहिए?"

        item_lines = []
        total_est = 0
        for it in session.items:
            sub = it['price'] * it['quantity']
            total_est += sub
            item_lines.append(f"{it['product_name']} - {it['variant_title']} के {it['quantity']} पैकेट")

        summary_text = " । ".join(item_lines)
        session.stage = 'ORDER_SUMMARY'
        reply = (
            f"आर्डर सबमिट करने से पहले कृपया अपनी डिटेल्स सुन लीजिए: "
            f"दुकान: {session.business_name or session.customer_name}, पता: {session.city}। "
            f"आइटम्स: {summary_text}। "
            f"क्या यह पूरी जानकारी सही है?"
        )
        session.transcript_history.append({"speaker": "AI", "text": reply})
        return reply

    def _match_product_from_speech(self, lower):
        if not self.cached_products:
            self._refresh_catalogue_cache()

        # Keyword mapping for quick local disambiguation
        keywords = {
            "almond": "Almonds", "badam": "Almonds", "mamra": "Almonds", "gurbandi": "Almonds",
            "cashew": "Cashews", "kaju": "Cashews",
            "pista": "Pistachios", "pistachio": "Pistachios",
            "walnut": "Walnuts", "akhrot": "Walnuts",
            "date": "Dates", "khajoor": "Dates", "ajwa": "Dates",
            "raisin": "Raisins", "kishmish": "Raisins",
            "anjeer": "Anjeer", "fig": "Anjeer",
            "cardamom": "Green Cardamom", "elaichi": "Green Cardamom",
            "pepper": "Black Pepper", "mirch": "Black Pepper", "kali mirch": "Black Pepper",
            "cinnamon": "Cinnamon Sticks", "dalchini": "Cinnamon Sticks",
            "clove": "Cloves", "laung": "Cloves",
            "garam masala": "Garam Masala", "haldi": "Turmeric Powder", "turmeric": "Turmeric Powder",
            "oat": "Rolled Oats", "quinoa": "Quinoa"
        }

        matched_sub = None
        for k, v in keywords.items():
            if k in lower:
                matched_sub = v
                break

        if matched_sub:
            candidates = [p for p in self.cached_products if (p.get("subcategoryId") or p.get("subcategoryName") or "").lower() == matched_sub.lower() or matched_sub.lower() in p["name"].lower()]
            if candidates:
                return candidates[0]

        # Direct name match
        for p in self.cached_products:
            if p["name"].lower() in lower:
                return p

        return None

    def _extract_weight_and_qty(self, lower, product):
        variants = product.get("variants") or catalogue_client.get_variants(product["id"])
        matched_var = self._match_variant_from_speech(lower, variants)
        
        qty = 1
        qm = re.search(r'(\d+)\s*(?:packet|packs?|piece|kilo|box)', lower)
        if qm:
            qty = int(qm.group(1))

        return {"variant": matched_var, "quantity": qty if matched_var else None}

    def _match_variant_from_speech(self, lower, variants):
        if not variants:
            return None

        if "100" in lower or "sau gram" in lower:
            v = next((v for v in variants if v.get("weightInGrams") == 100), None)
            if v: return v
        if "250" in lower or "pav" in lower or "dhai sau" in lower:
            v = next((v for v in variants if v.get("weightInGrams") == 250), None)
            if v: return v
        if "500" in lower or "aadha kilo" in lower or "half kg" in lower:
            v = next((v for v in variants if v.get("weightInGrams") == 500), None)
            if v: return v
        if "1 kilo" in lower or "1 kg" in lower or "ek kilo" in lower:
            v = next((v for v in variants if v.get("weightInGrams") == 1000), None)
            if v: return v

        # Fallback to largest or first variant
        return variants[0]

conversation_manager = ConversationManager()

