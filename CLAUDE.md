# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Sketch is a Next.js application that captures live video/audio from lectures using LiveKit, processes the content with OpenAI, and generates interactive mind maps using ReactFlow. The goal is to help learners (especially those with attention deficits) visualize concepts as they're being taught.

## Development Commands

```bash
# Development
npm run dev              # Start development server at localhost:3000
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking (use before committing)

# Testing workflow
npm run type-check && npm run lint && npm run build
```

## Environment Setup

The application requires LiveKit and OpenAI credentials. Copy `.env.example` to `.env.local` and configure:
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` - LiveKit credentials
- `OPENAI_API_KEY` - OpenAI API key for concept extraction
- `NEXT_PUBLIC_LIVEKIT_URL` - Public-facing LiveKit URL (must match LIVEKIT_URL)

**Important**: Never commit `.env.local` or expose API credentials.

## Architecture & Data Flow

### Core Flow
1. User initiates lecture session → `src/app/lecture/page.tsx`
2. LiveKitCapture component connects to LiveKit room → `src/components/LiveKitCapture.tsx`
3. Audio is captured and transcribed (currently simulated every 10 seconds)
4. Transcript sent to `/api/process-transcript` → `src/app/api/process-transcript/route.ts`
5. OpenAI extracts concepts from transcript using GPT-3.5-turbo
6. Concepts returned to LiveKitCapture component
7. MindMapVisualization renders concepts as ReactFlow nodes → `src/components/MindMapVisualization.tsx`

### Key Type Definitions (`src/types/index.ts`)

**Concept**: Core data structure with `label`, `type` (main/concept/detail), optional `parent` for hierarchy, and optional `explanation`

**LectureSession**: Session metadata with room info and concept collection

**TranscriptSegment**: Represents timestamped transcript chunks

### API Routes

**`/api/livekit/token`**: Generates LiveKit access tokens with room join permissions. Tokens are created server-side to protect API secrets.

**`/api/process-transcript`**: Receives transcript text, calls OpenAI with educational concept extraction prompt, parses JSON response, and returns array of Concept objects. Includes fallback parsing if AI returns non-JSON.

### Component Architecture

**LiveKitCapture.tsx**:
- Manages LiveKit connection lifecycle
- Currently uses `simulateTranscript()` to generate demo transcripts every 10 seconds
- Real transcription integration point: replace simulation with Web Speech API or similar
- Processes transcripts by calling `/api/process-transcript`
- Emits extracted concepts via `onConceptsExtracted` callback

**MindMapVisualization.tsx**:
- Converts Concept array into ReactFlow nodes and edges
- Uses radial positioning algorithm: calculates angle-based positions for concepts around a center point
- Node styling: main concepts (blue), concepts (green), details (gray)
- Implements auto-fitting with `fitView()` when nodes update

### Path Aliases

The project uses `@/*` as an alias for `./src/*` (configured in `tsconfig.json`). Use this consistently:
```typescript
import { Concept } from '@/types';
import { LiveKitCapture } from '@/components/LiveKitCapture';
```

## Key Implementation Details

### Transcript Processing Interval
Transcripts are processed every 10 seconds in LiveKitCapture. This is configurable but affects API costs and real-time responsiveness.

### OpenAI Prompt Engineering
The AI system prompt in `src/app/api/process-transcript/route.ts` instructs GPT to extract concepts with labels, types, and explanations. Modifying this prompt significantly affects concept quality. The temperature is set to 0.7 for balanced creativity/consistency.

### Mind Map Layout Algorithm
Nodes are positioned in a radial pattern using trigonometric calculations. The spacing is determined by concept count and level. Alternative layouts (hierarchical, force-directed, dagre) would require replacing this logic in MindMapVisualization.tsx.

### LiveKit Room Management
Each session uses a unique room name. The token generation endpoint (`/api/livekit/token`) creates tokens with specific room permissions. Users must request a new token before joining a room.

## Common Development Tasks

### Implementing Real Speech-to-Text
Replace the `simulateTranscript()` function in LiveKitCapture.tsx with actual transcription. Consider:
- Web Speech API for browser-based transcription
- Deepgram or AssemblyAI for production-quality transcription
- LiveKit's built-in transcription features

### Modifying AI Concept Extraction
Edit the system message in `/api/process-transcript/route.ts:32-39`. For different use cases:
- Technical documentation: "Extract technical terms, APIs, and their relationships"
- Meeting notes: "Identify action items, decisions, and participants"
- Research papers: "Extract hypotheses, methodologies, and findings"

### Changing Mind Map Layout
Replace the radial positioning logic in MindMapVisualization.tsx with:
- Hierarchical: Use dagre or elkjs layout libraries
- Force-directed: Use ReactFlow's built-in layouting or d3-force
- Tree: Implement tree traversal with fixed x-spacing per level

### Adding Session Persistence
Currently sessions are ephemeral. To persist:
1. Add database (Prisma + PostgreSQL/MongoDB)
2. Store LectureSession objects with concepts array
3. Create `/api/sessions` endpoints for CRUD operations
4. Add session history UI in `/app/lecture/page.tsx`

## Testing Strategy

The codebase doesn't currently have tests. When adding tests:
- Use Jest + React Testing Library for component tests
- Test LiveKitCapture's transcript processing logic with mocked API calls
- Test MindMapVisualization's node positioning algorithm with snapshot tests
- Mock OpenAI API responses in `/api/process-transcript` tests
- Use LiveKit's mock server for integration tests

## Known Limitations

1. **No real transcription**: Currently uses simulated transcripts. Real-world deployment requires speech-to-text integration.
2. **Simple layout algorithm**: Radial positioning can cause node overlap with many concepts. Needs advanced layout library.
3. **No persistence**: Sessions are lost on page refresh. Requires database integration.
4. **No authentication**: Anyone can create sessions. Should add NextAuth.js or similar.
5. **OpenAI API costs**: Each transcript chunk costs API credits. Consider batching or using cheaper models.

## Performance Considerations

- ReactFlow can handle ~1000 nodes efficiently. Large lectures may need virtualization or concept summarization.
- OpenAI API calls are synchronous and can introduce latency. Consider debouncing or queueing transcript chunks.
- LiveKit bandwidth scales with participant count. For single-user capture, this is minimal.

## Code Style

- Use TypeScript strict mode (enabled in tsconfig.json)
- Prefer functional components with hooks
- Use async/await over promises
- Handle errors with try/catch and return appropriate HTTP status codes in API routes
- Use NextResponse for API responses
- Follow Next.js 14 App Router conventions (use route.ts for API routes, page.tsx for pages)
