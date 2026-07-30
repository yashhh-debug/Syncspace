import { motion } from 'framer-motion';
import { Pencil, Eraser, Square, Circle, Trash2 } from 'lucide-react';

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
}) {
  const colors = [
    '#38bdf8',
    '#ffffff',
    '#f87171',
    '#4ade80',
    '#facc15',
    '#c084fc',
    '#fb923c',
  ];

  const tools = [
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'rect', icon: Square, label: 'Rect' },
    { id: 'circle', icon: Circle, label: 'Circle' },
  ];

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="floating-toolbar"
    >
      <div className="ft-group">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            className={`ft-btn ${tool === id ? 'active' : ''}`}
            onClick={() => setTool(id)}
          >
            <Icon size={13} strokeWidth={2.5} />
          </button>
        ))}
      </div>

      <div className="ft-divider" />

      <div className="ft-group">
        {colors.map((c) => (
          <button
            key={c}
            title={c}
            className={`ft-color ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      <div className="ft-divider" />

      <div className="ft-stroke">
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          title={`Size: ${strokeWidth}`}
        />
        <span className="ft-stroke-value">{strokeWidth}</span>
      </div>

      <div className="ft-divider" />

      <button
        className="ft-btn danger"
        title="Clear canvas"
        onClick={onClear}
      >
        <Trash2 size={13} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}