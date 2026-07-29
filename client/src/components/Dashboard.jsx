import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Heatmap from './Heatmap';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>SyncSpace</h1>
        </div>
        <div className="header-right">
          <span className="streak-badge">🔥 {user.streak} day streak</span>
          <span className="user-info">Hi, <strong>{user.name}</strong></span>
          <button className="btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <h2>{user.name}</h2>
          <p className="email">{user.email}</p>

          <div className="stats-grid">
            <div className="stat">
              <div className="stat-value">{user.streak}</div>
              <div className="stat-label">Current Streak</div>
            </div>
            <div className="stat">
              <div className="stat-value">{user.maxStreak}</div>
              <div className="stat-label">Max Streak</div>
            </div>
            <div className="stat">
              <div className="stat-value">{user.totalActiveDays}</div>
              <div className="stat-label">Active Days</div>
            </div>
          </div>
        </div>

        {/* Join Room */}
        <div className="join-card">
          <h3>Join / Create Room</h3>
          <div className="join-form">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID (e.g. room1)"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button className="btn-primary" onClick={handleJoin}>
              Join Room
            </button>
          </div>
        </div>

        {/* Heatmap */}
        <div className="heatmap-card">
          <h3>Activity</h3>
          <p className="heatmap-sub">
            {user.totalActiveDays} active days · Max streak {user.maxStreak}
          </p>
          <Heatmap activity={user.activity || []} />
        </div>
      </div>
    </div>
  );
}