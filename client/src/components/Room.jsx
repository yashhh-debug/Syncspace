import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Group, Panel, Separator } from 'react-resizable-panels';
import {
  Code2,
  Edit3,
  MessageSquare,
  Copy,
  Check,
  Play,
  Flame,
  UserCheck,
  Clock,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useYjs } from '../hooks/useYjs';
import Whiteboard from './Whiteboard';
import CodeEditor from './CodeEditor';
import ProblemDescription from './ProblemDescription';
import { PROBLEMS } from '../data/problems';

export default function Room() {
  const { roomId } = useParams();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const { doc, awareness, ready } = useYjs(roomId);

  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'whiteboard' | 'discussion'
  const [copied, setCopied] = useState(false);

  // Timer State for Interviews
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Room invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

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
    <div className="leetcode-app">
      <Toaster position="top-center" theme="dark" />

      {/* --- TOP LEETCODE NAVBAR --- */}
      <header className="leetcode-header">
        <div className="header-left">
          <div className="brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <span className="brand-icon">⚡</span>
            <span className="brand-name">SyncSpace</span>
          </div>

          <div className="header-divider" />

          {/* Problem Selector Dropdown */}
          <div className="problem-selector-wrapper">
            <select
              value={selectedProblem.id}
              onChange={(e) => {
                const found = PROBLEMS.find((p) => p.id === e.target.value);
                if (found) setSelectedProblem(found);
              }}
              className="problem-select"
            >
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>
        </div>

        {/* Header Center Controls */}
        <div className="header-center">
          <div className="timer-badge" onClick={() => setIsTimerRunning(!isTimerRunning)} title="Click to pause/resume interview timer">
            <Clock size={14} />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>

        {/* Header Right Actions */}
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

          <button className="btn-share-link" onClick={handleCopyLink}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Share Room'}</span>
          </button>

          <div className="streak-badge">
            <Flame size={14} /> {user?.streak || 0}d streak
          </div>

          <div className="user-badge" title={`Joined as ${user?.name}`}>
            <UserCheck size={14} />
            <span>{user?.name}</span>
          </div>

          <button className="btn-icon-ghost" onClick={() => navigate('/dashboard')} title="Dashboard">
            <LayoutDashboard size={16} />
          </button>

          <button className="btn-icon-ghost" onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* --- RESIZABLE WORKSPACE PANELS --- */}
      <main className="workspace-container">
        <Group orientation="horizontal" style={{ height: '100%', width: '100%' }}>
          {/* LEFT PANEL: Problem Description / Whiteboard */}
          <Panel defaultSize={42} minSize={25}>
            <div className="panel-left-content">
              {/* Left Panel Tabs */}
              <div className="left-panel-tabs">
                <button
                  className={`panel-tab-btn ${leftTab === 'description' ? 'active' : ''}`}
                  onClick={() => setLeftTab('description')}
                >
                  <Code2 size={15} />
                  <span>Description</span>
                </button>

                <button
                  className={`panel-tab-btn ${leftTab === 'whiteboard' ? 'active' : ''}`}
                  onClick={() => setLeftTab('whiteboard')}
                >
                  <Edit3 size={15} />
                  <span>Whiteboard</span>
                </button>

                <button
                  className={`panel-tab-btn ${leftTab === 'discussion' ? 'active' : ''}`}
                  onClick={() => setLeftTab('discussion')}
                >
                  <MessageSquare size={15} />
                  <span>Discussion</span>
                </button>
              </div>

              {/* Tab Views */}
              <div className="left-panel-view">
                {leftTab === 'description' && (
                  <ProblemDescription problem={selectedProblem} />
                )}

                {leftTab === 'whiteboard' && (
                  <Whiteboard doc={doc} awareness={awareness} user={user} />
                )}

                {leftTab === 'discussion' && (
                  <div className="discussion-view">
                    <h3>💬 Collaborative Discussion & Hints</h3>
                    <p className="text-muted">Discuss algorithmic strategies, time complexity, and edge cases live with your peers.</p>
                    <div className="hint-card">
                      <Sparkles size={16} className="hint-icon" />
                      <div>
                        <strong>Hint 1:</strong> Try storing visited numbers in a Hash Map to look up complements in <code>O(1)</code> time.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* HORIZONTAL SPLITTER */}
          <Separator className="resize-handle-horizontal" />

          {/* RIGHT PANEL: Monaco Code Editor & Console Output */}
          <Panel defaultSize={58} minSize={35}>
            <CodeEditor doc={doc} roomId={roomId} />
          </Panel>
        </Group>
      </main>

    </div>
  );
}