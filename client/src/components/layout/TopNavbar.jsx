import { motion } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Users,
  Bell,
  Moon,
  Sun,
  Hash,
} from 'lucide-react';

export default function TopNavbar({
  roomId,
  isConnected,
  collaborators = [],
  onToggleTheme,
  isDark = true,
  user,
}) {
  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4">
        {roomId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <Hash size={14} className="text-[var(--primary)]" />
            <span className="font-mono text-sm">{roomId}</span>
          </div>
        )}

        {/* Connection */}
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <>
              <Wifi size={16} className="text-[var(--success)]" />
              <span className="text-[var(--success)]">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-[var(--danger)]" />
              <span className="text-[var(--danger)]">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Collaborators */}
        {collaborators.length > 0 && (
          <div className="flex items-center -space-x-2">
            {collaborators.slice(0, 4).map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[var(--bg)] bg-[var(--primary)] flex items-center justify-center text-xs font-medium"
                title={c.name || c}
              >
                {(c.name || c).charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborators.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-[var(--bg)] bg-[var(--card)] flex items-center justify-center text-xs">
                +{collaborators.length - 4}
              </div>
            )}
          </div>
        )}

        <button className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--text-secondary)] hover:text-white transition">
          <Bell size={18} />
        </button>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--text-secondary)] hover:text-white transition"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-500 flex items-center justify-center text-sm font-medium">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}