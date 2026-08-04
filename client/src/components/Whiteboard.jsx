import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Group } from 'react-konva';
import Toolbar from './Toolbar';

export default function Whiteboard({ doc, awareness, user }) {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState([]);
  const [size, setSize] = useState({ width: 600, height: 500 });

  const isDrawing = useRef(false);
  const currentId = useRef(null);
  const containerRef = useRef(null);

  const yLines = doc.getArray('canvas-lines');
  const yShapes = doc.getArray('canvas-shapes');

  // Responsive Stage size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const updateLines = () => setLines(yLines.toArray());
    const updateShapes = () => setShapes(yShapes.toArray());

    yLines.observe(updateLines);
    yShapes.observe(updateShapes);
    updateLines();
    updateShapes();

    return () => {
      yLines.unobserve(updateLines);
      yShapes.unobserve(updateShapes);
    };
  }, [doc]);

  // Sync multi-user Yjs awareness cursors
  useEffect(() => {
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const cursors = [];
      states.forEach((state, clientId) => {
        if (clientId !== awareness.clientID && state.user && state.user.cursor) {
          cursors.push({
            id: clientId,
            name: state.user.name || 'User',
            color: state.user.color || '#38d6e8',
            x: state.user.cursor.x,
            y: state.user.cursor.y,
          });
        }
      });
      setRemoteCursors(cursors);
    };

    awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness]);

  const updateLocalCursor = (e) => {
    if (!awareness || !user) return;
    const stage = e.target.getStage();
    const pos = stage ? stage.getPointerPosition() : null;
    if (pos) {
      awareness.setLocalStateField('user', {
        name: user.name || 'Collaborator',
        color: '#f2b84b',
        cursor: { x: pos.x, y: pos.y },
      });
    }
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    currentId.current = Date.now().toString() + Math.random();

    updateLocalCursor(e);

    if (tool === 'pen' || tool === 'eraser') {
      const newLine = {
        id: currentId.current,
        tool,
        points: [pos.x, pos.y],
        stroke: tool === 'eraser' ? '#09090B' : color,
        strokeWidth: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      };
      yLines.push([newLine]);
    } else if (tool === 'rect' || tool === 'circle') {
      const newShape = {
        id: currentId.current,
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: color,
        strokeWidth,
      };
      yShapes.push([newShape]);
    }
  };

  const handleMouseMove = (e) => {
    updateLocalCursor(e);

    if (!isDrawing.current) return;
    const pos = e.target.getStage().getPointerPosition();

    if (tool === 'pen' || tool === 'eraser') {
      const last = yLines.get(yLines.length - 1);
      if (last && last.id === currentId.current) {
        const updated = { ...last, points: last.points.concat([pos.x, pos.y]) };
        yLines.delete(yLines.length - 1, 1);
        yLines.push([updated]);
      }
    } else if (tool === 'rect' || tool === 'circle') {
      const last = yShapes.get(yShapes.length - 1);
      if (last && last.id === currentId.current) {
        const updated = {
          ...last,
          width: pos.x - last.x,
          height: pos.y - last.y,
        };
        yShapes.delete(yShapes.length - 1, 1);
        yShapes.push([updated]);
      }
    }
  };

  const handleMouseUp = (e) => {
    isDrawing.current = false;
    currentId.current = null;
    updateLocalCursor(e);
  };

  const handleClear = () => {
    yLines.delete(0, yLines.length);
    yShapes.delete(0, yShapes.length);
  };

  return (
    <div className="panel whiteboard-panel">
      <div className="panel-header">
        <span>Whiteboard</span>
        <span className="panel-badge">Konva + Yjs</span>
      </div>

      {/* Positioning context for the floating toolbar */}
      <div className="canvas-container" ref={containerRef}>
        <Stage
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
            {shapes.map((shape) => {
              if (shape.type === 'rect') {
                return (
                  <Rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                  />
                );
              }
              if (shape.type === 'circle') {
                return (
                  <Circle
                    key={shape.id}
                    x={shape.x + shape.width / 2}
                    y={shape.y + shape.height / 2}
                    radius={Math.abs(shape.width / 2)}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                  />
                );
              }
              return null;
            })}

            {/* Remote Awareness Cursors */}
            {remoteCursors.map((c) => (
              <Group key={c.id} x={c.x} y={c.y}>
                <Circle radius={5} fill={c.color} />
                <Text
                  text={c.name}
                  x={8}
                  y={-6}
                  fontSize={11}
                  fill="#ffffff"
                  padding={3}
                  fontStyle="bold"
                />
              </Group>
            ))}
          </Layer>
        </Stage>

        {/* Floating toolbar – bottom center of the whiteboard */}
        <Toolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}