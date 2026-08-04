import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import Heatmap from './Heatmap';

export default function Dashboard() {
  const { user, logout, recordActivity } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const [joinInput, setJoinInput] = useState('');

  const handleCreateRoom = () => {
    const newRoomId = `sync-${Math.random().toString(36).substring(2, 9)}`;
    recordActivity();
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (!joinInput.trim()) return;
    let cleanId = joinInput.trim();
    if (cleanId.includes('/room/')) {
      cleanId = cleanId.split('/room/')[1].split('?')[0].split('#')[0];
    }
    if (cleanId) {
      recordActivity();
      navigate(`/room/${cleanId}`);
    }
  };

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading user profile...</p>
      </div>
    );
  }

  const name = user.name || 'User';
  const email = user.email || 'No email provided';

  return (
    <div className="dashboard">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>SyncSpace</h1>
        </div>
        <div className="header-right">
          {/* Light, Dark, System Theme Switcher */}
          <div className="theme-toggle-group">
            <button
              className={`btn-theme ${themeMode === 'light' ? 'active' : ''}`}
              onClick={() => setThemeMode('light')}
              title="Light Mode"
            >
              <Sun size={13} />
            </button>
            <button
              className={`btn-theme ${themeMode === 'dark' ? 'active' : ''}`}
              onClick={() => setThemeMode('dark')}
              title="Dark Mode"
            >
              <Moon size={13} />
            </button>
            <button
              className={`btn-theme ${themeMode === 'system' ? 'active' : ''}`}
              onClick={() => setThemeMode('system')}
              title="System Theme"
            >
              <Monitor size={13} />
            </button>
          </div>

          <span className="streak-badge">🔥 {user.streak || 0} day streak</span>
          <span className="user-info">Hi, <strong>{name}</strong></span>
          <button className="btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          <h2>{name}</h2>
          <p className="email">{email}</p>

          <div className="stats-grid">
            <div className="stat">
              <div className="stat-value">{user.streak || 0}</div>
              <div className="stat-label">Current Streak</div>
            </div>
            <div className="stat">
              <div className="stat-value">{user.maxStreak || 0}</div>
              <div className="stat-label">Max Streak</div>
            </div>
            <div className="stat">
              <div className="stat-value">{user.totalActiveDays || 0}</div>
              <div className="stat-label">Active Days</div>
            </div>
          </div>
        </div>

        {/* Room Actions Grid */}
        <div className="room-actions-grid">
          {/* Create Room Card */}
          <div className="room-card create-card">
            <div className="room-card-icon">⚡</div>
            <div className="room-card-content">
              <h3>Create New Room</h3>
              <p>Start a new collaborative workspace with whiteboard and live code editor.</p>
              <button className="btn-primary create-btn" onClick={handleCreateRoom}>
                🚀 Create Room
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="room-card join-card">
            <div className="room-card-icon">🔗</div>
            <div className="room-card-content">
              <h3>Join Existing Room</h3>
              <p>Enter a Room ID or paste a shareable invite link from a teammate.</p>
              <div className="join-form">
                <input
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  placeholder="Paste Room ID or URL (e.g. sync-a7x9k2)"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <button className="btn-secondary" onClick={handleJoinRoom}>
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="heatmap-card">
          <Heatmap
            activity={user.activity || []}
            activeDays={user.totalActiveDays || 0}
            maxStreak={user.maxStreak || 0}
          />
        </div>
      </div>
    </div>
  );
}