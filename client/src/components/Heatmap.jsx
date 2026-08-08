import { useState, useMemo } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Heatmap({ activity = [] }) {
  const [tooltip, setTooltip] = useState(null);

  // Fast lookup map
  const activityMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(activity)) {
      activity.forEach((item) => {
        if (item?.date) {
          map.set(item.date, item.count || 1);
        }
      });
    }
    return map;
  }, [activity]);

  // Total contributions
  const totalContributions = useMemo(() => {
    let total = 0;
    activityMap.forEach((count) => {
      total += count;
    });
    return total;
  }, [activityMap]);

  // Build last 12 months as separate blocks
  const months = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const weeks = [];
      let currentWeek = [];

      // Pad beginning of first week (Sunday = 0)
      const startPad = firstDay.getDay();
      for (let p = 0; p < startPad; p++) {
        currentWeek.push(null);
      }

      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const dateStr = date.toISOString().slice(0, 10);
        const count = activityMap.get(dateStr) || 0;

        let level = 0;
        if (count === 1) level = 1;
        else if (count <= 3) level = 2;
        else if (count <= 6) level = 3;
        else if (count > 6) level = 4;

        currentWeek.push({
          date: dateStr,
          count,
          level,
          formatted: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      // Pad end of last week
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }

      result.push({
        name: MONTH_NAMES[month],
        year,
        weeks,
      });
    }

    return result;
  }, [activityMap]);

  const handleMouseEnter = (e, day) => {
    if (!day) return;
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      text:
        day.count === 0
          ? `No contributions on ${day.formatted}`
          : `${day.count} contribution${day.count > 1 ? 's' : ''} on ${day.formatted}`,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="codolio-heatmap">
      {/* Header */}
      <div className="heatmap-header">
        <h4 className="heatmap-title">
          <span>{totalContributions}</span> contribution
          {totalContributions !== 1 ? 's' : ''} in the last year
        </h4>
      </div>

      {/* Months blocks */}
      <div className="heatmap-months">
        {months.map((month) => (
          <div key={`${month.name}-${month.year}`} className="heatmap-month">
            <div className="month-grid">
              {month.weeks.map((week, wi) => (
                <div key={wi} className="week-col">
                  {week.map((day, di) =>
                    day ? (
                      <div
                        key={day.date}
                        className={`day level-${day.level}`}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={handleMouseLeave}
                      />
                    ) : (
                      <div key={di} className="day empty" />
                    )
                  )}
                </div>
              ))}
            </div>
            <div className="month-label">{month.name}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-boxes">
          <div className="day level-0" />
          <div className="day level-1" />
          <div className="day level-2" />
          <div className="day level-3" />
          <div className="day level-4" />
        </div>
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}