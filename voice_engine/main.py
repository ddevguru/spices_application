import asyncio
import json
import logging
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from config import config
from catalogue_client import catalogue_client
from conversation_manager import conversation_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("NaturaleVoiceEngine")

app = FastAPI(
    title="NATURALE AI Voice Calling Engine",
    description="Asterisk PBX + faster-whisper + Ollama + Piper TTS Wholesale Order Voice Agent",
    version="1.0.0"
)

class ChatRequest(BaseModel):
    call_id: str
    caller_phone: str = "9820012345"
    message: str

class SimulateCallRequest(BaseModel):
    caller_phone: str = "9820012345"
    customer_name: Optional[str] = "Ramesh Bhai Sharma"
    business_name: Optional[str] = "Sharma Kirana & Dry Fruits Mart"
    city: Optional[str] = "Navi Mumbai"
    conversation_steps: Optional[List[str]] = [
        "Namaste, main Ramesh Sharma bol raha hoon",
        "Sharma Kirana Mart",
        "APMC Market, Sector 19, Navi Mumbai",
        "California Almonds 1 kg ke 5 packet aur Cashews 500 gram ke 2 packet",
        "Aur kuch nahi, bas itna hi",
        "Haan, saari details bilkul sahi hain"
    ]

@app.get("/")
def root():
    return {
        "service": "NATURALE AI Voice Calling Engine",
        "status": "online",
        "asterisk_target": f"{config.ASTERISK_HOST}:{config.ASTERISK_ARI_PORT}",
        "backend_target": config.BACKEND_API_BASE
    }

@app.get("/health")
def health_check():
    categories = catalogue_client.get_categories()
    return {
        "status": "healthy",
        "backend_connected": len(categories) > 0,
        "categories_cached": len(categories),
        "ollama_host": config.OLLAMA_HOST,
        "whisper_model": config.WHISPER_MODEL
    }

@app.post("/chat")
def chat_turn(req: ChatRequest):
    session = conversation_manager.get_or_create_session(req.call_id, req.caller_phone)
    if not req.message:
        greeting = conversation_manager.get_initial_greeting(session)
        return {
            "call_id": req.call_id,
            "stage": session.stage,
            "ai_reply": greeting,
            "items": session.items
        }

    ai_reply = conversation_manager.process_customer_speech(req.call_id, req.message)
    return {
        "call_id": req.call_id,
        "stage": session.stage,
        "ai_reply": ai_reply,
        "items": session.items
    }

@app.post("/simulate-call")
def simulate_full_call(req: SimulateCallRequest):
    import time
    call_id = f"sim_{int(time.time())}"
    session = conversation_manager.get_or_create_session(call_id, req.caller_phone)
    
    transcript_log = []
    
    # 1. Greeting
    greeting = conversation_manager.get_initial_greeting(session)
    transcript_log.append({"speaker": "AI", "text": greeting})

    # 2. Steps
    for step in req.conversation_steps:
        transcript_log.append({"speaker": "Customer", "text": step})
        reply = conversation_manager.process_customer_speech(call_id, step)
        transcript_log.append({"speaker": "AI", "text": reply})

    return {
        "success": True,
        "call_id": call_id,
        "final_stage": session.stage,
        "customer": {
            "name": session.customer_name,
            "businessName": session.business_name,
            "phone": session.caller_phone,
            "city": session.city
        },
        "items_collected": session.items,
        "transcript": transcript_log
    }

# ------------------------------------------------------------------------------
# Asterisk ARI Stasis WebSocket Event Listener (Background Task)
# ------------------------------------------------------------------------------
async def listen_asterisk_ari():
    import websockets
    ari_ws_url = f"ws://{config.ASTERISK_HOST}:{config.ASTERISK_ARI_PORT}/ari/events?app={config.ASTERISK_APP_NAME}&api_key={config.ASTERISK_ARI_USER}:{config.ASTERISK_ARI_PASS}"
    logger.info(f"Connecting to Asterisk ARI WebSocket at {config.ASTERISK_HOST}:{config.ASTERISK_ARI_PORT}...")

    while True:
        try:
            async with websockets.connect(ari_ws_url) as ws:
                logger.info("✅ Connected to Asterisk ARI Stasis Event Stream!")
                while True:
                    msg_raw = await ws.recv()
                    event = json.loads(msg_raw)
                    event_type = event.get("type")

                    if event_type == "StasisStart":
                        channel = event.get("channel", {})
                        channel_id = channel.get("id")
                        caller_number = channel.get("caller", {}).get("number", "Unknown")
                        logger.info(f"📞 Incoming Call detected on Asterisk! Channel: {channel_id}, Caller: {caller_number}")
                        session = conversation_manager.get_or_create_session(channel_id, caller_number)
                        greeting = conversation_manager.get_initial_greeting(session)
                        logger.info(f"🤖 Initial Greeting: {greeting}")
                        # In production, audio bytes for 'greeting' are streamed over External Media RTP to Asterisk

                    elif event_type == "StasisEnd":
                        channel_id = event.get("channel", {}).get("id")
                        logger.info(f"📴 Call Ended on Asterisk: {channel_id}")
                        if channel_id in conversation_manager.sessions:
                            del conversation_manager.sessions[channel_id]

        except Exception as e:
            logger.debug(f"Asterisk ARI connection retry note: {e}")
            await asyncio.sleep(5)

@app.on_event("startup")
async def on_startup():
    asyncio.create_task(listen_asterisk_ari())

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=config.DEBUG)

