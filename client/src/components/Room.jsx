import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useYjs } from '../hooks/useYjs';
import Whiteboard from './Whiteboard';
import CodeEditor from './CodeEditor';

export default function Room() {
  const { roomId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { doc, ready } = useYjs(roomId);

  if (!ready || !doc) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>
          Connecting to room <strong>{roomId}</strong>...
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>SyncSpace</h1>
        </div>

        <div className="header-right">
          <div className="streak-badge">🔥 {user?.streak || 0} day streak</div>
          <div className="room-info">
            Room: <strong>{roomId}</strong>
          </div>
          <div className="user-info">
            You: <strong>{user?.name}</strong>
          </div>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        <Whiteboard doc={doc} />
        <CodeEditor doc={doc} roomId={roomId} />
      </main>
    </div>
  );
}