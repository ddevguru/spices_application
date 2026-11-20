import requests
import json
import logging
from config import config

logger = logging.getLogger("CatalogueClient")

class CatalogueClient:
    def __init__(self):
        self.base_url = config.BACKEND_API_BASE
        self.headers = {
            "Content-Type": "application/json",
            "x-voice-api-key": config.INTERNAL_VOICE_API_KEY
        }
        self.timeout = 10

    def get_categories(self):
        try:
            res = requests.get(f"{self.base_url}/catalogue/categories", headers=self.headers, timeout=self.timeout)
            if res.status_code == 200:
                data = res.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching categories: {e}")
        return []

    def get_subcategories(self, category_name=None):
        try:
            params = {}
            if category_name:
                params["category"] = category_name
            res = requests.get(f"{self.base_url}/catalogue/subcategories", headers=self.headers, params=params, timeout=self.timeout)
            if res.status_code == 200:
                data = res.json()
                return data.get("subcategories", [])
        except Exception as e:
            logger.error(f"Error fetching subcategories: {e}")
        return []

    def get_products(self, subcategory=None, category=None, search=None):
        try:
            params = {}
            if subcategory:
                params["subcategory"] = subcategory
            if category:
                params["category"] = category
            if search:
                params["search"] = search
            res = requests.get(f"{self.base_url}/catalogue/products", headers=self.headers, params=params, timeout=self.timeout)
            if res.status_code == 200:
                data = res.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
        return []

    def get_variants(self, product_id):
        try:
            res = requests.get(f"{self.base_url}/catalogue/variants", headers=self.headers, params={"productId": product_id}, timeout=self.timeout)
            if res.status_code == 200:
                data = res.json()
                return data.get("variants", [])
        except Exception as e:
            logger.error(f"Error fetching variants for {product_id}: {e}")
        return []

    def check_availability(self, variant_id, quantity=1):
        try:
            res = requests.get(
                f"{self.base_url}/catalogue/check-availability",
                headers=self.headers,
                params={"variantId": variant_id, "quantity": quantity},
                timeout=self.timeout
            )
            if res.status_code == 200:
                return res.json()
        except Exception as e:
            logger.error(f"Error checking availability: {e}")
        return {"isAvailable": True}

    def lookup_customer(self, phone):
        try:
            res = requests.get(f"{self.base_url}/customer/lookup", headers=self.headers, params={"phone": phone}, timeout=self.timeout)
            if res.status_code == 200:
                return res.json()
        except Exception as e:
            logger.error(f"Error looking up customer by phone {phone}: {e}")
        return {"isRegistered": False}

    def start_call_session(self, call_id, caller_phone, customer_name=None, business_name=None):
        try:
            payload = {
                "call_id": call_id,
                "caller_phone": caller_phone,
                "customer_name": customer_name,
                "business_name": business_name
            }
            res = requests.post(f"{self.base_url}/calls/start", headers=self.headers, json=payload, timeout=self.timeout)
            return res.json() if res.status_code in [200, 201] else {}
        except Exception as e:
            logger.error(f"Error starting call session: {e}")
        return {}

    def end_call_session(self, call_id, duration_seconds=0, status="completed", transcript="", recording_url=None, human_help=False, draft_id=None):
        try:
            payload = {
                "call_id": call_id,
                "duration_seconds": duration_seconds,
                "status": status,
                "transcript": transcript,
                "recording_url": recording_url,
                "requires_human_intervention": human_help,
                "draft_order_id": draft_id
            }
            res = requests.post(f"{self.base_url}/calls/end", headers=self.headers, json=payload, timeout=self.timeout)
            return res.json() if res.status_code == 200 else {}
        except Exception as e:
            logger.error(f"Error ending call session: {e}")
        return {}

    def create_draft_order(self, call_id, customer, delivery, items, delivery_instructions=""):
        try:
            payload = {
                "source": "ai_voice",
                "call_id": call_id,
                "customer": customer,
                "delivery": delivery,
                "items": items,
                "delivery_instructions": delivery_instructions,
                "status": "pending_admin_review"
            }
            res = requests.post(f"{self.base_url}/drafts", headers=self.headers, json=payload, timeout=self.timeout)
            if res.status_code in [200, 201]:
                return res.json()
            else:
                logger.error(f"Draft order creation returned {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Error creating draft order: {e}")
        return None

catalogue_client = CatalogueClient()
