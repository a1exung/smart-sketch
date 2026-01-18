'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import NeuralNetworkBackground from '@/components/NeuralNetworkBackground';

export default function RecordPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const router = useRouter();

  // React Flow nodes and edges
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      data: { label: 'Recording Started' },
      position: { x: 250, y: 25 },
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '1px solid #1d4ed8',
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '2',
      data: { label: 'Processing' },
      position: { x: 200, y: 150 },
      style: {
        background: '#10b981',
        color: 'white',
        border: '1px solid #059669',
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      id: '3',
      data: { label: 'Visualization' },
      position: { x: 300, y: 150 },
      style: {
        background: '#f59e0b',
        color: 'white',
        border: '1px solid #d97706',
        borderRadius: '8px',
        padding: '10px',
      },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
  ]);

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

        // Setup MediaRecorder
        const mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          chunksRef.current = [];
        };
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
    };
  }, []);

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingEnded(false);
      // Trigger React Flow board opening animation
      setShowFlowBoard(true);
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleStopRecording = () => {
    setShowConfirmation(true);
  };

  const confirmStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
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
    }
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
                Your feed will be saved when you stop.
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
                    ❌ Camera not detected
                  </div>
                )}
                {micError && (
                  <div className="mb-4 text-red-600 font-semibold">
                    ❌ Microphone not detected
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
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="w-full h-full shadow-2xl rounded-2xl overflow-hidden border border-gray-700 bg-gray-900 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-900 to-purple-900">
                  <h2 className="text-xl font-bold text-white">Live Processing</h2>
                  <p className="text-sm text-gray-300">Visualization of content being processed</p>
                </div>
                <div className="flex-1 bg-gray-800">
                  <ReactFlow nodes={nodes} edges={edges} fitView>
                    {/* You can add controls and other ReactFlow components here */}
                  </ReactFlow>
                </div>
              </div>
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
