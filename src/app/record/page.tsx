'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Room, RoomEvent, DataPacket_Kind, RemoteParticipant, LocalParticipant } from 'livekit-client';

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
import { useAuth } from '@/lib/auth-context';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';

export default function RecordPage() {
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
        background: '#3b82f6',
        color: 'white',
        border: '2px solid #1d4ed8',
        borderRadius: '50%',
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
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

    // Different colors based on concept type
    const colors = {
      main: { bg: '#10b981', border: '#059669' },
      concept: { bg: '#f59e0b', border: '#d97706' },
      detail: { bg: '#8b5cf6', border: '#7c3aed' },
    };

    const color = colors[concept.type] || colors.concept;

    const newNode: Node = {
      id: nodeId,
      data: { label: concept.label },
      position: { x, y },
      style: {
        background: color.bg,
        color: 'white',
        border: `2px solid ${color.border}`,
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: '500',
        maxWidth: '120px',
        textAlign: 'center' as const,
      },
    };

    const newEdge: Edge = {
      id: `edge-${nodeId}`,
      source: 'center',
      target: nodeId,
      animated: true,
      style: { stroke: color.border },
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

  // Connect to LiveKit room
  const connectToLiveKit = useCallback(async (mediaStream: MediaStream) => {
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

      // Connect to room
      await room.connect(livekitUrl, token);
      console.log('Connected to LiveKit room:', room.name);

      // Publish our audio and video tracks
      const audioTrack = mediaStream.getAudioTracks()[0];
      const videoTrack = mediaStream.getVideoTracks()[0];

      if (audioTrack) {
        await room.localParticipant.publishTrack(audioTrack);
        console.log('Published audio track');
      }

      if (videoTrack) {
        await room.localParticipant.publishTrack(videoTrack);
        console.log('Published video track');
      }

      setLiveKitConnected(true);

    } catch (error) {
      console.error('LiveKit connection error:', error);
      // Don't fail the recording if LiveKit fails - still allow local recording
    }
  }, [handleAgentMessage]);

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

      // Reset mind map
      setNodes([{
        id: 'center',
        data: { label: 'Lecture' },
        position: { x: 250, y: 200 },
        style: {
          background: '#3b82f6',
          color: 'white',
          border: '2px solid #1d4ed8',
          borderRadius: '50%',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      }]);
      setEdges([]);
      nodeCounterRef.current = 0;
      setTranscripts([]);

      // Connect to LiveKit to enable agent transcription
      await connectToLiveKit(stream);
    }
  };

  const handlePauseRecording = () => {
    setIsPaused(true);
    // Note: LiveKit doesn't have pause - tracks keep streaming
    // You could mute the tracks if needed
  };

  const handleResumeRecording = () => {
    setIsPaused(false);
  };

  const handleStopRecording = () => {
    setShowConfirmation(true);
  };

  const confirmStopRecording = () => {
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
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          {isRecording || recordingEnded ? 'Return to Home' : 'Back'}
        </button>
      </div>

      {/* Connection Status - Top Right */}
      {isRecording && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          {liveKitConnected ? (
            <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 text-sm font-medium">
                {agentReady ? 'Agent Connected' : 'Connecting to Agent...'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-yellow-700 text-sm font-medium">Local Recording</span>
            </div>
          )}
        </div>
      )}

      {/* Main Layout: Recording on Left, Flow Board on Right */}
      <div className="flex h-screen w-full">
        {/* LEFT SIDE - Recording Interface */}
        <div className={`flex flex-col items-center justify-center px-4 pt-20 transition-all duration-500 ${showFlowBoard ? 'w-1/2' : 'w-full'}`}>
          {showChat ? (
            <div className="w-full max-w-2xl space-y-6 animate-[fade-in-down_0.8s_ease-out] transition-transform duration-500 ease-out">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Chat</h1>
                <p className="text-gray-300">Ask questions about the session. AI responses coming soon.</p>
              </div>

              {/* Show transcripts if we have them */}
              {transcripts.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">Session Transcript:</h3>
                  <p className="text-sm text-blue-700">{transcripts.join(' ')}</p>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-[60vh] flex flex-col">
              <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 h-[70vh] flex flex-col">
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-sm text-gray-400 text-center">No messages yet. Start the conversation.</div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow message-pop ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="border-t border-gray-700 p-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const value = chatInput.trim();
                    if (!value) return;
                    setChatMessages((prev) => [
                      ...prev,
                      { role: 'user', content: value },
                      { role: 'assistant', content: 'AI response placeholder. Integration coming soon.' },
                    ]);
                    setChatInput('');
                  }}
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 border border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-white bg-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Type your question..."
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : hasPermission === null ? (
            <div className="text-center animate-fade-in-down">
              <h1 className="text-4xl font-bold text-white mb-4">
                Requesting Permissions...
              </h1>
              <p className="text-gray-300">
                Please allow access to your camera and microphone
              </p>
            </div>
          ) : hasPermission && !permissionError ? (
            <div className="w-full max-w-xl space-y-6 animate-fade-in-down">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {!isRecording && 'Ready to Record'}
                  {isRecording && !isPaused && 'Recording in progress...'}
                  {isRecording && isPaused && 'Recording paused'}
                </h1>
                <p className="text-gray-300">
                  {!isRecording && 'Check your camera position and audio quality'}
                </p>
              </div>

              {/* Video Preview */}
              <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg">
                    <div className="w-3 h-3 bg-red-200 rounded-full animate-pulse" />
                    <span className="text-white font-semibold text-sm">
                      Recording
                    </span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    Start Recording
                  </button>
                ) : (
                  <>
                    {!isPaused ? (
                      <button
                        onClick={handlePauseRecording}
                        className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={handleResumeRecording}
                        className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={handleStopRecording}
                      className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      Stop Recording
                    </button>
                  </>
                )}
              </div>

              <p className="text-center text-sm text-gray-500">
                {liveKitConnected
                  ? 'Your audio is being transcribed in real-time by the AI agent.'
                  : 'Your feed will be saved when you stop.'}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-xl animate-fade-in-down">
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-red-800 mb-4">
                  Permission Denied
                </h1>
                <p className="text-red-700 mb-6 text-lg">{permissionError}</p>

                {cameraError && (
                  <div className="mb-4 text-red-600 font-semibold">
                    Camera not detected
                  </div>
                )}
                {micError && (
                  <div className="mb-4 text-red-600 font-semibold">
                    Microphone not detected
                  </div>
                )}

                <div className="bg-white rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-bold text-gray-900 mb-3">
                    How to fix this:
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Check your browser's permission settings</li>
                    <li>
                      Look for a camera/microphone icon in the address bar
                    </li>
                    <li>Click it and select "Allow" for this site</li>
                    <li>Refresh the page and try again</li>
                    <li>
                      Alternatively, check your system's privacy settings for this
                      browser
                    </li>
                  </ol>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/home"
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    Go Back
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - React Flow Board in Modal */}
        <div
          className={`transition-all duration-700 ease-out overflow-hidden flex items-center justify-center ${
            showFlowBoard ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {showFlowBoard && (
//             <div className="h-full w-full flex flex-col">
//               <div className="px-6 py-4 border-b border-gray-300 bg-gradient-to-r from-blue-50 to-purple-50">
//                 <h2 className="text-xl font-bold text-gray-900">Live Mind Map</h2>
//                 <p className="text-sm text-gray-600">
//                   {agentReady
//                     ? 'Concepts appear as the AI processes your speech'
//                     : liveKitConnected
//                       ? 'Waiting for agent to connect...'
//                       : 'Connect to see real-time concepts'}
//                 </p>
//               </div>
//               <div className="flex-1">
//                 <ReactFlow
//                   nodes={nodes}
//                   edges={edges}
//                   fitView
//                   attributionPosition="bottom-left"
//                 />
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="w-full h-full shadow-2xl rounded-2xl overflow-hidden border border-gray-700 bg-gray-900 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-900 to-purple-900">
                  <h2 className="text-xl font-bold text-white">Live Processing</h2>
                  <p className="text-sm text-gray-300">Visualization of content being processed
                    {agentReady
                    ? 'Concepts appear as the AI processes your speech'
                    : liveKitConnected
                      ? 'Waiting for agent to connect...'
                      : 'Connect to see real-time concepts'}
                  </p>
                </div>
                <div className="flex-1 bg-gray-800">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    attributionPosition="bottom-left"
                  />
                </div>
              </div>
              {/* Live transcript preview */}
              {transcripts.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 max-h-24 overflow-y-auto">
                  <p className="text-xs text-gray-500 font-medium mb-1">Latest transcript:</p>
                  <p className="text-sm text-gray-700">{transcripts[transcripts.length - 1]}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-down">
          <div className="bg-white rounded-lg p-8 max-w-md shadow-lg animate-fade-in-down">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              End Recording?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end this feed? The recording will be saved.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={cancelStopRecording}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmStopRecording}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                End Feed
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
                    onClick={() => {
                      if (!recordingTitle.trim()) {
                        setRecordingTitleError('Please enter a title before saving.');
                        return;
                      }
                      setRecordingTitleError('');
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
