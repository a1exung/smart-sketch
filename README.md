# Smart Sketch

An intelligent lecture visualization tool that captures live video and audio, interprets content using AI, and creates dynamic mind maps to enhance learning - especially beneficial for those with attention deficits.

## 🌟 Features

- **Live Video/Audio Capture**: Real-time lecture capture using LiveKit
- **AI-Powered Interpretation**: Automatic content analysis using OpenAI GPT
- **Interactive Mind Maps**: Dynamic visual aids generated with ReactFlow
- **Progressive Learning**: Concepts build up naturally as the lecture progresses
- **Attention-Friendly**: Designed to help learners stay engaged and organized

## 🏗️ Architecture

The application consists of:

1. **Frontend (Next.js + React)**
   - LiveKit integration for media capture
   - ReactFlow for mind map visualization
   - Real-time concept rendering

2. **API Layer**
   - LiveKit token generation (`/api/livekit/token`)
   - Transcript processing (`/api/process-transcript`)
   - OpenAI integration for concept extraction

3. **Key Components**
   - `LiveKitCapture`: Handles video/audio streaming
   - `MindMapVisualization`: Renders interactive concept maps
   - Lecture page: Main interface for live sessions
   - Demo page: Interactive demonstration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- LiveKit account ([livekit.io](https://livekit.io))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/a1exung/smart-sketch.git
   cd smart-sketch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   # LiveKit Configuration
   LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-api-secret
   
   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   
   # Next.js Public Configuration
   NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Starting a Live Lecture Session

1. Navigate to the home page
2. Click "Start Lecture Session"
3. Allow camera and microphone permissions
4. Click "Start Session" to begin capturing
5. Watch as concepts are extracted and visualized in real-time

### Viewing the Demo

1. Click "View Demo" from the home page
2. Use "Next Concept" to see how concepts progressively build
3. Explore the interactive mind map features

## 🔧 Development

### Project Structure

```
smart-sketch/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── livekit/token/     # LiveKit token generation
│   │   │   └── process-transcript/ # AI transcript processing
│   │   ├── lecture/                # Lecture session page
│   │   ├── demo/                   # Demo page
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── LiveKitCapture.tsx      # Video/audio capture component
│   │   └── MindMapVisualization.tsx # Mind map rendering
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   └── types/
│       └── index.ts                # TypeScript definitions
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Customization

### Modifying Concept Extraction

Edit `src/app/api/process-transcript/route.ts` to customize how AI extracts concepts from transcripts.

### Styling the Mind Map

Customize node styles in `src/components/MindMapVisualization.tsx` and ReactFlow styles in `src/app/globals.css`.

### Adjusting Processing Intervals

In `src/components/LiveKitCapture.tsx`, modify the interval timing for transcript processing (currently 10 seconds).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [LiveKit](https://livekit.io) - Real-time video/audio infrastructure
- [ReactFlow](https://reactflow.dev) - Interactive node-based graphs
- [OpenAI](https://openai.com) - AI-powered content interpretation
- [Next.js](https://nextjs.org) - React framework

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Speech-to-text integration for better transcription
- [ ] Multiple visualization layouts (tree, radial, hierarchical)
- [ ] Session recording and playback
- [ ] Collaborative learning features
- [ ] Export mind maps as images/PDFs
- [ ] Integration with note-taking apps
- [ ] Mobile app support
