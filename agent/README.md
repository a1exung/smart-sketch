# SmartSketch Agent

This is the backend agent that provides **real-time speech-to-text transcription** for SmartSketch lectures.

## What Does This Do?

When a student starts a lecture recording in SmartSketch:

1. **This agent automatically joins the LiveKit room** (like an invisible participant)
2. **Listens to the audio** from the student's microphone
3. **Transcribes speech to text** using Deepgram (real-time)
4. **Every 30 seconds**, batches the transcript and sends it to OpenAI
5. **Extracts key concepts** and sends them back to the React app
6. **The mind map updates** with new concepts in real-time

## Prerequisites

- **Python 3.9+** installed on your computer
- **LiveKit Cloud account** (free): https://cloud.livekit.io
- **Deepgram account** (free $200 credit): https://deepgram.com
- **OpenAI account**: https://platform.openai.com

## Setup Instructions

### Step 1: Create Python Virtual Environment

```bash
# Navigate to the agent directory
cd agent

# Create a virtual environment (keeps dependencies isolated)
python3 -m venv venv

# Activate the virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# You should see (venv) at the start of your terminal prompt
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `livekit-agents` - Framework for building LiveKit agents
- `livekit-plugins-deepgram` - Speech-to-text integration
- `livekit-plugins-openai` - OpenAI integration for concept extraction

### Step 3: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual API keys
# Use your favorite text editor:
nano .env
# or
code .env
```

You need to fill in:
- `LIVEKIT_URL` - From LiveKit Cloud dashboard
- `LIVEKIT_API_KEY` - From LiveKit Cloud dashboard
- `LIVEKIT_API_SECRET` - From LiveKit Cloud dashboard
- `DEEPGRAM_API_KEY` - From Deepgram console
- `OPENAI_API_KEY` - From OpenAI platform

### Step 4: Run the Agent

```bash
# Load environment variables and run in development mode
python main.py dev
```

You should see:
```
[PREWARM] Agent worker starting...
[AGENT] Starting SmartSketch agent...
```

The agent is now running and will automatically join any LiveKit rooms created by your Next.js app!

## How to Test

1. **Start your Next.js app** (in another terminal):
   ```bash
   cd ..  # Go back to project root
   npm run dev
   ```

2. **Open SmartSketch** in your browser: http://localhost:3000

3. **Start a lecture recording** - the agent will automatically join

4. **Speak into your microphone** - you should see transcripts appearing in the agent terminal

5. **Watch the mind map** update with concepts every 30 seconds

## Troubleshooting

### "Import could not be resolved"
This is just a VS Code warning. The imports work when you run the code (after `pip install`).

### "Connection failed"
- Check your `LIVEKIT_URL` is correct (should start with `wss://`)
- Make sure your LiveKit API key/secret are correct
- Verify your LiveKit project is active

### "Deepgram error"
- Check your `DEEPGRAM_API_KEY` is correct
- Make sure you have credit remaining (check Deepgram dashboard)

### "No audio detected"
- Make sure the student's microphone is working
- Check browser permissions for microphone access
- The agent only transcribes audio from other participants (not itself)

### Agent doesn't join the room
- Make sure the agent is running before you start the lecture
- Check that both are using the same LiveKit project (same URL/keys)

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

## Customization

### Change batch interval
Edit `BATCH_INTERVAL_SECONDS` in `main.py` (default: 30 seconds)

### Change AI model
Edit the `model` parameter in `TranscriptProcessor.__init__()` (default: gpt-4o-mini)

### Change transcription language
Edit the `language` parameter in the Deepgram STT setup (default: "en")

### Add video frame capture (for OCR)
Change `AutoSubscribe.AUDIO_ONLY` to `AutoSubscribe.SUBSCRIBE_ALL` and add video processing logic.
