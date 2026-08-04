import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hash,
  Users,
  Wifi,
  LogOut,
  LayoutDashboard,
  Zap,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useYjs } from '../hooks/useYjs';
import Whiteboard from './Whiteboard';
import CodeEditor from './CodeEditor';

export default function Room() {
  const { roomId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { doc, ready } = useYjs(roomId);

  // ── Loading state ──────────────────────────────────────────────
  if (!ready || !doc) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>
          Connecting to room <strong className="font-mono">{roomId}</strong>…
        </p>
      </div>
    );
  }

  // ── Main room UI ───────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Top Navbar ─────────────────────────────────────────── */}
      <header className="header">
        {/* Logo */}
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>SyncSpace</h1>
        </div>

        {/* Right side */}
        <div className="header-right">
          {/* Streak */}
          <div className="streak-badge">
            🔥 {user?.streak || 0} day streak
          </div>

          {/* Room badge */}
          <div className="room-info" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hash size={14} style={{ color: 'var(--primary)' }} />
            <span>
              Room: <strong>{roomId}</strong>
            </span>
          </div>

          {/* User */}
          <div className="user-info">
            You: <strong>{user?.name}</strong>
          </div>

          {/* Connection indicator (visual only – real status lives in Yjs) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              color: 'var(--success)',
              padding: '0 10px',
              borderLeft: '1px solid var(--border)',
            }}
          >
            <Wifi size={14} />
            <span>Live</span>
          </div>

          {/* Actions */}
          <button
            className="btn-ghost"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>

          <button
            className="btn-ghost"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* ── Room Info Card (premium) ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          padding: '12px 20px 0',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20,
            padding: '14px 20px',
            marginBottom: 12,
            borderRadius: 14,
          }}
        >
          {/* Room ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(99,102,241,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Hash size={16} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Room ID
              </div>
              <div className="font-mono" style={{ fontWeight: 500, fontSize: 14 }}>
                {roomId}
              </div>
            </div>
          </div>

          {/* Connected users (placeholder – wire real count later) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(34,197,94,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
              }}
            >
              <Users size={16} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Connected
              </div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {user?.name ? 1 : 0} user{user?.name ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Latency (visual) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(245,158,11,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning)',
              }}
            >
              <Activity size={16} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Latency
              </div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>~12 ms</div>
            </div>
          </div>

          {/* Sync status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(56,189,248,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--live)',
              }}
            >
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Sync Status
              </div>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--success)' }}>
                Synced
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Workspace (Whiteboard + CodeEditor) ────────────────── */}
      <main className="main">
        <Whiteboard doc={doc} />
        <CodeEditor doc={doc} roomId={roomId} />
      </main>
    </div>
  );
}