import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMedia } from "../hooks/useMedia";
import { connectSignaling } from "../Services/signaling";

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const stream = useMedia(); // hook that calls getUserMedia()
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const toggleAudio = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsAudioMuted(!track.enabled);
    });
  };

  const toggleVideo = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsVideoMuted(!track.enabled);
    });
  };

  useEffect(() => {
    if (!stream) return;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    const ws = connectSignaling(roomId || "default-room");

    // Show local camera stream
    if (localRef.current) {
      localRef.current.srcObject = stream;
    }

    // Add stream tracks to peer
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    // Handle remote tracks
    peer.ontrack = (e) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = e.streams[0];
      }
    };

    // ICE candidate exchange
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        ws.send(JSON.stringify({ type: "ice-candidate", data: e.candidate }));
      }
    };

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "offer") {
        await peer.setRemoteDescription(new RTCSessionDescription(data.data));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", data: answer }));
      } else if (data.type === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(data.data));
      } else if (data.type === "ice-candidate") {
        try {
          await peer.addIceCandidate(data.data);
        } catch (err) {
          console.error("Error adding ICE candidate", err);
        }
      }
    };

    // Make offer
    (async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      ws.send(JSON.stringify({ type: "offer", data: offer }));
    })();

    // Cleanup
    return () => {
      ws.close();
      peer.close();
    };
  }, [stream, roomId]);

  // ✅ Screen Sharing
  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const peer = peerRef.current;
      if (!peer) return;

      const sender = peer.getSenders().find((s) => s.track?.kind === "video");
      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      // Show screen locally
      if (localRef.current) {
        localRef.current.srcObject = screenStream;
      }

      screenTrack.onended = () => {
        const originalTrack = stream?.getVideoTracks()[0];
        if (originalTrack && sender) {
          sender.replaceTrack(originalTrack);
          if (localRef.current) {
            localRef.current.srcObject = stream;
          }
        }
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Meeting Room: {roomId}</h2>

      <button
        onClick={handleShareScreen}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Share Screen
      </button>
      <div className="flex gap-2 mt-4">
        <button
          onClick={toggleAudio}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        </button>
        <button
          onClick={toggleVideo}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          {isVideoMuted ? "Turn On Video" : "Turn Off Video"}
        </button>
      </div>

      <div className="flex gap-4 mt-4">
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="w-1/2 border rounded"
        />
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="w-1/2 border rounded"
        />
      </div>
    </div>
  );
};

export default Room;
