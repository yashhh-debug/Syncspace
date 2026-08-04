import { useMemo } from 'react';

export default function Timeline({
  events = [],
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  playbackSpeed = 1,
  isReplayMode = false,
  onSeek,
  onTogglePlay,
  onSpeedChange,
  onExitReplay,
}) {
  // Format milliseconds to mm:ss
  const formatTime = (ms) => {
    if (!ms || isNaN(ms) || ms < 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Group events into visual timeline markers
  const markers = useMemo(() => {
    if (!events.length || !duration) return [];
    return events.map((evt) => {
      const offsetPct = Math.min(100, Math.max(0, ((evt.timestamp - events[0].timestamp) / duration) * 100));
      return {
        id: evt._id || `${evt.timestamp}-${evt.eventType}`,
        type: evt.eventType,
        pct: offsetPct,
        actor: evt.actorName || 'User',
      };
    });
  }, [events, duration]);

  const handleSliderChange = (e) => {
    const newTime = Number(e.target.value);
    if (onSeek) onSeek(newTime);
  };

  return (
    <div className={`timeline-container ${isReplayMode ? 'replay-active' : ''}`}>
      {/* Top Banner Status */}
      <div className="timeline-header">
        <div className="timeline-status">
          <span className="timeline-badge">
            {isReplayMode ? '⏪ HISTORICAL REPLAY' : '🔴 LIVE RECORDING'}
          </span>
          <span className="timeline-timer">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {isReplayMode && (
          <button className="btn-exit-replay" onClick={onExitReplay}>
            ⚡ Return to Live Mode
          </button>
        )}
      </div>

      {/* Scrub Bar & Event Markers Track */}
      <div className="timeline-track-wrapper">
        <div className="timeline-markers-track">
          {markers.map((m) => (
            <div
              key={m.id}
              className={`timeline-marker marker-${m.type}`}
              style={{ left: `${m.pct}%` }}
              title={`${m.type} by ${m.actor}`}
            />
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={handleSliderChange}
          className="timeline-slider"
        />
      </div>

      {/* Controls Bar */}
      <div className="timeline-controls">
        <div className="controls-left">
          <button className="btn-control play-btn" onClick={onTogglePlay}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <div className="speed-selector">
            <span className="speed-label">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
                onClick={() => onSpeedChange && onSpeedChange(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="legend-mini">
          <span className="dot dot-code" /> Code
          <span className="dot dot-canvas" /> Canvas
          <span className="dot dot-chat" /> Chat
        </div>
      </div>
    </div>
  );
}
