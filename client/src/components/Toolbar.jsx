export default function Toolbar({ tool, setTool, color, setColor, strokeWidth, setStrokeWidth, onClear }) {
  const colors = [
    '#38bdf8', // sky
    '#ffffff', // white
    '#f87171', // red
    '#4ade80', // green
    '#facc15', // yellow
    '#c084fc', // purple
    '#fb923c', // orange
  ];

  return (
    <div className="toolbar">
      <div className="tool-group">
        <button className={tool === 'pen' ? 'active' : ''} onClick={() => setTool('pen')}>
          ✏️ Pen
        </button>
        <button className={tool === 'eraser' ? 'active' : ''} onClick={() => setTool('eraser')}>
          🧹 Eraser
        </button>
        <button className={tool === 'rect' ? 'active' : ''} onClick={() => setTool('rect')}>
          ▢ Rect
        </button>
        <button className={tool === 'circle' ? 'active' : ''} onClick={() => setTool('circle')}>
          ○ Circle
        </button>
      </div>

      <div className="tool-group colors">
        {colors.map((c) => (
          <button
            key={c}
            className={`color-btn ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            title={c}
          />
        ))}
      </div>

      <div className="tool-group">
        <label className="stroke-label">
          Size
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
        </label>
      </div>

      <button className="btn-danger" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}