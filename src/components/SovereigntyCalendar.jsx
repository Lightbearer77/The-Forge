// src/components/SovereigntyCalendar.jsx
//
// SovereigntyCalendar — 13-month Greek calendar view for The Forge
// =================================================================
//
// PROPS:
//   tasks:        Array of task objects from forge-pm-tasks-v5 localStorage
//   onTaskClick:  (task) => void  — called when user clicks a task dot or name
//
// EXPECTED TASK SHAPE (defensive — missing fields handled):
//   {
//     id: string,
//     title: string,
//     goal: 'G1' | 'G2' | 'G3' | 'G4',
//     priority: 'High' | 'Mid' | 'Low',
//     status: 'backlog' | 'in_progress' | 'completed' | etc,
//     startDate: 'YYYY-MM-DD' (optional),
//     dueDate: 'YYYY-MM-DD',
//     completedDate: 'YYYY-MM-DD' (optional),
//     isMilestone: bool (optional),
//     carriedFrom: string (optional) — flag for carryover tasks
//   }
//
// REBELLION BLOCK LOGIC:
//   For each ISO week, computes High+Mid completion rate.
//   >=90% = unlocked (gold). <90% = duty reset (dim).
//
// =================================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';

// ---- Greek calendar definition (13 months × 28 days, starting Jan 1) ----
const GREEK_MONTHS = [
  { name: 'Alpha',   code: 'M01', start: '2026-01-01' },
  { name: 'Beta',    code: 'M02', start: '2026-01-29' },
  { name: 'Gamma',   code: 'M03', start: '2026-02-26' },
  { name: 'Delta',   code: 'M04', start: '2026-03-26' },
  { name: 'Epsilon', code: 'M05', start: '2026-04-23' },
  { name: 'Zeta',    code: 'M06', start: '2026-05-21' },
  { name: 'Eta',     code: 'M07', start: '2026-06-18' },
  { name: 'Theta',   code: 'M08', start: '2026-07-16' },
  { name: 'Iota',    code: 'M09', start: '2026-08-13' },
  { name: 'Kappa',   code: 'M10', start: '2026-09-10' },
  { name: 'Lambda',  code: 'M11', start: '2026-10-08' },
  { name: 'Mu',      code: 'M12', start: '2026-11-05' },
  { name: 'Nu',      code: 'M13', start: '2026-12-03' },
];

// Each Greek month is exactly 4 weeks. Day-of-week order for Jan 1 2026 (Thu).
const DAY_HDRS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
const MABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const GOAL_LABEL = {
  G1: 'G1 — Sovereignty',
  G2: 'G2 — Longhouse',
  G3: 'G3 — Body',
  G4: 'G4 — Legacy Work',
};

const GOAL_COLOR = {
  G1: '#2563a0',
  G2: '#b07010',
  G3: '#356010',
  G4: '#5040b0',
};

const REBELLION_THRESHOLD = 0.9;

// ---- Date helpers ----
const pad = n => String(n).padStart(2, '0');
const toStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = s => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

// Week number = (greek_month_index * 4) + week_within_month
const weekNumberFor = (monthIdx, dayInMonth) =>
  (monthIdx * 4) + Math.ceil(dayInMonth / 7);

// ---- Component ----
export default function SovereigntyCalendar({ tasks = [], onTaskClick }) {
  const [tooltip, setTooltip] = useState(null); // { x, y, content }
  const [pinnedCell, setPinnedCell] = useState(null); // 'YYYY-MM-DD' | null
  const tooltipRef = useRef(null);

  const today = new Date();
  const todayStr = toStr(today);

  // Determine current Greek month
  const curIdx = useMemo(() => {
    for (let i = GREEK_MONTHS.length - 1; i >= 0; i--) {
      if (today >= parseDate(GREEK_MONTHS[i].start)) return i;
    }
    return 0;
  }, [todayStr]);

  // Bucket tasks by due date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    });
    return map;
  }, [tasks]);

  // Compute Rebellion Block status per week
  const weekStats = useMemo(() => {
    const stats = {}; // weekNum -> { highMid: n, completedHighMid: n }
    tasks.forEach(t => {
      if (!t.dueDate) return;
      if (t.priority !== 'High' && t.priority !== 'Mid') return;
      const due = parseDate(t.dueDate);
      // Find which Greek month this belongs to
      for (let i = 0; i < GREEK_MONTHS.length; i++) {
        const mStart = parseDate(GREEK_MONTHS[i].start);
        const mEnd = addDays(mStart, 27);
        if (due >= mStart && due <= mEnd) {
          const dayInMonth = Math.floor((due - mStart) / 86400000) + 1;
          const wk = weekNumberFor(i, dayInMonth);
          if (!stats[wk]) stats[wk] = { total: 0, completed: 0 };
          stats[wk].total++;
          if (t.status === 'completed' || t.completedDate) stats[wk].completed++;
          break;
        }
      }
    });
    // Compute unlock %
    Object.values(stats).forEach(s => {
      s.pct = s.total > 0 ? s.completed / s.total : 0;
      s.unlocked = s.pct >= REBELLION_THRESHOLD;
    });
    return stats;
  }, [tasks]);

  // Greek calendar position for "today" badge
  const greekToday = useMemo(() => {
    const m = GREEK_MONTHS[curIdx];
    const start = parseDate(m.start);
    const dayInMonth = Math.floor((today - start) / 86400000) + 1;
    const wk = weekNumberFor(curIdx, dayInMonth);
    return { name: m.name, code: m.code, day: dayInMonth, week: wk };
  }, [curIdx, todayStr]);

  // ---- Tooltip handlers ----
  const showTooltip = (e, content) => {
    setTooltip({ x: e.clientX, y: e.clientY, content });
  };
  const moveTooltip = e => {
    setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
  };
  const hideTooltip = () => {
    if (!pinnedCell) setTooltip(null);
  };

  // Close pinned cell on outside click
  useEffect(() => {
    if (!pinnedCell) return;
    const handler = e => {
      if (!e.target.closest('.sc-day-cell')) {
        setPinnedCell(null);
        setTooltip(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [pinnedCell]);

  // ---- Render a single day cell ----
  const renderCell = (cellDate, monthIdx) => {
    const cellStr = toStr(cellDate);
    const isToday = cellStr === todayStr;
    const dayTasks = tasksByDate[cellStr] || [];
    const isPinned = pinnedCell === cellStr;

    return (
      <div
        key={cellStr}
        className={`sc-day-cell ${isToday ? 'sc-today' : ''} ${isPinned ? 'sc-pinned' : ''}`}
        onClick={e => {
          if (dayTasks.length === 0) return;
          e.stopPropagation();
          if (pinnedCell === cellStr) {
            setPinnedCell(null);
            setTooltip(null);
          } else {
            setPinnedCell(cellStr);
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
              x: rect.left + rect.width / 2,
              y: rect.top,
              content: renderCellTooltipContent(dayTasks, cellDate),
            });
          }
        }}
      >
        <span className="sc-day-num">{Math.floor((cellDate - parseDate(GREEK_MONTHS[monthIdx].start)) / 86400000) + 1}</span>
        <span className="sc-day-greg">{MABBR[cellDate.getMonth()]} {cellDate.getDate()}</span>
        {dayTasks.length > 0 && (
          <div className="sc-task-dots">
            {dayTasks.map(t => renderDot(t))}
          </div>
        )}
      </div>
    );
  };

  // ---- Render a single task dot ----
  const renderDot = (t) => {
    const goal = t.goal || 'G1';
    const completed = t.status === 'completed' || !!t.completedDate;
    const isHigh = t.priority === 'High';
    const isLow = t.priority === 'Low';
    const isMilestone = t.isMilestone;
    const isCarryover = !!t.carriedFrom;

    const size = isHigh ? 10 : isLow ? 6 : 8;
    const style = {
      width: size,
      height: size,
      background: completed ? 'transparent' : GOAL_COLOR[goal],
      border: completed
        ? `1.5px solid ${GOAL_COLOR[goal]}`
        : (isMilestone || isCarryover)
          ? `1.5px solid #c8a840`
          : 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      flexShrink: 0,
    };

    return (
      <div
        key={t.id}
        className="sc-task-dot"
        style={style}
        onMouseEnter={e => {
          if (pinnedCell) return;
          e.stopPropagation();
          showTooltip(e, renderDotTooltipContent(t));
        }}
        onMouseMove={e => { if (!pinnedCell) moveTooltip(e); }}
        onMouseLeave={() => { if (!pinnedCell) hideTooltip(); }}
        onClick={e => {
          e.stopPropagation();
          if (onTaskClick) onTaskClick(t);
        }}
      />
    );
  };

  const renderDotTooltipContent = (t) => {
    const goal = t.goal || 'G1';
    const tags = [];
    if (t.priority) tags.push(t.priority);
    if (t.isMilestone) tags.push('Milestone');
    if (t.carriedFrom) tags.push('Carryover');
    if (t.status === 'completed' || t.completedDate) tags.push('Done');
    return (
      <div>
        <div style={{ marginBottom: 4 }}>{t.title}</div>
        <div style={{ fontSize: '0.62rem', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600, color: GOAL_COLOR[goal] }}>
          {GOAL_LABEL[goal]}
        </div>
        {tags.length > 0 && (
          <div style={{ fontSize: '0.6rem', color: '#7a7668', marginTop: 3, letterSpacing: '0.05em' }}>
            {tags.join(' · ')}
          </div>
        )}
      </div>
    );
  };

  const renderCellTooltipContent = (dayTasks, date) => (
    <div>
      <div style={{ fontSize: '0.6rem', color: '#7a7668', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
        {MABBR[date.getMonth()]} {date.getDate()} · {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
      </div>
      {dayTasks.map(t => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 0',
            cursor: 'pointer',
            opacity: (t.status === 'completed' || t.completedDate) ? 0.5 : 1,
            textDecoration: (t.status === 'completed' || t.completedDate) ? 'line-through' : 'none',
          }}
          onClick={() => { onTaskClick && onTaskClick(t); }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: GOAL_COLOR[t.goal || 'G1'], flexShrink: 0,
          }} />
          <span style={{ fontSize: '0.7rem' }}>{t.title}</span>
        </div>
      ))}
    </div>
  );

  // ---- Render a single Greek month card ----
  const renderMonth = (month, mi) => {
    const startDate = parseDate(month.start);
    const endDate = addDays(startDate, 27);
    const isPast = mi < curIdx;
    const isCurrent = mi === curIdx;

    // Build 4 weeks of 7 days
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const weekNum = (mi * 4) + w + 1;
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        weekDays.push(addDays(startDate, w * 7 + d));
      }
      weeks.push({ weekNum, days: weekDays });
    }

    return (
      <div
        key={month.code}
        className={`sc-month-card ${isCurrent ? 'sc-current' : ''} ${isPast ? 'sc-past' : ''}`}
      >
        <div className="sc-month-header">
          <span className="sc-month-name">{month.name} · {month.code}</span>
          <span className="sc-month-range">
            {MABBR[startDate.getMonth()]} {startDate.getDate()} – {MABBR[endDate.getMonth()]} {endDate.getDate()}
          </span>
        </div>

        <div className="sc-cal-grid">
          {/* Week column header (blank) + day-of-week headers */}
          <div className="sc-week-header sc-day-header"></div>
          {DAY_HDRS.map(h => (
            <div key={h} className="sc-day-header">{h}</div>
          ))}

          {/* Weeks */}
          {weeks.map(({ weekNum, days }) => {
            const stats = weekStats[weekNum];
            const unlocked = stats?.unlocked;
            const hasData = stats && stats.total > 0;
            return (
              <React.Fragment key={weekNum}>
                <div
                  className={`sc-week-label ${unlocked ? 'sc-week-unlocked' : ''}`}
                  title={hasData
                    ? `W${weekNum} — ${stats.completed}/${stats.total} High+Mid (${Math.round(stats.pct * 100)}%)`
                    : `W${weekNum}`}
                >
                  W{weekNum}
                  {hasData && (
                    <span className={`sc-rb-bar ${unlocked ? 'sc-rb-unlocked' : ''}`} />
                  )}
                </div>
                {days.map(d => renderCell(d, mi))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- Render ----
  return (
    <div className="sc-container">
      <style>{styles}</style>

      <div className="sc-today-bar">
        Today — <span>{MABBR[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</span>
        &nbsp;·&nbsp; Greek: <span>{greekToday.name} Day {greekToday.day}</span>
        &nbsp;·&nbsp; <span>{greekToday.code} / W{greekToday.week}</span>
      </div>

      <div className="sc-legend">
        {Object.keys(GOAL_LABEL).map(g => (
          <div key={g} className="sc-legend-item">
            <div className="sc-legend-dot" style={{ background: GOAL_COLOR[g] }} />
            {GOAL_LABEL[g]}
          </div>
        ))}
        <div className="sc-legend-divider" />
        <div className="sc-legend-item">
          <div className="sc-legend-dot" style={{ background: '#5c5a52', width: 10, height: 10 }} />
          High
        </div>
        <div className="sc-legend-item">
          <div className="sc-legend-dot" style={{ background: '#5c5a52', width: 8, height: 8 }} />
          Mid
        </div>
        <div className="sc-legend-item">
          <div className="sc-legend-dot" style={{ background: '#5c5a52', width: 6, height: 6 }} />
          Low
        </div>
        <div className="sc-legend-item">
          <div className="sc-legend-dot" style={{ background: 'transparent', border: '1.5px solid #5c5a52' }} />
          Done
        </div>
        <div className="sc-legend-item">
          <div className="sc-legend-dot" style={{ background: '#5c5a52', border: '1.5px solid #c8a840' }} />
          Milestone / Carryover
        </div>
        <div className="sc-legend-divider" />
        <div className="sc-legend-item">
          <div className="sc-legend-rb sc-rb-unlocked" />
          Rebellion Block unlocked
        </div>
      </div>

      <div className="sc-months-grid">
        {GREEK_MONTHS.map((m, i) => renderMonth(m, i))}
      </div>

      {tooltip && (
        <div
          ref={tooltipRef}
          className="sc-tooltip"
          style={{
            left: Math.min(tooltip.x + 14, window.innerWidth - 240),
            top: Math.max(tooltip.y - 8, 8),
          }}
          onClick={e => e.stopPropagation()}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

// ---- Styles ----
const styles = `
.sc-container {
  background: #0e0e0e;
  color: #c0bbb0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  padding: 1.5rem;
  min-height: 100vh;
}
.sc-today-bar {
  font-size: 0.65rem;
  color: #5a5540;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}
.sc-today-bar span { color: #c8a840; }

.sc-legend {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.55rem 0.9rem;
  border: 1px solid #1e1c18;
  border-radius: 4px;
  background: #131310;
}
.sc-legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5c5a52;
}
.sc-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sc-legend-divider {
  width: 1px;
  height: 14px;
  background: #2a2820;
}
.sc-legend-rb {
  width: 14px;
  height: 4px;
  border-radius: 2px;
  background: #2a2820;
}
.sc-legend-rb.sc-rb-unlocked { background: #c8a840; }

.sc-months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.sc-month-card {
  background: #141412;
  border: 1px solid #222018;
  border-radius: 5px;
  overflow: hidden;
}
.sc-month-card.sc-current {
  border-color: #3a3520;
  box-shadow: 0 0 0 1px #2e2a18;
}
.sc-month-card.sc-past { opacity: 0.5; }

.sc-month-header {
  padding: 0.55rem 0.8rem;
  border-bottom: 1px solid #1e1c18;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}
.sc-month-name {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #c8c4ba;
}
.sc-month-card.sc-current .sc-month-name { color: #c8a840; }
.sc-month-card.sc-past .sc-month-name { color: #4a4840; }
.sc-month-range {
  font-size: 0.58rem;
  color: #38362e;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.sc-cal-grid {
  display: grid;
  grid-template-columns: 32px repeat(7, 1fr);
}

.sc-day-header, .sc-week-header {
  padding: 0.32rem 0;
  text-align: center;
  font-size: 0.52rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #302e28;
  border-bottom: 1px solid #191816;
}

.sc-week-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.56rem;
  color: #4a4840;
  letter-spacing: 0.05em;
  border-right: 1px solid #181614;
  border-bottom: 1px solid #181614;
  padding: 4px 0;
  gap: 3px;
}
.sc-week-label.sc-week-unlocked { color: #c8a840; }
.sc-rb-bar {
  width: 16px;
  height: 3px;
  border-radius: 1.5px;
  background: #2a2820;
}
.sc-rb-bar.sc-rb-unlocked { background: #c8a840; }

.sc-day-cell {
  padding: 0.25rem 0.2rem 0.28rem;
  min-height: 50px;
  border-right: 1px solid #181614;
  border-bottom: 1px solid #181614;
  position: relative;
  cursor: default;
}
.sc-day-cell:nth-child(8n) { border-right: none; }

.sc-day-num {
  font-size: 0.55rem;
  color: #38362e;
  display: block;
  line-height: 1;
  margin-bottom: 1px;
}
.sc-day-greg {
  font-size: 0.5rem;
  color: #28261e;
  display: block;
  margin-bottom: 3px;
  line-height: 1;
}
.sc-day-cell.sc-today {
  background: #1a1910;
}
.sc-day-cell.sc-today .sc-day-num { color: #c8a840; }
.sc-day-cell.sc-today .sc-day-greg { color: #6a6030; }
.sc-day-cell.sc-pinned {
  background: #1f1d14;
  outline: 1px solid #3a3520;
}

.sc-task-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.sc-task-dot {
  transition: transform 0.1s ease;
}
.sc-task-dot:hover { transform: scale(1.4); }

.sc-tooltip {
  position: fixed;
  background: #1e1c18;
  border: 1px solid #3a3620;
  border-radius: 4px;
  padding: 0.55rem 0.75rem;
  font-size: 0.7rem;
  color: #b8b4aa;
  max-width: 240px;
  z-index: 9999;
  line-height: 1.5;
  box-shadow: 0 4px 16px rgba(0,0,0,0.6);
  pointer-events: auto;
}

@media (max-width: 600px) {
  .sc-months-grid { grid-template-columns: 1fr; }
  .sc-container { padding: 0.75rem; }
}
`;
