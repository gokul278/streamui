import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  const generateUUID = () => {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // fallback to custom UUID generator or short id
    return Math.random().toString(36).substring(2, 10);
  };

  const handleCreateRoom = () => {
    const newRoomId = generateUUID().slice(0, 8);
    navigate(`/room/${newRoomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Welcome to MeetEase
      </h1>

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleJoin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-2"
        >
          Join Meeting
        </button>

        <button
          onClick={handleCreateRoom}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Create New Meeting
        </button>
      </div>
    </div>
  );
};

export default HomePage;
