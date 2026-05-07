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

// ─── Merge Logic (v6+) ───
// mergeMode:
//   "replace"        → wipe local, take all from incoming (existing behavior)
//   "keep-mine"      → keep all local fields when ID collides; only ADD new IDs from incoming
//   "keep-import"    → on collision, take incoming metadata BUT preserve local completion state
//                      (completed, completedDate, notes) — protects user progress
//
// Returns { merged, stats: { added, updated, kept, total } }
//
// Field categories on collision in "keep-import" mode:
//   Local-preserved (your progress): completed, completedDate, notes
//   Import-applied (my corrections): name, goal, month, week, priority, level,
//                                    start, due, status, section, milestone, parentId,
//                                    blockedBy, recurrence, msTag, msWeek, taskIds (milestones)

const PRESERVE_LOCAL_FIELDS = ["completed", "completedDate", "notes"];

const mergeOne = (local, incoming, mode) => {
  if (mode === "keep-mine") return local;
  if (mode === "replace") return incoming;
  // "keep-import": take incoming as base, restore preserved fields from local
  const out = { ...incoming };
  for (const f of PRESERVE_LOCAL_FIELDS) {
    if (local[f] !== undefined) out[f] = local[f];
  }
  return out;
};

export const mergeCollections = (local, incoming, mode) => {
  if (mode === "replace") {
    return {
      merged: incoming || [],
      stats: {
        added: (incoming || []).length,
        updated: 0,
        kept: 0,
        removed: (local || []).length,
        total: (incoming || []).length,
      },
    };
  }
  const localById = {};
  for (const item of (local || [])) localById[item.id] = item;
  const incomingById = {};
  for (const item of (incoming || [])) incomingById[item.id] = item;

  const merged = [];
  let added = 0, updated = 0, kept = 0;

  // Walk local first to preserve order
  for (const item of (local || [])) {
    if (incomingById[item.id]) {
      const result = mergeOne(item, incomingById[item.id], mode);
      merged.push(result);
      if (mode === "keep-mine") kept++;
      else updated++;
    } else {
      merged.push(item);
      kept++;
    }
  }
  // Append new IDs from incoming
  for (const item of (incoming || [])) {
    if (!localById[item.id]) {
      merged.push(item);
      added++;
    }
  }
  return {
    merged,
    stats: { added, updated, kept, removed: 0, total: merged.length },
  };
};

// Compute a preview of what would change without actually merging
export const computeMergePreview = (localTasks, localMs, incomingTasks, incomingMs) => {
  const localTaskIds = new Set((localTasks || []).map(t => t.id));
  const incomingTaskIds = new Set((incomingTasks || []).map(t => t.id));
  const localMsIds = new Set((localMs || []).map(m => m.id));
  const incomingMsIds = new Set((incomingMs || []).map(m => m.id));

  const newTasks = (incomingTasks || []).filter(t => !localTaskIds.has(t.id));
  const collidingTasks = (incomingTasks || []).filter(t => localTaskIds.has(t.id));
  const newMs = (incomingMs || []).filter(m => !localMsIds.has(m.id));
  const collidingMs = (incomingMs || []).filter(m => localMsIds.has(m.id));

  // Detect actual changes in colliding tasks (deep field comparison)
  const localTaskById = {};
  for (const t of (localTasks || [])) localTaskById[t.id] = t;
  const localMsById = {};
  for (const m of (localMs || [])) localMsById[m.id] = m;

  const COMPARE_FIELDS_TASK = ["name", "goal", "month", "week", "priority", "level",
    "start", "due", "status", "section", "milestone", "parentId", "completed",
    "completedDate", "blockedBy", "recurrence", "notes"];
  const COMPARE_FIELDS_MS = ["name", "goal", "month", "due", "msTag", "msWeek",
    "taskIds", "completed", "completedDate", "notes"];

  const fieldDiffs = (a, b, fields) => {
    const diffs = [];
    for (const f of fields) {
      const av = JSON.stringify(a[f]);
      const bv = JSON.stringify(b[f]);
      if (av !== bv) diffs.push(f);
    }
    return diffs;
  };

  const changedTasks = collidingTasks
    .map(t => ({ ...t, _diffs: fieldDiffs(localTaskById[t.id], t, COMPARE_FIELDS_TASK) }))
    .filter(t => t._diffs.length > 0);
  const changedMs = collidingMs
    .map(m => ({ ...m, _diffs: fieldDiffs(localMsById[m.id], m, COMPARE_FIELDS_MS) }))
    .filter(m => m._diffs.length > 0);

  return {
    tasks: {
      newCount: newTasks.length,
      changedCount: changedTasks.length,
      unchangedCollisionCount: collidingTasks.length - changedTasks.length,
      localOnlyCount: (localTasks || []).length - collidingTasks.length,
      newSamples: newTasks.slice(0, 5).map(t => ({ id: t.id, name: t.name })),
      changedSamples: changedTasks.slice(0, 8).map(t => ({
        id: t.id, name: t.name, diffs: t._diffs,
      })),
    },
    milestones: {
      newCount: newMs.length,
      changedCount: changedMs.length,
      unchangedCollisionCount: collidingMs.length - changedMs.length,
      localOnlyCount: (localMs || []).length - collidingMs.length,
      newSamples: newMs.slice(0, 5).map(m => ({ id: m.id, name: m.name })),
      changedSamples: changedMs.slice(0, 8).map(m => ({
        id: m.id, name: m.name, diffs: m._diffs,
      })),
    },
  };
};

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
