import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  DoorOpen,
  FolderKanban,
  Settings,
  User,
  LogOut,
  Hash,
  Flame,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Heatmap from './Heatmap';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'rooms', icon: DoorOpen, label: 'Rooms' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="dashboard-shell">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <span>SyncSpace</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {activeNav === item.id && <div className="sidebar-indicator" />}
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="topbar-title">
              {activeNav === 'dashboard' && 'Dashboard'}
              {activeNav === 'rooms' && 'Rooms'}
              {activeNav === 'projects' && 'Projects'}
              {activeNav === 'settings' && 'Settings'}
              {activeNav === 'profile' && 'Profile'}
            </h1>
            <p className="topbar-sub">Welcome back, {user.name}</p>
          </div>

          <div className="topbar-right">
            <div className="streak-badge">
              <Flame size={14} />
              {user.streak} day streak
            </div>
            <div className="avatar-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* ===== DASHBOARD VIEW ===== */}
          {activeNav === 'dashboard' && (
            <>
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
              </div>
            </>
          )}

          {/* ===== OTHER VIEWS (placeholders) ===== */}
          {activeNav === 'rooms' && (
            <div className="placeholder-view">
              <DoorOpen size={40} strokeWidth={1.5} />
              <h2>Rooms</h2>
              <p>Your recent rooms will appear here.</p>
            </div>
          )}
          {activeNav === 'projects' && (
            <div className="placeholder-view">
              <FolderKanban size={40} strokeWidth={1.5} />
              <h2>Projects</h2>
              <p>Saved projects coming soon.</p>
            </div>
          )}
          {activeNav === 'settings' && (
            <div className="placeholder-view">
              <Settings size={40} strokeWidth={1.5} />
              <h2>Settings</h2>
              <p>Account & preference settings.</p>
            </div>
          )}
          {activeNav === 'profile' && (
            <div className="placeholder-view">
              <User size={40} strokeWidth={1.5} />
              <h2>Profile</h2>
              <p>Edit your profile information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}