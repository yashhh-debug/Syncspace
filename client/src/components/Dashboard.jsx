import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hash,
  Calendar,
  ArrowRight,
  DoorOpen,
  FolderKanban,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Heatmap from './Heatmap';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-content">
      {/* Profile card */}
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
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
      </motion.div>

      {/* Right column */}
      <div className="right-column">
        <motion.div
          className="join-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="card-header-row">
            <div>
              <h3>Join / Create Room</h3>
              <p className="card-sub">Enter a room ID to start collaborating</p>
            </div>
            <div className="card-icon">
              <Hash size={18} />
            </div>
          </div>

          <div className="join-form">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="e.g. room1 or team-alpha"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button className="btn-primary" onClick={handleJoin}>
              Join Room
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="heatmap-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header-row">
            <div>
              <h3>Activity</h3>
              <p className="heatmap-sub">
                {user.totalActiveDays} active days · Max streak {user.maxStreak}
              </p>
            </div>
            <div className="card-icon">
              <Calendar size={18} />
            </div>
          </div>
          <Heatmap activity={user.activity || []} />
        </motion.div>

        {/* Quick actions */}
        <div className="quick-actions">
          <button className="quick-card" onClick={() => navigate('/rooms')}>
            <div className="quick-icon">
              <DoorOpen size={18} />
            </div>
            <div>
              <div className="quick-title">Rooms</div>
              <div className="quick-desc">Your recent rooms</div>
            </div>
          </button>
          <button className="quick-card" onClick={() => navigate('/projects')}>
            <div className="quick-icon">
              <FolderKanban size={18} />
            </div>
            <div>
              <div className="quick-title">Projects</div>
              <div className="quick-desc">Saved projects</div>
            </div>
          </button>
          <button className="quick-card" onClick={() => navigate('/settings')}>
            <div className="quick-icon">
              <Settings size={18} />
            </div>
            <div>
              <div className="quick-title">Settings</div>
              <div className="quick-desc">Preferences</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}