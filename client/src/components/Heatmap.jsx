import { useState, useMemo } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function Heatmap({ activity = [] }) {
  const [tooltip, setTooltip] = useState(null);

  // Fast map lookup for activity counts by date ("YYYY-MM-DD")
  const activityMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(activity)) {
      activity.forEach((item) => {
        if (item && item.date) {
          map.set(item.date, item.count || 1);
        }
      });
    }
    return map;
  }, [activity]);

  // Total contributions count
  const totalContributions = useMemo(() => {
    let total = 0;
    activityMap.forEach((count) => {
      total += count;
    });
    return total;
  }, [activityMap]);

  // Build 53-week grid ending today
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const totalDays = 52 * 7 + currentDayOfWeek + 1; // ~365-371 days

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (totalDays - 1));

    const weeksArr = [];
    const monthLabelsArr = [];
    let currentWeek = [];
    let lastMonth = -1;
    let lastLabelWeekIdx = -10;

    const formatDateStr = (dateObj) => {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateStr = formatDateStr(d);
      const month = d.getMonth();
      const count = activityMap.get(dateStr) || 0;

      // Determine distinct green levels 0 to 4
      let level = 0;
      if (count > 0) {
        if (count === 1) level = 1;
        else if (count <= 3) level = 2;
        else if (count <= 6) level = 3;
        else level = 4;
      }

      const dayData = {
        date: dateStr,
        count,
        level,
        dayOfWeek,
        formattedDate: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      currentWeek.push(dayData);

      // Track month labels when a month starts in a new week column
      if (dayOfWeek === 0) {
        if (month !== lastMonth) {
          const currentWeekIdx = weeksArr.length;
          // Ensure at least 3 weeks spacing between month labels to avoid overlap
          if (currentWeekIdx - lastLabelWeekIdx >= 3) {
            monthLabelsArr.push({
              name: MONTH_NAMES[month],
              weekIndex: currentWeekIdx,
            });
            lastLabelWeekIdx = currentWeekIdx;
          }
          lastMonth = month;
        }
      }

      if (dayOfWeek === 6) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    return { weeks: weeksArr, monthLabels: monthLabelsArr };
  }, [activityMap]);

  const handleMouseEnter = (e, day) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      text: day.count === 0
        ? `No contributions on ${day.formattedDate}`
        : `${day.count} contribution${day.count > 1 ? 's' : ''} on ${day.formattedDate}`,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="github-heatmap-container">
      {/* Header Summary */}
      <div className="heatmap-header">
        <h4 className="heatmap-title">
          <span>{totalContributions}</span> contribution{totalContributions !== 1 ? 's' : ''} in the last year
        </h4>
      </div>

      {/* Main Heatmap Graph */}
      <div className="heatmap-graph-wrapper">
        {/* Month Labels Header */}
        <div className="heatmap-months-header">
          <div className="weekday-spacer" />
          <div className="months-list">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="month-label"
                style={{ left: `${m.weekIndex * 14}px` }}
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Calendar Body: Weekday Labels + 7-Row Grid */}
        <div className="heatmap-body">
          {/* Weekday Labels (Mon, Wed, Fri) */}
          <div className="weekday-labels">
            {DAY_LABELS.map((label, idx) => (
              <span key={idx} className="weekday-label">
                {label}
              </span>
            ))}
          </div>

          {/* Weeks Columns Grid */}
          <div className="heatmap-grid">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="heatmap-week-col">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`heatmap-day level-${day.level}`}
                    onMouseEnter={(e) => handleMouseEnter(e, day)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="heatmap-footer">
        <span className="legend-label">Less</span>
        <div className="legend-cells">
          <div className="legend-day level-0" title="0 contributions" />
          <div className="legend-day level-1" title="1 contribution" />
          <div className="legend-day level-2" title="2-3 contributions" />
          <div className="legend-day level-3" title="4-6 contributions" />
          <div className="legend-day level-4" title="7+ contributions" />
        </div>
        <span className="legend-label">More</span>
      </div>

      {/* Floating Hover Tooltip */}
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