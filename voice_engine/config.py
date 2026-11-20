import os

class Config:
    # Service Configuration
    HOST = os.getenv("VOICE_ENGINE_HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", os.getenv("VOICE_ENGINE_PORT", "8000")))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

    # Asterisk ARI Configuration
    ASTERISK_HOST = os.getenv("ASTERISK_HOST", "localhost")
    ASTERISK_ARI_PORT = int(os.getenv("ASTERISK_ARI_PORT", "8088"))
    ASTERISK_ARI_USER = os.getenv("ASTERISK_ARI_USER", "naturale_ai")
    ASTERISK_ARI_PASS = os.getenv("ASTERISK_ARI_PASS", "naturale_ari_secret_2026")
    ASTERISK_APP_NAME = os.getenv("ASTERISK_APP_NAME", "naturale-voice-agent")
    ASTERISK_RTP_PORT = int(os.getenv("ASTERISK_RTP_PORT", "9999"))

    # Node.js Backend API Configuration
    raw_backend = os.getenv("BACKEND_API_BASE", "http://localhost:5000")
    if not raw_backend.startswith("http://") and not raw_backend.startswith("https://"):
        raw_backend = f"https://{raw_backend}"
    if not raw_backend.endswith("/api/voice-orders"):
        raw_backend = f"{raw_backend.rstrip('/')}/api/voice-orders"
    BACKEND_API_BASE = raw_backend

    INTERNAL_VOICE_API_KEY = os.getenv("INTERNAL_VOICE_API_KEY", "naturale_voice_internal_secret_2026")

    # Local AI Models
    OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
    WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")
    PIPER_MODEL_PATH = os.getenv("PIPER_MODEL_PATH", "models/hi_IN-pratham-medium.onnx")

config = Config()

