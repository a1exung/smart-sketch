# Smart Sketch - Where to Begin

This document guides you through understanding the Smart Sketch architecture and where to start customizing the application.

## 🎯 Quick Start Development Guide

### 1. **Setting Up Your Development Environment**

First, ensure you have the necessary accounts and credentials:

1. **LiveKit Account**: Sign up at [livekit.io](https://livekit.io)
   - Create a new project
   - Note your API key, secret, and WebSocket URL
   
2. **OpenAI Account**: Get API key at [platform.openai.com](https://platform.openai.com)
   - You'll need this for AI-powered concept extraction

3. **Configure `.env.local`**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

### 2. **Understanding the Application Flow**

```
User starts lecture session
         ↓
LiveKit captures video/audio
         ↓
Audio is transcribed (currently simulated)
         ↓
Transcript sent to OpenAI API
         ↓
AI extracts key concepts
         ↓
Concepts rendered in ReactFlow mind map
```

## 📁 Key Files and Their Purpose

### **Core Application Files**

#### `src/app/page.tsx` - Home Page
- Landing page with feature overview
- Navigation to lecture and demo modes
- **Customize**: Branding, feature descriptions, getting started instructions

#### `src/app/lecture/page.tsx` - Main Lecture Interface
- Split-screen layout: video/audio on left, mind map on right
- Session start/stop controls
- **Customize**: Layout, additional controls, recording features

#### `src/app/demo/page.tsx` - Interactive Demo
- Step-by-step demonstration of concept building
- No LiveKit/OpenAI required
- **Customize**: Demo data, visualization examples

### **Component Files**

#### `src/components/LiveKitCapture.tsx` - Video/Audio Capture
**Purpose**: Handles LiveKit connection and media streaming

**Key Functions**:
- `fetchToken()` - Gets LiveKit access token
- `handleTranscript()` - Processes transcribed audio
- `simulateTranscript()` - Demo mode without real streaming

**Where to Start**:
- Line 52: Add real speech-to-text integration
- Line 76: Customize transcript processing interval
- Line 90: Add custom audio processing logic

#### `src/components/MindMapVisualization.tsx` - Mind Map Rendering
**Purpose**: Transforms concepts into visual node graph

**Key Functions**:
- `useEffect()` - Converts concepts to nodes/edges
- Node positioning algorithm (lines 40-80)
- Node styling based on type (lines 60-90)

**Where to Start**:
- Line 48: Modify layout algorithm (radial, tree, hierarchical)
- Line 70: Customize node styles and colors
- Line 145: Add custom node interactions

### **API Routes**

#### `src/app/api/livekit/token/route.ts`
**Purpose**: Generates LiveKit access tokens

**Security Note**: Tokens grant room access. Customize permissions at line 25.

**Where to Start**:
- Line 27: Add custom room permissions
- Add user authentication before token generation

#### `src/app/api/process-transcript/route.ts`
**Purpose**: Sends transcripts to OpenAI for concept extraction

**Key Customization Points**:
- Line 32: Modify AI prompt for different concept extraction
- Line 45: Adjust temperature/max_tokens for AI response
- Line 53: Add custom concept parsing logic

### **Utility Files**

#### `src/lib/utils.ts`
Helper functions for:
- Node positioning calculation
- Keyword extraction
- Concept merging and deduplication

**Where to Start**:
- `calculateNodePosition()` - Customize layout algorithms
- `extractKeywords()` - Improve NLP processing
- `mergeConcepts()` - Add concept relationship detection

#### `src/types/index.ts`
TypeScript definitions for:
- Concepts
- Lecture sessions
- Configuration interfaces

## 🔧 Common Customization Tasks

### **1. Change Mind Map Layout**

Edit `src/components/MindMapVisualization.tsx`:

```typescript
// Current: Radial layout
const angle = (conceptCount * Math.PI * 2) / ...

// Change to: Hierarchical tree layout
position = {
  x: level * 200,
  y: index * 100
}
```

### **2. Add Real Speech-to-Text**

Replace simulation in `src/components/LiveKitCapture.tsx`:

```typescript
// Add Web Speech API or third-party service
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  handleTranscript(transcript);
};
```

### **3. Customize AI Concept Extraction**

Edit `src/app/api/process-transcript/route.ts`:

```typescript
// Current prompt focuses on educational concepts
// Modify the system message for different use cases:
content: `Extract technical terms and their relationships...`
content: `Identify main arguments and supporting evidence...`
content: `Find key takeaways and action items...`
```

### **4. Add Session Recording**

In `src/app/lecture/page.tsx`:

```typescript
const [recording, setRecording] = useState([]);

const handleConceptExtracted = (concept) => {
  setConceptData(prev => [...prev, concept]);
  setRecording(prev => [...prev, {
    concept,
    timestamp: Date.now()
  }]);
};

// Add export button
const exportSession = () => {
  const data = JSON.stringify(recording);
  // Download or save to backend
};
```

### **5. Improve Node Styling**

Edit `src/components/MindMapVisualization.tsx`:

```typescript
// Add custom node types
const nodeTypes = {
  main: MainNode,
  concept: ConceptNode,
  detail: DetailNode,
};

// Create custom components
const MainNode = ({ data }) => (
  <div className="custom-main-node">
    <h3>{data.label}</h3>
    <p>{data.explanation}</p>
  </div>
);
```

## 🚀 Next Steps for Development

### **Immediate Priorities**

1. **Add Real Transcription**
   - Integrate Web Speech API or Deepgram
   - File: `src/components/LiveKitCapture.tsx`

2. **Enhance AI Prompts**
   - Test different prompts for better concept extraction
   - File: `src/app/api/process-transcript/route.ts`

3. **Improve Layout Algorithm**
   - Implement force-directed layout or dagre
   - File: `src/components/MindMapVisualization.tsx`

### **Feature Enhancements**

1. **User Authentication**
   - Add NextAuth.js
   - Protect lecture sessions
   - Save user preferences

2. **Session Management**
   - Store sessions in database
   - Allow replay of past lectures
   - Export as PDF/Image

3. **Collaborative Features**
   - Multiple viewers per session
   - Shared annotations
   - Real-time sync

4. **Advanced Visualizations**
   - Timeline view
   - 3D mind maps
   - Custom themes

5. **Mobile Support**
   - Responsive design improvements
   - Touch gestures for mind map
   - Native mobile app

## 📚 Helpful Resources

- **LiveKit Docs**: https://docs.livekit.io
- **ReactFlow Docs**: https://reactflow.dev/learn
- **OpenAI API**: https://platform.openai.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## 🐛 Troubleshooting

### "LiveKit credentials not configured"
- Ensure `.env.local` exists with correct values
- Restart dev server after changing env files

### "Failed to connect to LiveKit"
- Check LiveKit URL format (must start with wss://)
- Verify API key and secret are correct
- Test connection at livekit.io console

### "OpenAI API error"
- Verify API key is valid
- Check API usage limits
- Ensure billing is set up

### Mind map nodes overlap
- Adjust position calculations in `MindMapVisualization.tsx`
- Increase spacing multipliers
- Consider using auto-layout libraries

## 💡 Tips

- Use the **demo mode** (`/demo`) to test visualization changes without LiveKit
- The **simulate transcript** button lets you test AI processing locally
- Check browser console for detailed error messages
- Use React DevTools to inspect component state

---

**Ready to build?** Start with the demo, customize the AI prompts, then integrate real transcription. Good luck! 🚀
