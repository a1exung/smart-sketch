'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Room, RoomEvent, DataPacket_Kind, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { saveSession } from '@/lib/sessions-service';
import { useAuth } from '@/lib/auth-context';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';

// Types for agent messages
interface ConceptData {
  label: string;
  type: 'main' | 'concept' | 'detail';
  explanation: string;
}

interface AgentMessage {
  type: 'agent_ready' | 'concepts' | 'transcript';
  data: {
    concepts?: ConceptData[];
    transcript?: string;
    message?: string;
    timestamp?: string;
  };
}

export default function RecordPage() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string>('');
  const [cameraError, setCameraError] = useState(false);
  const [micError, setMicError] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFlowBoard, setShowFlowBoard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{
    role: 'user' | 'assistant';
    content: string;
  }[]>([]);
  const [recordingEnded, setRecordingEnded] = useState(false);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [homeModalMode, setHomeModalMode] = useState<'active' | 'ended'>('active');
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingTitleError, setRecordingTitleError] = useState('');

  // Audio recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // LiveKit state
  const [liveKitConnected, setLiveKitConnected] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);

  const router = useRouter();

  // React Flow nodes and edges - will be updated by agent
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'center',
      data: { label: 'Lecture' },
      position: { x: 250, y: 200 },
      style: {
        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        color: '#0c0f14',
        border: 'none',
        borderRadius: '50%',
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 0 30px rgba(20, 184, 166, 0.4)',
      },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([]);

  // Node counter for unique IDs
  const nodeCounterRef = useRef(0);

  // Add a new concept to the mind map
  const addConceptToMap = useCallback((concept: ConceptData) => {
    nodeCounterRef.current += 1;
    const nodeId = `concept-${nodeCounterRef.current}`;

    // Calculate position in a circular pattern around center
    const angle = (nodeCounterRef.current * 0.8) % (2 * Math.PI);
    const radius = 150 + (Math.floor(nodeCounterRef.current / 8) * 80);
    const x = 250 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);

    // Colors based on concept type - updated for new theme
    const colors = {
      main: { bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', border: '#0d9488', text: '#0c0f14' },
      concept: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '#d97706', text: '#0c0f14' },
      detail: { bg: 'linear-gradient(135deg, #1a1f2b 0%, #12161e 100%)', border: 'rgba(255,255,255,0.1)', text: '#f0f2f5' },
    };

    const color = colors[concept.type] || colors.concept;

    const newNode: Node = {
      id: nodeId,
      data: { label: concept.label },
      position: { x, y },
      style: {
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: '500',
        maxWidth: '140px',
        textAlign: 'center' as const,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
    };

    const newEdge: Edge = {
      id: `edge-${nodeId}`,
      source: 'center',
      target: nodeId,
      animated: true,
      style: { stroke: '#14b8a6', strokeWidth: 2 },
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
  }, []);

  // Handle messages from the agent
  const handleAgentMessage = useCallback((message: AgentMessage) => {
    console.log('[AGENT MESSAGE]', message);

    switch (message.type) {
      case 'agent_ready':
        setAgentReady(true);
        console.log('Agent is ready and listening!');
        break;

      case 'concepts':
        if (message.data.concepts) {
          message.data.concepts.forEach((concept) => {
            addConceptToMap(concept);
          });
        }
        if (message.data.transcript) {
          setTranscripts((prev) => [...prev, message.data.transcript!]);
        }
        break;

      case 'transcript':
        if (message.data.transcript) {
          setTranscripts((prev) => [...prev, message.data.transcript!]);
        }
        break;
    }
  }, [addConceptToMap]);

  // Connect to LiveKit room (without publishing tracks)
  const connectToLiveKit = useCallback(async () => {
    try {
      // Fetch token from our API
      const response = await fetch('/api/livekit/token?room=smartsketch-room&username=student');
      if (!response.ok) {
        throw new Error('Failed to fetch LiveKit token');
      }
      const { token } = await response.json();

      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) {
        console.warn('NEXT_PUBLIC_LIVEKIT_URL not set, skipping LiveKit connection');
        return;
      }

      // Create and connect to room
      const room = new Room();
      roomRef.current = room;

      // Listen for data messages from the agent
      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant | LocalParticipant, kind?: DataPacket_Kind, topic?: string) => {
        if (topic === 'smartsketch') {
          try {
            const message: AgentMessage = JSON.parse(new TextDecoder().decode(payload));
            handleAgentMessage(message);
          } catch (e) {
            console.error('Failed to parse agent message:', e);
          }
        }
      });

      // Connect to room (but don't publish tracks yet)
      await room.connect(livekitUrl, token);
      console.log('Connected to LiveKit room:', room.name);
      setLiveKitConnected(true);

    } catch (error) {
      console.error('LiveKit connection error:', error);
    }
  }, [handleAgentMessage]);

  // Publish tracks to LiveKit (called when recording starts)
  const publishTracksToLiveKit = useCallback(async (mediaStream: MediaStream) => {
    if (!roomRef.current) {
      console.error('Room not connected, cannot publish tracks');
      return;
    }

    try {
      const audioTrack = mediaStream.getAudioTracks()[0];
      const videoTrack = mediaStream.getVideoTracks()[0];

      if (audioTrack) {
        await roomRef.current.localParticipant.publishTrack(audioTrack);
        console.log('Published audio track');
      }

      if (videoTrack) {
        await roomRef.current.localParticipant.publishTrack(videoTrack);
        console.log('Published video track');
      }
    } catch (error) {
      console.error('Failed to publish tracks:', error);
    }
  }, []);

  // Disconnect from LiveKit
  const disconnectFromLiveKit = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setLiveKitConnected(false);
      setAgentReady(false);
      console.log('Disconnected from LiveKit');
    }
  }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setHasPermission(true);
        setPermissionError('');

        // Connect to LiveKit in background (without publishing tracks)
        connectToLiveKit();

      } catch (error) {
        setHasPermission(false);
        const err = error as DOMException;

        if (err.name === 'NotAllowedError') {
          setPermissionError(
            'Camera and microphone permissions were denied. Please enable them in your browser settings to continue.'
          );
        } else if (err.name === 'NotFoundError') {
          setPermissionError(
            'No camera or microphone device found. Please check your hardware.'
          );
          if (!navigator.mediaDevices.enumerateDevices) {
            setCameraError(true);
          } else {
            setMicError(true);
          }
        } else if (err.name === 'NotReadableError') {
          setPermissionError(
            'Camera or microphone is already in use by another application.'
          );
        } else {
          setPermissionError(
            'Failed to access camera and microphone. Please try again.'
          );
        }
      }
    };

    requestPermissions();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      disconnectFromLiveKit();
    };
  }, []);

  const handleStartRecording = async () => {
    if (stream) {
      setIsRecording(true);
      setIsPaused(false);
      setRecordingEnded(false);
      setShowFlowBoard(true);

      // Start audio recording
      try {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        console.log('Audio recording started');
      } catch (error) {
        console.error('Failed to start audio recording:', error);
      }

      // Reset mind map
      setNodes([{
        id: 'center',
        data: { label: 'Lecture' },
        position: { x: 250, y: 200 },
        style: {
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          color: '#0c0f14',
          border: 'none',
          borderRadius: '50%',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 0 30px rgba(20, 184, 166, 0.4)',
        },
      }]);
      setEdges([]);
      nodeCounterRef.current = 0;
      setTranscripts([]);

      // Publish tracks to LiveKit (already connected in background)
      await publishTracksToLiveKit(stream);
    }
  };

  const handlePauseRecording = () => {
    setIsPaused(true);
  };

  const handleResumeRecording = () => {
    setIsPaused(false);
  };

  const handleStopRecording = () => {
    setShowConfirmation(true);
  };

  const confirmStopRecording = () => {
    // Stop audio recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('Audio recording stopped');
    }

    disconnectFromLiveKit();
    setIsRecording(false);
    setIsPaused(false);
    setShowChat(true);
    setChatMessages((prev) =>
      prev.length
        ? prev
        : [
            {
              role: 'assistant',
              content: 'Recording ended. Ask anything about this session while we process it.'
            },
          ]
    );
    setRecordingEnded(true);
    setShowConfirmation(false);
  };

  const cancelStopRecording = () => {
    setShowConfirmation(false);
  };

  return (
    <ProtectedRoute>
      <NeuralNetworkBackground />
      <div className="relative z-10 w-full min-h-screen bg-transparent overflow-hidden">
        {/* Back Button - Top Left */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => {
              setShowHomeModal(true);
              setHomeModalMode(isRecording ? 'active' : recordingEnded ? 'ended' : 'active');
              setRecordingTitleError('');
            }}
            className="px-4 py-2 rounded-xl glass text-foreground-muted hover:text-foreground transition-all duration-300 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isRecording || recordingEnded ? 'Return Home' : 'Back'}
          </button>
        </div>

        {/* Connection Status - Top Right */}
        {isRecording && (
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            {liveKitConnected ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-primary text-sm font-medium">
                  {agentReady ? 'Agent Connected' : 'Connecting...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-accent text-sm font-medium">Local Recording</span>
              </div>
            )}
          </div>
        )}

        {/* Main Layout: Recording on Left, Flow Board on Right */}
        <div className="flex h-screen w-full">
          {/* LEFT SIDE - Recording Interface */}
          <div className={`flex flex-col items-center justify-center px-4 pt-20 transition-all duration-500 ${showFlowBoard ? 'w-1/2' : 'w-full'}`}>
            {showChat ? (
              <div className="w-full max-w-2xl space-y-6 animate-fade-in-up">
                <div className="text-center">
                  <h1 className="text-3xl font-display font-bold text-foreground mb-2">Session Chat</h1>
                  <p className="text-foreground-muted">Ask questions about your session</p>
                </div>

                {/* Transcripts preview */}
                {transcripts.length > 0 && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 max-h-32 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Session Transcript</h3>
                    <p className="text-sm text-foreground-muted">{transcripts.join(' ')}</p>
                  </div>
                )}

                {/* Chat container */}
                <div className="card h-[60vh] flex flex-col">
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
                    {chatMessages.length === 0 && (
                      <div className="text-sm text-foreground-muted text-center py-8">No messages yet. Start the conversation.</div>
                    )}
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm message-pop ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-primary to-primary-dark text-background'
                              : 'bg-background-secondary text-foreground border border-surface-border'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="border-t border-surface-border p-4 flex gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const value = chatInput.trim();
                      if (!value) return;
                      setChatMessages((prev) => [
                        ...prev,
                        { role: 'user', content: value },
                        { role: 'assistant', content: 'AI response coming soon. Integration in progress.' },
                      ]);
                      setChatInput('');
                    }}
                  >
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl input-field text-sm"
                      placeholder="Type your question..."
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl btn-primary text-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : hasPermission === null ? (
              <div className="text-center animate-fade-in-down">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h1 className="text-3xl font-display font-bold text-foreground mb-3">
                  Requesting Permissions
                </h1>
                <p className="text-foreground-muted">
                  Please allow access to your camera and microphone
                </p>
              </div>
            ) : hasPermission && !permissionError ? (
              <div className="w-full max-w-xl space-y-6 animate-fade-in-down">
                <div className="text-center">
                  <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                    {!isRecording && 'Ready to Record'}
                    {isRecording && !isPaused && 'Recording in Progress'}
                    {isRecording && isPaused && 'Recording Paused'}
                  </h1>
                  <p className="text-foreground-muted">
                    {!isRecording && 'Check your camera position and audio quality'}
                  </p>
                </div>

                {/* Video Preview */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-card border border-surface-border">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover bg-background-secondary"
                  />
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/90 backdrop-blur-sm">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      <span className="text-white font-semibold text-sm">REC</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      disabled={!agentReady}
                      className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                        agentReady
                          ? 'btn-primary'
                          : 'bg-surface-border text-foreground-muted cursor-not-allowed opacity-60'
                      }`}
                    >
                      {agentReady ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          Start Recording
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Connecting to AI...
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      {!isPaused ? (
                        <button
                          onClick={handlePauseRecording}
                          className="px-6 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors font-semibold flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={handleResumeRecording}
                          className="px-6 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors font-semibold flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Resume
                        </button>
                      )}
                      <button
                        onClick={handleStopRecording}
                        className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors font-semibold flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                        Stop
                      </button>
                    </>
                  )}
                </div>

                <p className="text-center text-sm text-foreground-muted">
                  {agentReady
                    ? 'AI agent ready. Click Start Recording to begin.'
                    : liveKitConnected
                    ? 'Waiting for AI agent...'
                    : 'Connecting to AI agent...'}
                </p>
              </div>
            ) : (
              <div className="w-full max-w-xl animate-fade-in-down">
                <div className="card p-8 border-red-500/20">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                      Permission Required
                    </h1>
                    <p className="text-foreground-muted">{permissionError}</p>
                  </div>

                  {(cameraError || micError) && (
                    <div className="mb-6 flex justify-center gap-4">
                      {cameraError && (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm">Camera not detected</span>
                      )}
                      {micError && (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm">Microphone not detected</span>
                      )}
                    </div>
                  )}

                  <div className="bg-background-secondary rounded-xl p-5 mb-6">
                    <h3 className="font-semibold text-foreground mb-3">How to fix this:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-foreground-muted text-sm">
                      <li>Check your browser&apos;s permission settings</li>
                      <li>Look for a camera/microphone icon in the address bar</li>
                      <li>Click it and select &quot;Allow&quot; for this site</li>
                      <li>Refresh the page and try again</li>
                    </ol>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-2.5 rounded-xl btn-primary font-semibold"
                    >
                      Try Again
                    </button>
                    <Link
                      href="/home"
                      className="px-6 py-2.5 rounded-xl glass text-foreground-muted hover:text-foreground transition-colors font-semibold"
                    >
                      Go Back
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - React Flow Board */}
          <div
            className={`transition-all duration-700 ease-out overflow-hidden flex items-center justify-center ${
              showFlowBoard ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            {showFlowBoard && (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="w-full h-full card overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-surface-border bg-background-secondary">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-display font-bold text-foreground">Live Processing</h2>
                        <p className="text-sm text-foreground-muted">
                          {agentReady
                            ? 'Concepts appear as AI processes speech'
                            : liveKitConnected
                              ? 'Waiting for agent...'
                              : 'Connect to see real-time concepts'}
                        </p>
                      </div>
                      {agentReady && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="text-xs text-primary font-medium">Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 bg-background">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      fitView
                      attributionPosition="bottom-left"
                    />
                  </div>
                  {/* Live transcript preview */}
                  {transcripts.length > 0 && (
                    <div className="px-4 py-3 border-t border-surface-border bg-background-secondary max-h-24 overflow-y-auto custom-scrollbar">
                      <p className="text-xs text-foreground-muted font-medium mb-1 uppercase tracking-wider">Latest transcript</p>
                      <p className="text-sm text-foreground">{transcripts[transcripts.length - 1]}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale">
            <div className="card p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                End Recording?
              </h2>
              <p className="text-foreground-muted mb-6">
                Are you sure you want to end this session? Your recording will be saved.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelStopRecording}
                  className="px-5 py-2.5 rounded-xl glass text-foreground-muted hover:text-foreground transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStopRecording}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Return Home Modal */}
      {showHomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in-down">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg animate-fade-in-down space-y-4">
            {homeModalMode === 'active' ? (
              <>
                <h2 className="text-xl font-bold text-gray-900">Leave and return home?</h2>
                <p className="text-gray-700">
                  The current recording will be lost if you leave now. Are you sure you want to return home?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowHomeModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <Link
                    href="/home"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Leave
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900">Save recording before leaving?</h2>
                <p className="text-gray-700">Would you like to save your recording before returning home?</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="recording-title">
                    Recording title
                  </label>
                  <input
                    id="recording-title"
                    value={recordingTitle}
                    onChange={(e) => setRecordingTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Lecture 1 - Intro"
                  />
                  {recordingTitleError && (
                    <p className="text-sm text-red-600">{recordingTitleError}</p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowHomeModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <Link
                    href="/home"
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Skip Saving
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!recordingTitle.trim()) {
                        setRecordingTitleError('Please enter a title before saving.');
                        return;
                      }
                      setRecordingTitleError('');
                      
                      // Save to Supabase
                      if (user?.id) {
                        const fullTranscript = transcripts.join(' ');
                        
                        // Create audio blob from chunks
                        let audioBlob: Blob | undefined;
                        console.log('[Save Button] Audio chunks count:', audioChunksRef.current.length);
                        if (audioChunksRef.current.length > 0) {
                          audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                          console.log('[Save Button] Audio blob created, size:', audioBlob.size, 'bytes');
                        } else {
                          console.warn('[Save Button] No audio chunks collected!');
                        }
                        
                        const result = await saveSession(
                          user.id,
                          recordingTitle,
                          fullTranscript,
                          nodes,
                          edges,
                          audioBlob
                        );
                        
                        if (!result.success) {
                          setRecordingTitleError(`Failed to save: ${result.error}`);
                          return;
                        }
                        
                        console.log('[RecordPage] Session saved with ID:', result.sessionId);
                      }
                      
                      setShowHomeModal(false);
                      router.push('/home');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save & Return
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
