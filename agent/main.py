"""
SmartSketch LiveKit Agent
=========================

This is a Python program that runs on a server (or your computer) and does the following:

1. CONNECTS to a LiveKit room (the same room your student's browser connects to)
2. LISTENS to the audio being streamed (the professor's voice)
3. TRANSCRIBES the audio using Deepgram (speech → text)
4. BATCHES transcripts every 30 seconds
5. SENDS transcripts to OpenAI to extract key concepts
6. SENDS the concepts back to your React app via Data Channel

Think of this agent as an invisible participant in the room who's really good at
taking notes and organizing them into concepts.

HOW IT WORKS:
-------------
- LiveKit is like a video call platform (Zoom, but for developers)
- When a student opens your app and starts recording, they create a "room"
- This agent automatically joins that room when it detects a new one
- The agent subscribes to the audio track (listens to the mic)
- Audio frames are sent to Deepgram in real-time
- Deepgram returns text as people speak
- Every 30 seconds, we take all the text and ask OpenAI to find key concepts
- Those concepts get sent to your React app to update the mind map

TO RUN THIS:
------------
1. Install dependencies: pip install -r requirements.txt
2. Set environment variables (see .env.example)
3. Run: python main.py dev

The "dev" mode means it will automatically join any new rooms created on your LiveKit project.
"""

import asyncio
import json
import os
from datetime import datetime
from pathlib import Path
from typing import List

# Load environment variables from .env file
# This MUST happen before importing LiveKit plugins that need API keys
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

# LiveKit imports - these are the libraries that connect to LiveKit
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.agents.stt import SpeechEvent, SpeechEventType
from livekit.plugins import deepgram
import openai as openai_client

# How often to batch transcripts and extract concepts (in seconds)
BATCH_INTERVAL_SECONDS = 10


class TranscriptProcessor:
    """
    This class collects transcript pieces and processes them in batches.

    Why batch? Because:
    - We don't want to call OpenAI for every single word
    - 30 seconds of lecture content gives enough context for meaningful concepts
    - It reduces API costs and provides better concept extraction
    """

    def __init__(self, room: rtc.Room):
        # The LiveKit room we're connected to
        self.room = room

        # Buffer to collect transcript pieces
        # Example: ["Hello class", "today we discuss", "photosynthesis"]
        self.transcript_buffer: List[str] = []

        # Full transcript for the entire session (for later review)
        self.full_transcript: List[str] = []

        # OpenAI client for concept extraction
        # This uses the OPENAI_API_KEY environment variable automatically
        self.openai = openai_client.AsyncOpenAI()

        # Track when we last processed a batch
        self.last_batch_time = datetime.now()

    def add_transcript(self, text: str):
        """
        Called every time Deepgram returns some transcribed text.
        We add it to our buffer and check if 30 seconds have passed.
        """
        if not text.strip():
            return

        self.transcript_buffer.append(text)
        self.full_transcript.append(text)

        # Check if it's time to process a batch
        time_since_last_batch = (datetime.now() - self.last_batch_time).seconds
        if time_since_last_batch >= BATCH_INTERVAL_SECONDS:
            # Schedule the batch processing (don't block the transcript collection)
            asyncio.create_task(self.process_batch())

    async def process_batch(self):
        """
        Takes all the transcript pieces collected in the last 30 seconds,
        combines them, sends to OpenAI for concept extraction, and
        sends the results back to the React app.
        """
        if not self.transcript_buffer:
            return

        # Combine all transcript pieces into one string
        # Example: "Hello class today we discuss photosynthesis"
        batch_text = " ".join(self.transcript_buffer)

        # Clear the buffer for the next batch
        self.transcript_buffer = []
        self.last_batch_time = datetime.now()

        print(f"[BATCH] Processing {len(batch_text)} characters of transcript")

        try:
            # Ask OpenAI to extract concepts from the transcript
            concepts = await self.extract_concepts(batch_text)

            # Send concepts back to the React app via Data Channel
            await self.send_to_frontend(concepts, batch_text)

        except Exception as e:
            print(f"[ERROR] Failed to process batch: {e}")

    async def extract_concepts(self, transcript: str) -> List[dict]:
        """
        Sends the transcript to OpenAI and asks it to extract key concepts.

        Returns a list of concepts like:
        [
            {"label": "Photosynthesis", "type": "main", "explanation": "Process plants use..."},
            {"label": "Chlorophyll", "type": "concept", "explanation": "Green pigment..."},
        ]
        """

        # The prompt that tells OpenAI what to do
        prompt = f"""You are an educational assistant analyzing a lecture transcript.
Extract the key concepts mentioned and return them as a JSON array.

Each concept should have:
- "label": Short name (1-4 words)
- "type": One of "main" (core topic), "concept" (supporting idea), or "detail" (specific fact)
- "explanation": Brief explanation (1-2 sentences)

Return ONLY valid JSON array, no other text. Example:
[{{"label": "Photosynthesis", "type": "main", "explanation": "Process by which plants convert light to energy"}}]

Transcript:
{transcript}"""

        try:
            # Call OpenAI API
            response = await self.openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You extract educational concepts from lecture transcripts. Return only valid JSON arrays."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )

            # Get the response text
            response_text = response.choices[0].message.content.strip()

            # Try to parse as JSON
            # Sometimes the model wraps it in ```json``` blocks
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            concepts = json.loads(response_text)
            print(f"[CONCEPTS] Extracted {len(concepts)} concepts")
            return concepts

        except json.JSONDecodeError as e:
            print(f"[WARNING] Could not parse OpenAI response as JSON: {e}")
            return []
        except Exception as e:
            print(f"[ERROR] OpenAI API error: {e}")
            return []

    async def send_to_frontend(self, concepts: List[dict], transcript: str):
        """
        Sends the extracted concepts back to the React app.

        We use LiveKit's "Data Channel" which is like a text messaging pipe
        between participants in the room. The React app listens for these messages.

        The message format:
        {
            "type": "concepts",
            "data": {
                "concepts": [...],
                "transcript": "...",
                "timestamp": "..."
            }
        }
        """
        message = {
            "type": "concepts",
            "data": {
                "concepts": concepts,
                "transcript": transcript,
                "timestamp": datetime.now().isoformat()
            }
        }

        # Convert to JSON string, then to bytes (Data Channel requires bytes)
        message_bytes = json.dumps(message).encode("utf-8")

        # Publish to the room with topic "smartsketch"
        # Your React app will listen for messages with this topic
        await self.room.local_participant.publish_data(
            message_bytes,
            reliable=True,  # Make sure the message arrives
            topic="smartsketch"
        )

        print(f"[SENT] Concepts sent to frontend")


async def entrypoint(ctx: JobContext):
    """
    This is the main function that runs when the agent joins a room.

    JobContext contains:
    - ctx.room: The LiveKit room we're joining
    - ctx.proc: Information about this worker process

    This function:
    1. Connects to the room
    2. Sets up Deepgram for speech-to-text
    3. Listens for audio tracks and transcribes them
    """

    print(f"[AGENT] Starting SmartSketch agent...")

    # Connect to the room
    # AutoSubscribe.AUDIO_ONLY means we only care about audio, not video
    # (We could add video later for OCR on slides)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    print(f"[AGENT] Connected to room: {ctx.room.name}")

    # Create our transcript processor
    processor = TranscriptProcessor(ctx.room)

    # Set up Deepgram for speech-to-text
    # Deepgram is a service that converts audio → text in real-time
    stt = deepgram.STT(
        model="nova-2",  # Their best model for accuracy
        language="en",   # English - change if needed
    )

    async def transcribe_track(track: rtc.Track):
        """
        Takes an audio track and continuously transcribes it.

        An "audio track" is like a stream of audio data from someone's microphone.
        We send this stream to Deepgram, and it sends back text as people speak.
        """
        print(f"[AUDIO] Starting transcription for track: {track.sid}")

        # Create an audio stream from the track
        audio_stream = rtc.AudioStream(track)

        # Create a speech-to-text stream
        # This is like opening a phone line to Deepgram
        stt_stream = stt.stream()

        async def process_audio():
            """Send audio frames to Deepgram"""
            async for event in audio_stream:
                # event is AudioFrameEvent, we need the .frame property
                stt_stream.push_frame(event.frame)

        async def process_transcription():
            """Receive transcription results from Deepgram"""
            async for event in stt_stream:
                # SpeechEventType.FINAL_TRANSCRIPT means the sentence is complete
                # (as opposed to INTERIM which is still being processed)
                if event.type == SpeechEventType.FINAL_TRANSCRIPT:
                    text = event.alternatives[0].text
                    if text.strip():
                        print(f"[TRANSCRIPT] {text}")
                        processor.add_transcript(text)

        # Run both tasks concurrently
        # - One sends audio to Deepgram
        # - One receives text from Deepgram
        await asyncio.gather(
            process_audio(),
            process_transcription()
        )

    # Listen for when participants publish audio tracks
    # This fires when someone (the student) starts their microphone
    @ctx.room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant
    ):
        """Called when we receive a new audio track from a participant"""
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            print(f"[AUDIO] New audio track from: {participant.identity}")
            # Start transcribing this audio track
            asyncio.create_task(transcribe_track(track))

    # Also handle tracks that are already published when we join
    for participant in ctx.room.remote_participants.values():
        for publication in participant.track_publications.values():
            if publication.track and publication.track.kind == rtc.TrackKind.KIND_AUDIO:
                asyncio.create_task(transcribe_track(publication.track))

    # Send a message to let the frontend know the agent is ready
    ready_message = json.dumps({
        "type": "agent_ready",
        "data": {"message": "SmartSketch agent is listening"}
    }).encode("utf-8")

    await ctx.room.local_participant.publish_data(
        ready_message,
        reliable=True,
        topic="smartsketch"
    )

    print("[AGENT] Ready and listening for audio...")

    # Keep the agent running indefinitely
    # It will continue processing audio until the room closes
    while ctx.room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
        await asyncio.sleep(1)

    print("[AGENT] Room closed, shutting down")


def prewarm(proc: JobProcess):
    """
    This runs once when the agent worker starts up.
    Use it to load models or do other one-time setup.
    """
    print("[PREWARM] Agent worker starting...")
    # We could preload AI models here if needed
    pass


if __name__ == "__main__":
    """
    Entry point when you run: python main.py dev

    The 'cli.run_app' function:
    - Connects to your LiveKit project
    - Listens for new rooms being created
    - Automatically spawns an agent for each room

    In "dev" mode, it joins every room. In production, you'd configure
    which rooms the agent should join.
    """
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
