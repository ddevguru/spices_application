# NATURALE AI Voice Calling Engine (Python + Asterisk PBX)

This service is the dedicated, self-hosted AI Voice Engine for NATURALE Dry Fruits. It connects to **Asterisk PBX via ARI WebSocket & External Media RTP** and coordinates:
- **Speech-to-Text (STT):** `faster-whisper` (Hindi, English, Hinglish)
- **Local LLM Conversation:** `Ollama` (`llama3.2` or `qwen2.5`)
- **Text-to-Speech (TTS):** `Piper TTS` (Fast, high-fidelity offline Hindi voice)
- **Backend Catalogue Integration:** Authenticated internal API calls to Node.js backend (`/api/voice-orders`)

---

## 1. Quick Setup & Run

### Prerequisites
- Python 3.10+ installed
- Node.js backend running on port 5000 (`npm run dev` in `backend/`)
- Ollama running locally (`ollama run llama3.2`)

### Install Dependencies
```bash
cd voice_engine
pip install -r requirements.txt
```

### Start the Service
```bash
python main.py
```
Or with uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 2. API Endpoints

- `GET http://localhost:8000/health`: Health status & backend connectivity check
- `POST http://localhost:8000/chat`: Send text turns to test conversational logic interactively
- `POST http://localhost:8000/simulate-call`: Runs a full multi-product conversation simulation and automatically creates an AI draft order in the Node.js backend and Admin Panel!

---

## 3. Environment Variables

Create a `.env` file in `voice_engine/` if you need to override defaults:
```env
VOICE_ENGINE_PORT=8000
ASTERISK_HOST=localhost
ASTERISK_ARI_PORT=8088
ASTERISK_ARI_USER=naturale_ai
ASTERISK_ARI_PASS=naturale_ari_secret_2026
BACKEND_API_BASE=http://localhost:5000/api/voice-orders
INTERNAL_VOICE_API_KEY=naturale_voice_internal_secret_2026
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
WHISPER_MODEL=base
```
