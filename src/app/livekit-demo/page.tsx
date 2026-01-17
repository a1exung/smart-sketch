'use client';

import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

type Props = {
  isActive: boolean;
  onConceptExtracted: (concept?: string) => void;
};

export default function LiveKitCapture({ isActive }: Props) {
  if (!isActive) return null;

  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const token = process.env.NEXT_PUBLIC_LIVEKIT_TOKEN;

  if (!url || !token) {
    return <div className="text-red-500">Missing LiveKit env vars</div>;
  }

  return (
    <div className="h-full w-full">
      <LiveKitRoom
        serverUrl={url}
        token={token}
        connect={true}
        video={true}
        audio={true}
        style={{ height: '100%' }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
