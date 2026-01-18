# SmartSketch Agent

This is the backend agent that provides **real-time speech-to-text transcription** for SmartSketch lectures.

## Quick Start (TL;DR)

```bash
# 1. Make sure you have Python 3.9+
python3 --version

# 2. Set up environment (one-time)
cd agent
python3 -m venv venv
source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt

# 3. Create .env with your API keys
cp .env.example .env
# Edit .env with your keys (see "Get API Keys" below)

# 4. Run the agent
./start.sh
```

---

## What Does This Do?

When a student starts a lecture recording in SmartSketch:

1. **This agent automatically joins the LiveKit room** (like an invisible participant)
2. **Listens to the audio** from the student's microphone
3. **Transcribes speech to text** using Deepgram (real-time)
4. **Every 10-30 seconds**, batches the transcript and sends it to OpenAI
5. **Extracts key concepts** and sends them back to the React app
6. **The mind map updates** with new concepts in real-time

---

## Get API Keys (Free Tiers Available)

You need 3 API keys. All have free tiers:

### 1. LiveKit (free)
1. Go to https://cloud.livekit.io
2. Sign up / Log in
3. Create a new project (or use existing)
4. Go to **Settings > Keys**
5. Copy: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

### 2. Deepgram (free $200 credit)
1. Go to https://deepgram.com
2. Sign up (no credit card needed)
3. Go to **API Keys** in dashboard
4. Create a new key
5. Copy the key for `DEEPGRAM_API_KEY`

### 3. OpenAI
1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to **API Keys**
4. Create a new secret key
5. Copy for `OPENAI_API_KEY`

---

## Detailed Setup Instructions

### Step 1: Check Python Version

```bash
python3 --version
```

You need **Python 3.9 or higher**. If not installed:

```bash
# Mac (using Homebrew)
brew install python

# Windows - download from python.org

# Ubuntu/Debian
sudo apt install python3 python3-venv python3-pip
```

### Step 2: Create Virtual Environment

```bash
# Navigate to the agent directory
cd agent

# Create a virtual environment
python3 -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate

# On Windows (Command Prompt):
venv\Scripts\activate.bat

# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# You should see (venv) at the start of your terminal prompt
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `livekit-agents` - Framework for building LiveKit agents
- `livekit-plugins-deepgram` - Speech-to-text integration
- `openai` - OpenAI API for concept extraction

### Step 4: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual API keys
nano .env
# or
code .env
# or any text editor
```

Your `.env` should look like:
```
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Run the Agent

**Option A: Use the start script (recommended)**
```bash
chmod +x start.sh   # Make executable (first time only)
./start.sh
```

**Option B: Run manually**
```bash
source venv/bin/activate
export $(grep -v '^#' .env | xargs)
python main.py dev
```

You should see:
```
INFO   livekit.agents     registered worker
                          {"id": "AW_xxxxx", "url": "wss://..."}
```

The agent is now running and will automatically join any LiveKit rooms!

---

## Testing the Full Setup

1. **Terminal 1** - Run the agent:
   ```bash
   cd agent
   ./start.sh
   ```

2. **Terminal 2** - Run the Next.js app:
   ```bash
   cd ..   # back to project root
   npm run dev
   ```

3. **Browser** - Go to http://localhost:3000/record

4. **Click "Start Recording"** and speak into your microphone

5. **Watch the agent terminal** - you should see:
   ```
   [AUDIO] New audio track from: student
   [TRANSCRIPT] Hello, today we're going to talk about...
   [BATCH] Processing 150 characters of transcript
   [CONCEPTS] Extracted 3 concepts
   [SENT] Concepts sent to frontend
   ```

6. **Watch the mind map** - concepts should appear as colored nodes!

---

## Troubleshooting

### "command not found: python3"
Install Python 3.9+:
- Mac: `brew install python`
- Windows: Download from python.org
- Linux: `sudo apt install python3`

### "No module named 'livekit'" or similar
You need to install dependencies:
```bash
source venv/bin/activate   # Make sure venv is active!
pip install -r requirements.txt
```

### "LIVEKIT_URL is required" or "api_secret is required"
Your `.env` file is missing or not loaded:
```bash
# Make sure .env exists
ls -la .env

# If not, create it
cp .env.example .env
# Then edit with your actual API keys
```

### "permission denied: ./start.sh"
Make the script executable:
```bash
chmod +x start.sh
```

### "Deepgram error" or transcription not working
- Check your `DEEPGRAM_API_KEY` is correct
- Make sure you have credit remaining (check Deepgram dashboard)
- Deepgram free tier gives $200 credit

### "OpenAI error" or concepts not extracting
- Check your `OPENAI_API_KEY` is correct
- Make sure you have credits/billing set up

### Agent doesn't join the room
- Make sure the agent is running BEFORE you start recording
- Check that your Next.js app has the same LiveKit credentials in `.env.local`
- Verify the LiveKit URL matches in both places

### "Connection failed" to LiveKit
- Check your `LIVEKIT_URL` starts with `wss://`
- Verify API key and secret are correct
- Make sure your LiveKit project is active

### No audio detected / transcription silent
- Check browser microphone permissions
- Make sure your mic is working (test in system settings)
- The agent transcribes OTHER participants, not itself

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT'S BROWSER                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Microphone  │───►│ LiveKit SDK │───►│ React App       │ │
│  │ + Camera    │    │ (WebRTC)    │    │ (Mind Map)      │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                            │                    ▲           │
└────────────────────────────│────────────────────│───────────┘
                             │ Audio Stream       │ Concepts
                             ▼                    │ (Data Channel)
┌─────────────────────────────────────────────────────────────┐
│                      LIVEKIT CLOUD                          │
│                    (Media Server)                           │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Audio Stream
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   THIS AGENT (Python)                       │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Deepgram    │───►│ Transcript  │───►│ OpenAI          │ │
│  │ (STT)       │    │ Buffer      │    │ (Concepts)      │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                                               │             │
│                                               ▼             │
│                                        Send to Frontend     │
└─────────────────────────────────────────────────────────────┘
```

---

## Customization

### Change batch interval
Edit `BATCH_INTERVAL_SECONDS` in `main.py` (default: 10 seconds)

### Change AI model
Edit the `model` parameter in `extract_concepts()` (default: gpt-4o-mini)

### Change transcription language
Edit the `language` parameter in the Deepgram STT setup (default: "en")

---

## Files

| File | Purpose |
|------|---------|
| `main.py` | The agent code - transcription + concept extraction |
| `start.sh` | Easy startup script |
| `requirements.txt` | Python dependencies |
| `.env.example` | Template for API keys |
| `.env` | Your actual API keys (don't commit this!) |
