const TASKS_KEY = "forge-pm-tasks-v5";
const HISTORY_KEY = "forge-pm-history-v5";
const ACTIVITY_KEY = "forge-pm-activity-v5";
const MILESTONES_KEY = "forge-pm-milestones-v6";

// Migration: carry over v3 data if v5 is empty
const V3_KEY = "forge-pm-tasks-v3";

export const loadTasks = () => {
  try {
    let data = localStorage.getItem(TASKS_KEY);
    if (data) return JSON.parse(data);
    // Try migrating from v3
    data = localStorage.getItem(V3_KEY);
    if (data) {
      const tasks = JSON.parse(data);
      return tasks.map(t => ({
        ...t,
        blockedBy: t.blockedBy || [],
        recurrence: t.recurrence || "none",
      }));
    }
    return null;
  } catch { return null; }
};

export const saveTasks = (tasks) => {
  try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
  catch (e) { console.error("Save failed:", e); }
};

export const loadHistory = () => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

export const saveHistory = (history) => {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }
  catch (e) { console.error("Save history failed:", e); }
};

export const loadActivity = () => {
  try {
    const data = localStorage.getItem(ACTIVITY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveActivity = (log) => {
  try {
    const trimmed = log.slice(-500);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
  } catch (e) { console.error("Save activity failed:", e); }
};

// ─── Milestones (v6) ───
export const loadMilestones = () => {
  try {
    const data = localStorage.getItem(MILESTONES_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

export const saveMilestones = (milestones) => {
  try { localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones)); }
  catch (e) { console.error("Save milestones failed:", e); }
};

export const exportJSON = (tasks, history, activity, milestones) => {
  const data = { tasks, history, activity, milestones, exportedAt: new Date().toISOString(), version: "6.0" };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `forge-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { resolve(JSON.parse(e.target.result)); }
      catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// ─── Sync Code (no backend needed) ───
export const generateSyncCode = (tasks, history, activity, milestones) => {
  const data = { t: tasks, h: history, a: activity, m: milestones, v: "6.0", ts: Date.now() };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
};

export const applySyncCode = (code) => {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    return { tasks: data.t, history: data.h, activity: data.a, milestones: data.m, timestamp: data.ts };
  } catch (e) {
    return null;
  }
};
