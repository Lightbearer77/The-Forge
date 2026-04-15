export const GOALS = {
  G1: { name: "Autonomous Man", color: "#C9A84C", icon: "⚡" },
  G2: { name: "Longhouse Tribe", color: "#5B8A72", icon: "🏛" },
  G3: { name: "Physical Foundation", color: "#8B4A4A", icon: "🔨" },
  G4: { name: "Legacy Work", color: "#4A6A8B", icon: "⚔" },
};

export const PRIORITIES = { High: "#E8453C", Mid: "#D4A84B", Low: "#6B7280" };

export const GREEK_MONTHS = [
  { id: "M01", name: "Alpha",   start: "01-01", end: "01-28" },
  { id: "M02", name: "Beta",    start: "01-29", end: "02-25" },
  { id: "M03", name: "Gamma",   start: "02-26", end: "03-25" },
  { id: "M04", name: "Delta",   start: "03-26", end: "04-22" },
  { id: "M05", name: "Epsilon", start: "04-23", end: "05-20" },
  { id: "M06", name: "Zeta",    start: "05-21", end: "06-17" },
  { id: "M07", name: "Eta",     start: "06-18", end: "07-15" },
  { id: "M08", name: "Theta",   start: "07-16", end: "08-12" },
  { id: "M09", name: "Iota",    start: "08-13", end: "09-09" },
  { id: "M10", name: "Kappa",   start: "09-10", end: "10-07" },
  { id: "M11", name: "Lambda",  start: "10-08", end: "11-04" },
  { id: "M12", name: "Mu",      start: "11-05", end: "12-02" },
  { id: "M13", name: "Nu",      start: "12-03", end: "12-30" },
];

export const LEVELS = {
  1: "Core Practices",
  2: "Practical Foundations",
  3: "Applied Systems",
  4: "Philosophical Foundations",
  5: "Aspirational",
  6: "Ultimate Man",
};

export const STATUS_KEYS = ["backlog", "todo", "in_progress", "done"];

export const STATUS_META = {
  backlog:     { name: "Backlog",     color: "#374151", icon: "○" },
  todo:        { name: "To Do",       color: "#4A6A8B", icon: "◎" },
  in_progress: { name: "In Progress", color: "#D4A84B", icon: "◉" },
  done:        { name: "Done",        color: "#5B8A72", icon: "●" },
};

export const RECURRENCE_OPTIONS = [
  { value: "none",     label: "None" },
  { value: "daily",    label: "Daily" },
  { value: "weekly",   label: "Weekly" },
  { value: "biweekly", label: "Every 2 Weeks" },
  { value: "monthly",  label: "Monthly (28 days)" },
];

// ─── Greek Calendar Auto-Detection ───
export const getGreekMonth = (date = new Date()) => {
  const y = date.getFullYear();
  const ranges = GREEK_MONTHS.map(m => {
    const [sm, sd] = m.start.split("-").map(Number);
    const [em, ed] = m.end.split("-").map(Number);
    return { ...m, startDate: new Date(y, sm - 1, sd), endDate: new Date(y, em - 1, ed, 23, 59, 59) };
  });
  const found = ranges.find(r => date >= r.startDate && date <= r.endDate);
  return found ? found.id : "M01";
};

export const getGreekWeek = (date = new Date()) => {
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - jan1) / 86400000);
  return Math.ceil((days + jan1.getDay() + 1) / 7);
};

// Week boundaries (Mon-Sun) for Rebellion Block calculation
export const getWeekBounds = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  const fmt = (dt) => dt.toISOString().split("T")[0];
  return { start: fmt(mon), end: fmt(sun) };
};

export const selectStyle = {
  fontSize: 13, padding: "6px 10px", borderRadius: 5,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#2a2a2a", color: "#e5e5e5",
  outline: "none", cursor: "pointer", width: "100%", boxSizing: "border-box",
};

export const inputStyle = {
  fontSize: 13, padding: "6px 10px", borderRadius: 5,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)", color: "#e5e5e5",
  width: "100%", boxSizing: "border-box", outline: "none",
};
