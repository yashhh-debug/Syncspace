export default function Heatmap({ activity = [] }) {
  const today = new Date();
  const days = [];

  // Last 12 months ≈ 371 days
  for (let i = 370; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasActivity = activity.some((a) => a.date === dateStr);
    days.push({ date: dateStr, active: hasActivity });
  }

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        {days.map((day) => (
          <div
            key={day.date}
            className={`heatmap-day ${day.active ? 'active' : ''}`}
            title={day.date}
          />
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-box" />
        <div className="legend-box active" />
        <span>More</span>
      </div>
    </div>
  );
}