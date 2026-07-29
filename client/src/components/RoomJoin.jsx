import { useState } from 'react';

export default function RoomJoin({ onJoin, existingUser }) {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState(existingUser?.username || '');

  const handleJoin = () => {
    if (roomId.trim()) {
      onJoin(roomId.trim(), name.trim() || 'Anonymous');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-big">⚡ SyncSpace</div>
          <p className="subtitle">Collaborative coding & whiteboard for students</p>
        </div>

        {existingUser && (
          <div className="welcome-back">
            Welcome back, <strong>{existingUser.username}</strong> · 🔥 {existingUser.streak} day streak
          </div>
        )}

        <div className="form-group">
          <label>Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. yash"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
        </div>

        <div className="form-group">
          <label>Room ID</label>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g. room1 or project-alpha"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
        </div>

        <button className="btn-primary" onClick={handleJoin}>
          Join Room
        </button>

        <p className="hint">Share the same Room ID with your teammates</p>
      </div>
    </div>
  );
}