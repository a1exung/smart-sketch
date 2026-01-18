# Supabase Audio Storage Setup Verification

## Step 1: Verify Sessions Table Schema

Go to **Supabase Dashboard → SQL Editor** and run this query to check your sessions table:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;
```

You should see these columns:
- `id` (uuid) - PRIMARY KEY
- `user_id` (uuid) - NOT NULL
- `title` (text) - NOT NULL
- `transcript` (text)
- `mind_map_nodes` (jsonb)
- `mind_map_edges` (jsonb)
- `audio_file_url` (text) - **This is critical**
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### If audio_file_url is missing, add it:

```sql
ALTER TABLE sessions
ADD COLUMN audio_file_url TEXT;
```

---

## Step 2: Verify Row Level Security (RLS) on Sessions Table

1. Go to **Supabase Dashboard → Authentication → Policies**
2. Select the **sessions** table
3. You should see these 4 policies:

### Policy 1: SELECT (Users can view their own sessions)
```sql
auth.uid() = user_id
```

### Policy 2: INSERT (Users can create sessions)
```sql
auth.uid() = user_id
```

### Policy 3: UPDATE (Users can update their own sessions)
```sql
auth.uid() = user_id
```

### Policy 4: DELETE (Users can delete their own sessions)
```sql
auth.uid() = user_id
```

**If any are missing, create them:**

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (auth.uid() = user_id);

-- INSERT Policy
CREATE POLICY "Users can create sessions"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy
CREATE POLICY "Users can update own sessions"
ON sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE Policy
CREATE POLICY "Users can delete own sessions"
ON sessions FOR DELETE
USING (auth.uid() = user_id);
```

---

## Step 3: Verify Storage Bucket

1. Go to **Supabase Dashboard → Storage**
2. Look for a bucket named **session-audio**

### If the bucket doesn't exist, create it:

1. Click "New Bucket"
2. Name: `session-audio`
3. **Uncheck** "Public bucket" (we'll use policies for access control)
4. Click "Create bucket"

---

## Step 4: Verify Storage Bucket RLS Policies

1. In **Storage**, click on the **session-audio** bucket
2. Go to the **Policies** tab
3. You should see these policies:

### Policy 1: INSERT (Users can upload to their folder)
```
(bucket_id = 'session-audio') AND (auth.uid()::text = (storage.foldername(name))[1])
```

### Policy 2: SELECT (Users can read their files)
```
(bucket_id = 'session-audio') AND (auth.uid()::text = (storage.foldername(name))[1])
```

### Policy 3: DELETE (Users can delete their files)
```
(bucket_id = 'session-audio') AND (auth.uid()::text = (storage.foldername(name))[1])
```

**If they're missing, create them manually:**

1. Click "New Policy"
2. Create for "INSERT", "SELECT", and "DELETE" operations
3. Use the conditions above

Alternatively, use this SQL (go to SQL Editor):

```sql
-- INSERT Policy
CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'session-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- SELECT Policy
CREATE POLICY "Users can read their files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'session-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE Policy
CREATE POLICY "Users can delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'session-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Step 5: Verify Environment Variables

Check your **.env.local** file has:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get these from: **Supabase Dashboard → Settings → API**

---

## Step 6: Test the Setup

1. Restart your dev server: `npm run dev`
2. Open browser DevTools (F12) → Console
3. Record a session and save it
4. Watch the console logs:
   - `[Save Button] Audio chunks count: X` - should be > 0
   - `[Save Button] Audio blob created, size: X bytes`
   - `[saveSession] Audio upload result: {success: true, url: "..."}`
   - `[saveSession] Audio file URL set to: https://...`

5. Check Supabase:
   - **Storage → session-audio** - Should have a file like `{user-id}/timestamp-title.webm`
   - **Database → sessions table** - The `audio_file_url` column should have the URL

---

## Troubleshooting

### Audio chunks are 0
- MediaRecorder didn't start properly
- Check browser console for "Failed to start audio recording"

### Upload fails with 401/403
- RLS policies are blocking the upload
- Make sure storage policies use exact conditions above
- Verify user is authenticated

### Audio file doesn't appear in Storage
- Upload failed silently
- Check Supabase Studio → Storage → session-audio for files
- Look at browser console for error messages

### audio_file_url is NULL in database
- Upload succeeded but URL wasn't saved
- Check if `getPublicUrl()` is returning a valid URL
- Verify bucket is not private

