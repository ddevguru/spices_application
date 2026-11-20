# NATURALE AI Voice Calling: Telephony & Asterisk PBX Setup Guide

This guide explains how to install and configure **Asterisk PBX** to receive incoming customer phone calls from your **Jio Business Number** (forwarded to an Indian SIP DID) and bridge the call via **ARI WebSocket & External Media RTP** to the **Python AI Voice Engine**.

---

## Architecture Flow

```
Customer (+91 Mobile)
   ↓ (Cellular GSM Call)
Existing NATURALE Jio Business Number
   ↓ (Jio Call Forwarding: *401*<DID_NUMBER>#)
Indian SIP DID Number (Tata Tele / Airtel IQ / Jio SIP / Voicens / Microtalk)
   ↓ (PJSIP Trunk over UDP 5060)
Asterisk PBX (Self-Hosted on Linux VPS / Dedicated Server)
   ↓ (Stasis ARI WebSocket + External Media RTP)
Python AI Voice Engine (FastAPI + faster-whisper + Ollama + Piper TTS)
   ↓ (Internal Authenticated API)
Node.js Express Backend & PostgreSQL Database
```

---

## 1. Asterisk Installation (Ubuntu 22.04 / 24.04 LTS)

Run the following commands on your Asterisk PBX server:

```bash
# Update and install dependencies
sudo apt-get update && sudo apt-get install -y \
  build-essential wget subversion libncurses5-dev libssl-dev libxml2-dev \
  libsqlite3-dev uuid-dev libjansson-dev libedit-dev sox libsox-fmt-all \
  ffmpeg git curl

# Install Asterisk
sudo apt-get install -y asterisk asterisk-modules asterisk-config

# Enable and verify Asterisk service
sudo systemctl enable asterisk
sudo systemctl start asterisk
sudo asterisk -rx "core show version"
```

---

## 2. Deploy Configuration Files

Copy the provided configuration files from `telephony/` to `/etc/asterisk/`:

```bash
# Backup existing configs
sudo cp /etc/asterisk/pjsip.conf /etc/asterisk/pjsip.conf.bak
sudo cp /etc/asterisk/extensions.conf /etc/asterisk/extensions.conf.bak
sudo cp /etc/asterisk/ari.conf /etc/asterisk/ari.conf.bak
sudo cp /etc/asterisk/http.conf /etc/asterisk/http.conf.bak
sudo cp /etc/asterisk/rtp.conf /etc/asterisk/rtp.conf.bak

# Deploy NATURALE configs
sudo cp telephony/pjsip.conf /etc/asterisk/pjsip.conf
sudo cp telephony/extensions.conf /etc/asterisk/extensions.conf
sudo cp telephony/ari.conf /etc/asterisk/ari.conf
sudo cp telephony/http.conf /etc/asterisk/http.conf
sudo cp telephony/rtp.conf /etc/asterisk/rtp.conf

# Set proper permissions
sudo chown -R asterisk:asterisk /etc/asterisk/
sudo chmod 640 /etc/asterisk/*.conf

# Create recordings directory
sudo mkdir -p /var/spool/asterisk/recording
sudo chown -R asterisk:asterisk /var/spool/asterisk/recording

# Reload Asterisk modules
sudo asterisk -rx "module reload res_pjsip.so"
sudo asterisk -rx "module reload res_ari.so"
sudo asterisk -rx "module reload res_http_websocket.so"
sudo asterisk -rx "dialplan reload"
```

---

## 3. Local Softphone Testing (Before Connecting Jio)

You can test the entire voice agent on your PC/laptop using a free SIP softphone (**MicroSIP** for Windows, **Linphone**, or **Zoiper**):

1. **Download MicroSIP:** [https://www.microsip.org](https://www.microsip.org)
2. **Account Settings in MicroSIP:**
   - **Account Name:** `Naturale Test`
   - **SIP Server:** `<IP_OF_ASTERISK_SERVER>:5060`
   - **User:** `1001`
   - **Domain:** `<IP_OF_ASTERISK_SERVER>`
   - **Login:** `1001`
   - **Password:** `NaturaleSoftphoneTestPass2026!`
3. **Dial Extension `7000`:**
   - This routes directly into `Stasis(naturale-voice-agent, 9820012345)`
   - The Python AI voice agent will pick up, greet in natural Hindi, and take your wholesale order!
4. **Dial Extension `8000`:**
   - Echo test to verify audio latency and codec clarity.

---

## 4. Connecting Jio Business Number

1. **Get an Indian SIP DID Number:**
   - Procure a local Indian DID number from an Indian Telecom provider (e.g., Tata Tele Business Services, Airtel IQ, Jio SIP Trunk, Voicens, Microtalk).
   - In `pjsip.conf`, update `[sip-provider-auth]` and `[sip-provider-registration]` with the provider's SIP username, password, and host.
2. **Configure Jio Call Forwarding:**
   - On the phone holding the NATURALE Jio Business SIM, dial:
     - **Unconditional Forwarding (All Calls):** `*401*<INDIAN_DID_NUMBER>#`
     - **Forward when Busy:** `*404*<INDIAN_DID_NUMBER>#`
     - **Forward when Unanswered:** `*402*<INDIAN_DID_NUMBER>#`
   - To deactivate call forwarding anytime, dial: `*402#` or `*413#`.
3. Now, whenever any customer calls your regular Jio business number, the call forwards seamlessly to the SIP DID -> Asterisk -> Python AI Voice Engine!

