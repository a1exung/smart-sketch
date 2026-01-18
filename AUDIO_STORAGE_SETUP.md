# Audio Storage Setup Guide

## Overview
Sessions are now saved with audio files stored in Supabase Storage. Here's what happens:

1. **Audio Recording**: When you start recording, the app captures audio using MediaRecorder
2. **Audio Upload**: When you save, the audio file is uploaded to Supabase Storage
3. **URL Storage**: The public URL is saved in the database for playback

## Setup Steps

### Step 1: Run SQL in Supabase
Go to Supabase > Your Project > SQL Editor and run:

```sql
-- Add audio_file_url column to sessions table
ALTER TABLE sessions ADD COLUMN audio_file_url TEXT;

-- Create storage bucket for session audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-audio', 'session-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage bucket
CREATE POLICY "Users can upload their own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'session-audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'session-audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'session-audio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Step 2: Code Changes (Already Done)
✅ Updated `src/lib/sessions-service.ts`:
- Added `uploadAudioFile()` function
- Updated `saveSession()` to accept optional `audioBlob`
- Audio files uploaded before database save

✅ Updated `src/app/record/page.tsx`:
- Added `mediaRecorderRef` and `audioChunksRef` for audio capture
- Start recording audio in `handleStartRecording()`
- Stop audio in `confirmStopRecording()`
- Pass audio blob when saving session

### Step 3: Restart Dev Server
```bash
npm run dev
```

## How It Works

### When Recording Starts
```typescript
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
mediaRecorderRef.current = mediaRecorder;
audioChunksRef.current = [];
mediaRecorder.start();
```

### When Recording Stops
```typescript
mediaRecorderRef.current.stop();
// Audio chunks are collected in audioChunksRef.current
```

### When Saving
```typescript
const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
const result = await saveSession(
  user.id,
  recordingTitle,
  fullTranscript,
  nodes,
  edges,
  audioBlob // ← Passed here
);
```

### Upload Flow
1. `saveSession()` calls `uploadAudioFile()`
2. File uploaded to `session-audio` bucket → `{userId}/{timestamp}-{title}.webm`
3. Public URL returned
4. URL saved in database `audio_file_url` column
5. If upload fails, recording still saves (audio is optional)

## Storage Structure
```
session-audio/
  └── {user-id}/
      ├── 1705625847123-Lecture 1.webm
      ├── 1705625920456-Math Basics.webm
      └── 1705626001789-Physics Demo.webm
```

## Database Schema
```sql
sessions table now has:
- audio_file_url TEXT (nullable)
  - Example: "https://...supabase.co/storage/v1/object/public/session-audio/..."
```

## Retrieving Audio
Users can:
1. Stream audio directly from the URL
2. Download using the public URL
3. Delete audio (via RLS policy)

## Error Handling
- If audio upload fails, the session still saves with transcript and mind map
- If audio blob is not provided, recording saves without audio
- This ensures robustness - audio is "nice to have" not "must have"

## Security
- Row Level Security (RLS) ensures users can only access their own files
- Files are named with timestamp to avoid collisions
- User ID is part of the file path

## Next Steps (Optional)
- Add audio playback UI on session detail page
- Add audio download button
- Show upload progress during save
- Stream audio directly in chat interface
