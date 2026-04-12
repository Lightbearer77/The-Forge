import { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════
// THE FORGE v3 — Personal Project Management
// Built for the Ubermensch Hierarchy
// Features: list/kanban/calendar/dashboard views,
// persistent storage, HTML5 drag-and-drop kanban,
// section management, auto-cascading milestones,
// G1-G4 tagging, 6-level hierarchy, Greek calendar
// ═══════════════════════════════════════════

const GOALS = {
  G1: { name: "Autonomous Man", color: "#C9A84C", icon: "⚡" },
  G2: { name: "Longhouse Tribe", color: "#5B8A72", icon: "🏛" },
  G3: { name: "Physical Foundation", color: "#8B4A4A", icon: "🔨" },
  G4: { name: "Legacy Work", color: "#4A6A8B", icon: "⚔" },
};
const PRIORITIES = { High: "#E8453C", Mid: "#D4A84B", Low: "#6B7280" };
const GREEK = [
  { id: "M01", name: "Alpha", start: "01-01", end: "01-28" },
  { id: "M02", name: "Beta", start: "01-29", end: "02-25" },
  { id: "M03", name: "Gamma", start: "02-26", end: "03-25" },
  { id: "M04", name: "Delta", start: "03-26", end: "04-22" },
  { id: "M05", name: "Epsilon", start: "04-23", end: "05-20" },
  { id: "M06", name: "Zeta", start: "05-21", end: "06-17" },
  { id: "M07", name: "Eta", start: "06-18", end: "07-15" },
  { id: "M08", name: "Theta", start: "07-16", end: "08-12" },
  { id: "M09", name: "Iota", start: "08-13", end: "09-09" },
  { id: "M10", name: "Kappa", start: "09-10", end: "10-07" },
  { id: "M11", name: "Lambda", start: "10-08", end: "11-04" },
  { id: "M12", name: "Mu", start: "11-05", end: "12-02" },
  { id: "M13", name: "Nu", start: "12-03", end: "12-30" },
];
const LEVELS = {
  1: "Core Practices",
  2: "Practical Foundations",
  3: "Applied Systems",
  4: "Philosophical Foundations",
  5: "Aspirational",
  6: "Ultimate Man",
};
const STATUS_KEYS = ["backlog", "todo", "in_progress", "done"];
const STATUS_COLS = {
  backlog: { name: "Backlog", color: "#374151", icon: "○" },
  todo: { name: "To Do", color: "#4A6A8B", icon: "◎" },
  in_progress: { name: "In Progress", color: "#D4A84B", icon: "◉" },
  done: { name: "Done", color: "#5B8A72", icon: "●" },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ─── Shared Styles ───
const selectStyle = {
  fontSize: 13, padding: "6px 10px", borderRadius: 5,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#2a2a2a", color: "#e5e5e5",
  outline: "none", cursor: "pointer", width: "100%", boxSizing: "border-box",
};
const inputStyle = {
  fontSize: 13, padding: "6px 10px", borderRadius: 5,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)", color: "#e5e5e5",
  width: "100%", boxSizing: "border-box", outline: "none",
};

// ─── Storage ───
const STORAGE_KEY = "forge-pm-tasks-v3";
const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const saveTasks = (tasks) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  catch (e) { console.error("Save failed:", e); }
};

// ─── Hooks ───
const useDebounce = (fn, ms) => {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), ms);
  }, [fn, ms]);
};

// ─── Seed Data ───
const SEED = [
  { id: uid(), name: "Switch to Proton", goal: "G1", priority: "Mid", level: 1, month: "M04", week: "W15", start: "2026-04-07", due: "2026-04-12", status: "todo", section: "Q1 Carryovers", notes: "Carried from Q1/Gamma", milestone: false, parentId: null, completed: false, completedDate: null },
  { id: uid(), name: "Start consistent athletic body training block", goal: "G3", priority: "High", level: 1, month: "M04", week: "W14", start: "2026-03-29", due: "2026-04-07", status: "todo", section: "Q1 Carryovers", notes: "CRITICAL: Longest-running incomplete task. Carried from Q1/Gamma and MS3.", milestone: false, parentId: null, completed: false, completedDate: null },
  { id: uid(), name: "Track and log body composition baseline", goal: "G3", priority: "High", level: 1, month: "M04", week: "W14", start: "2026-04-03", due: "2026-04-05", status: "todo", section: "Health & Body", notes: "Weight, measurements, photos", milestone: false, parentId: null, completed: false, completedDate: null },
  { id: uid(), name: "Research and choose structured gym training program", goal: "G3", priority: "High", level: 1, month: "M04", week: "W15", start: "2026-04-08", due: "2026-04-12", status: "todo", section: "Health & Body", notes: "Aligned with athletic body goal", milestone: false, parentId: null, completed: false, completedDate: null },
  { id: uid(), name: "Replace all plastic food containers with glass or stainless", goal: "G3", priority: "High", level: 1, month: "M04", week: "W15", start: "2026-04-08", due: "2026-04-10", status: "todo", section: "Health & Body", notes: "", milestone: false, parentId: null, completed: false, completedDate: null },
  { id: uid(), name: "Research and choose Microsoft certification path", goal: "G4", priority: "High", level: 2, month: "M04", week: "W15", start: "2026-04-10", due: "2026-04-12", status: "todo", section: "Career & Financial", notes: "", milestone: false, parentId: null, completed: false, completedDate: null },
  { id: uid(), name: "Define personal vetting criteria", goal: "G2", priority: "High", level: 3, month: "M04", week: "W16", start: "2026-04-13", due: "2026-04-15", status: "todo", section: "Longhouse & Tribe", notes: "Values, traits, dealbreakers, Longhouse alignment", milestone: false, parentId: null, completed: false, completedDate: null },
  { id: uid(), name: "Are you following your Father's counsel?", goal: "G1", priority: "Mid", level: 4, month: "M04", week: "W17", start: "2026-04-25", due: "2026-04-28", status: "backlog", section: "Mindset", notes: "", milestone: false, parentId: null, completed: false, completedDate: null },
];

// ─── Micro Components ───
const Pill = ({ children, bg, color, style }) => (
  <span style={{
    fontSize: 10, padding: "2px 6px", borderRadius: 3,
    background: bg || "rgba(255,255,255,0.06)",
    color: color || "rgba(255,255,255,0.5)",
    fontWeight: 600, whiteSpace: "nowrap", ...style,
  }}>{children}</span>
);

const Btn = ({ children, onClick, active, color, style }) => (
  <button onClick={onClick} style={{
    fontSize: 11, padding: "5px 12px", borderRadius: 5, border: "none", cursor: "pointer",
    background: active ? (color ? `${color}22` : "rgba(201,168,76,0.15)") : "rgba(255,255,255,0.04)",
    color: active ? (color || "#C9A84C") : "rgba(255,255,255,0.45)",
    fontWeight: active ? 600 : 400, transition: "all 0.15s", ...style,
  }}>{children}</button>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
    {children}
  </div>
);

// ─── Date Helpers ───
const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
const today = () => new Date().toISOString().split("T")[0];

// ─── Task Row (List View) ───
const TaskRow = ({ task, onToggle, onSelect, selected, childCount, childDone }) => {
  const g = GOALS[task.goal];
  const overdue = !task.completed && task.due && new Date(task.due + "T23:59:59") < new Date();
  const hasRange = task.start && task.due && task.start !== task.due;

  return (
    <div onClick={() => onSelect(task.id)} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
      background: selected ? "rgba(201,168,76,0.08)" : "transparent",
      borderLeft: `3px solid ${g?.color || "#555"}`,
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      cursor: "pointer", opacity: task.completed ? 0.45 : 1,
    }}>
      <button onClick={e => { e.stopPropagation(); onToggle(task.id); }} style={{
        width: 17, height: 17, borderRadius: 3,
        border: `1.5px solid ${task.completed ? g?.color : "rgba(255,255,255,0.25)"}`,
        background: task.completed ? g?.color : "transparent",
        cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: "#fff",
      }}>{task.completed ? "✓" : ""}</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: task.milestone ? 700 : 400,
          textDecoration: task.completed ? "line-through" : "none",
          color: task.milestone ? "#C9A84C" : "#e5e5e5",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {task.milestone ? "🏴 " : ""}{task.name}
          {task.milestone && childCount > 0 && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>
              {childDone}/{childCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
          <Pill bg={`${g?.color}22`} color={g?.color}>{task.goal}</Pill>
          <Pill bg={`${PRIORITIES[task.priority]}22`} color={PRIORITIES[task.priority]}>{task.priority}</Pill>
          {task.section && <Pill>{task.section}</Pill>}
          {task.level && <Pill>L{task.level}</Pill>}
        </div>
      </div>
      <div style={{ fontSize: 11, color: overdue ? "#E8453C" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap", textAlign: "right" }}>
        {hasRange ? `${fmtDate(task.start)} → ${fmtDate(task.due)}` : fmtDate(task.due)}
      </div>
    </div>
  );
};

// ─── Section Dropdown ───
const SectionSelect = ({ value, onChange, sections, style: extraStyle }) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { if (creating && inputRef.current) inputRef.current.focus(); }, [creating]);

  if (creating) {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        <input ref={inputRef} value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newName.trim()) { onChange(newName.trim()); setCreating(false); setNewName(""); } if (e.key === "Escape") setCreating(false); }}
          placeholder="New section name..." style={{ ...inputStyle, flex: 1, ...extraStyle }} />
        <button onClick={() => { if (newName.trim()) { onChange(newName.trim()); setCreating(false); setNewName(""); } }}
          style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: "none", background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer" }}>Add</button>
        <button onClick={() => setCreating(false)}
          style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>✕</button>
      </div>
    );
  }

  return (
    <select value={value || ""} onChange={e => { if (e.target.value === "__new__") setCreating(true); else onChange(e.target.value); }}
      style={{ ...selectStyle, ...extraStyle }}>
      <option value="">No section</option>
      {sections.map(s => <option key={s} value={s}>{s}</option>)}
      <option value="__new__">+ New Section</option>
    </select>
  );
};

// ─── Detail Panel ───
const DetailPanel = ({ task, sections, onUpdate, onDelete, onClose, tasks, onToggle, onAddChild }) => {
  if (!task) return null;
  const children = tasks.filter(t => t.parentId === task.id);

  return (
    <div style={{
      width: 340, background: "#1a1a1a", borderLeft: "1px solid rgba(255,255,255,0.08)",
      padding: 20, overflowY: "auto", height: "100%", flexShrink: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Task Detail</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>

      <Field label="Name">
        <input value={task.name} onChange={e => onUpdate(task.id, { name: e.target.value })} style={inputStyle} />
      </Field>

      <div style={{ display: "flex", gap: 8 }}>
        <Field label="Start"><input type="date" value={task.start || ""} onChange={e => onUpdate(task.id, { start: e.target.value })} style={{ ...inputStyle, flex: 1 }} /></Field>
        <Field label="Due"><input type="date" value={task.due || ""} onChange={e => onUpdate(task.id, { due: e.target.value })} style={{ ...inputStyle, flex: 1 }} /></Field>
      </div>

      <Field label="Goal">
        <select value={task.goal} onChange={e => onUpdate(task.id, { goal: e.target.value })} style={selectStyle}>
          {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k} — {v.name}</option>)}
        </select>
      </Field>

      <Field label="Priority">
        <select value={task.priority} onChange={e => onUpdate(task.id, { priority: e.target.value })} style={selectStyle}>
          {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      <Field label="Hierarchy Level">
        <select value={task.level || ""} onChange={e => onUpdate(task.id, { level: e.target.value ? Number(e.target.value) : null })} style={selectStyle}>
          <option value="">None</option>
          {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>L{k} — {v}</option>)}
        </select>
      </Field>

      <Field label="Greek Month">
        <select value={task.month || ""} onChange={e => onUpdate(task.id, { month: e.target.value })} style={selectStyle}>
          {GREEK.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
        </select>
      </Field>

      <Field label="Section">
        <SectionSelect value={task.section} onChange={v => onUpdate(task.id, { section: v })} sections={sections} />
      </Field>

      <Field label="Status">
        <select value={task.status} onChange={e => onUpdate(task.id, { status: e.target.value, completed: e.target.value === "done", completedDate: e.target.value === "done" ? today() : null })} style={selectStyle}>
          {STATUS_KEYS.map(s => <option key={s} value={s}>{STATUS_COLS[s].icon} {STATUS_COLS[s].name}</option>)}
        </select>
      </Field>

      <Field label="Notes">
        <textarea value={task.notes || ""} onChange={e => onUpdate(task.id, { notes: e.target.value })}
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
      </Field>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={task.milestone || false} onChange={e => onUpdate(task.id, { milestone: e.target.checked })} /> Milestone
        </label>
      </div>

      {task.milestone && (
        <div style={{ marginBottom: 16, padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Subtasks ({children.filter(c => c.completed).length}/{children.length})
          </div>
          {children.length > 0 && (
            <div style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 8 }}>
              <div style={{ height: "100%", background: "#C9A84C", borderRadius: 2, width: `${children.length ? (children.filter(c => c.completed).length / children.length) * 100 : 0}%`, transition: "width 0.3s" }} />
            </div>
          )}
          {children.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 12 }}>
              <button onClick={() => onToggle(c.id)} style={{
                width: 14, height: 14, borderRadius: 2, border: `1px solid ${c.completed ? "#5B8A72" : "rgba(255,255,255,0.2)"}`,
                background: c.completed ? "#5B8A72" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#fff",
              }}>{c.completed ? "✓" : ""}</button>
              <span style={{ color: c.completed ? "rgba(255,255,255,0.3)" : "#e5e5e5", textDecoration: c.completed ? "line-through" : "none" }}>{c.name}</span>
            </div>
          ))}
          <button onClick={onAddChild} style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 4, border: "1px dashed rgba(255,255,255,0.15)",
            background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", marginTop: 6, width: "100%",
          }}>+ Add Subtask</button>
        </div>
      )}

      <button onClick={() => { if (confirm("Delete this task?")) onDelete(task.id); }}
        style={{
          fontSize: 12, padding: "8px 16px", borderRadius: 5, border: "1px solid rgba(232,69,60,0.3)",
          background: "rgba(232,69,60,0.08)", color: "#E8453C", cursor: "pointer", width: "100%",
        }}>Delete Task</button>
    </div>
  );
};

// ─── New Task Modal ───
const NewTaskModal = ({ sections, onAdd, onClose }) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("G3");
  const [priority, setPriority] = useState("High");
  const [level, setLevel] = useState(1);
  const [month, setMonth] = useState("M04");
  const [section, setSection] = useState("");
  const [start, setStart] = useState(today());
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");
  const [milestone, setMilestone] = useState(false);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: uid(), name: name.trim(), goal, priority, level: Number(level), month, week: "",
      start, due, status: "todo", section, notes, milestone, parentId: null,
      completed: false, completedDate: null,
    });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1a1a1a", borderRadius: 10, padding: 24, width: 400, maxHeight: "80vh", overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#C9A84C", marginBottom: 16 }}>New Task</div>

        <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoFocus onKeyDown={e => e.key === "Enter" && submit()} /></Field>

        <div style={{ display: "flex", gap: 8 }}>
          <Field label="Start"><input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ ...inputStyle, flex: 1 }} /></Field>
          <Field label="Due"><input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...inputStyle, flex: 1 }} /></Field>
        </div>

        <Field label="Goal">
          <select value={goal} onChange={e => setGoal(e.target.value)} style={selectStyle}>
            {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k} — {v.name}</option>)}
          </select>
        </Field>

        <Field label="Priority">
          <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
            {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="Hierarchy Level">
          <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
            {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>L{k} — {v}</option>)}
          </select>
        </Field>

        <Field label="Greek Month">
          <select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}>
            {GREEK.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
          </select>
        </Field>

        <Field label="Section">
          <SectionSelect value={section} onChange={setSection} sections={sections} />
        </Field>

        <Field label="Notes">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 50, resize: "vertical" }} />
        </Field>

        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 16 }}>
          <input type="checkbox" checked={milestone} onChange={e => setMilestone(e.target.checked)} /> Milestone
        </label>

        <button onClick={submit} style={{
          width: "100%", padding: "10px", borderRadius: 6, border: "none", cursor: name.trim() ? "pointer" : "not-allowed",
          background: name.trim() ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
          color: name.trim() ? "#C9A84C" : "rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 600,
        }}>Create Task</button>
      </div>
    </div>
  );
};

// ─── Kanban Column ───
const KanbanCol = ({ status, tasks, onDrop, onToggle, onSelect, selectedId }) => {
  const col = STATUS_COLS[status];
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData("text/plain"); if (id) onDrop(id, status); }}
      style={{
        flex: 1, minWidth: 220, background: dragOver ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
        borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6,
        border: dragOver ? "1px dashed rgba(201,168,76,0.3)" : "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color: col.color, fontSize: 14 }}>{col.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{col.name}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{tasks.length}</span>
      </div>
      {tasks.map(task => {
        const g = GOALS[task.goal];
        return (
          <div key={task.id} draggable
            onDragStart={e => { e.dataTransfer.setData("text/plain", task.id); e.dataTransfer.effectAllowed = "move"; }}
            onClick={() => onSelect(task.id)}
            style={{
              padding: "8px 10px", borderRadius: 6,
              background: selectedId === task.id ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)",
              borderLeft: `3px solid ${g?.color || "#555"}`, cursor: "grab",
              opacity: task.completed ? 0.45 : 1, userSelect: "none",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: task.milestone ? 700 : 400, color: task.milestone ? "#C9A84C" : "#e5e5e5", marginBottom: 4 }}>
              {task.milestone ? "🏴 " : ""}{task.name}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <Pill bg={`${g?.color}22`} color={g?.color}>{task.goal}</Pill>
              <Pill bg={`${PRIORITIES[task.priority]}22`} color={PRIORITIES[task.priority]}>{task.priority}</Pill>
              {task.due && <Pill>{fmtDate(task.due)}</Pill>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Calendar View ───
const CalendarView = ({ tasks, month, onMonthChange, onSelect, selectedId }) => {
  const year = 2026;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const cells = [];
  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = today();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
        <button onClick={() => onMonthChange(Math.max(1, month - 1))} style={{ background: "none", border: "none", color: "#C9A84C", cursor: "pointer", fontSize: 18 }}>◀</button>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#e5e5e5" }}>{monthNames[month]} {year}</span>
        <button onClick={() => onMonthChange(Math.min(12, month + 1))} style={{ background: "none", border: "none", color: "#C9A84C", cursor: "pointer", fontSize: 18 }}>▶</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 4, fontWeight: 600 }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const dayTasks = tasks.filter(t => t.due === dateStr || (t.start && t.start <= dateStr && t.due >= dateStr));

          return (
            <div key={day} style={{
              minHeight: 70, padding: 4, background: isToday ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
              borderRadius: 4, border: isToday ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ fontSize: 11, color: isToday ? "#C9A84C" : "rgba(255,255,255,0.4)", fontWeight: isToday ? 700 : 400, marginBottom: 2 }}>{day}</div>
              {dayTasks.slice(0, 3).map(t => (
                <div key={t.id} onClick={() => onSelect(t.id)} style={{
                  fontSize: 9, padding: "1px 3px", borderRadius: 2, marginBottom: 1,
                  background: `${GOALS[t.goal]?.color}22`, color: GOALS[t.goal]?.color,
                  cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  opacity: t.completed ? 0.4 : 1,
                }}>{t.name}</div>
              ))}
              {dayTasks.length > 3 && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>+{dayTasks.length - 3}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Dashboard ───
const Dashboard = ({ tasks }) => {
  const active = tasks.filter(t => !t.parentId);
  const completed = active.filter(t => t.completed).length;
  const total = active.length;
  const overdue = active.filter(t => !t.completed && t.due && new Date(t.due + "T23:59:59") < new Date()).length;

  const byGoal = Object.keys(GOALS).map(g => ({
    goal: g, ...GOALS[g],
    total: active.filter(t => t.goal === g).length,
    done: active.filter(t => t.goal === g && t.completed).length,
  }));

  const byStatus = STATUS_KEYS.map(s => ({
    status: s, ...STATUS_COLS[s],
    count: active.filter(t => t.status === s).length,
  }));

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", value: total, color: "#C9A84C" },
          { label: "Completed", value: completed, color: "#5B8A72" },
          { label: "In Progress", value: active.filter(t => t.status === "in_progress").length, color: "#D4A84B" },
          { label: "Overdue", value: overdue, color: "#E8453C" },
        ].map(c => (
          <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Goal Progress */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Goal Progress</div>
        {byGoal.map(g => (
          <div key={g.goal} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: g.color }}>{g.icon} {g.goal} — {g.name}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{g.done}/{g.total}</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
              <div style={{ height: "100%", background: g.color, borderRadius: 3, width: `${g.total ? (g.done / g.total) * 100 : 0}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Status Distribution</div>
        <div style={{ display: "flex", gap: 12 }}>
          {byStatus.map(s => (
            <div key={s.status} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════ MAIN APP ═══════
export default function ForgeApp() {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("list");
  const [filterGoal, setFilterGoal] = useState("all");
  const [filterMonth, setFilterMonth] = useState("M04");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);

  // Load
  useEffect(() => {
    const saved = loadTasks();
    setTasks(saved && saved.length > 0 ? saved : SEED);
    setLoaded(true);
  }, []);

  // Save
  const save = useCallback((t) => saveTasks(t), []);
  const debouncedSave = useDebounce(save, 500);
  useEffect(() => { if (loaded) debouncedSave(tasks); }, [tasks, loaded]);

  const sections = useMemo(() => [...new Set(tasks.map(t => t.section).filter(Boolean))].sort(), [tasks]);

  const toggleComplete = useCallback((id) => {
    setTasks(prev => {
      let next = prev.map(t => t.id !== id ? t : {
        ...t, completed: !t.completed,
        completedDate: !t.completed ? today() : null,
        status: !t.completed ? "done" : "todo",
      });
      const toggled = next.find(t => t.id === id);
      if (toggled?.parentId) {
        const parent = next.find(t => t.id === toggled.parentId);
        if (parent?.milestone) {
          const sibs = next.filter(t => t.parentId === parent.id);
          const allDone = sibs.every(s => s.completed);
          if (allDone && !parent.completed) next = next.map(t => t.id === parent.id ? { ...t, completed: true, completedDate: today(), status: "done" } : t);
          if (!allDone && parent.completed) next = next.map(t => t.id === parent.id ? { ...t, completed: false, completedDate: null, status: "in_progress" } : t);
        }
      }
      return next;
    });
  }, []);

  const updateTask = useCallback((id, u) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...u } : t)), []);
  const deleteTask = useCallback((id) => { setTasks(prev => prev.filter(t => t.id !== id && t.parentId !== id)); setSelectedId(null); }, []);
  const addTask = useCallback((t) => setTasks(prev => [...prev, t]), []);
  const addChild = useCallback((parentId) => {
    const name = prompt("Subtask name:");
    if (!name?.trim()) return;
    const parent = tasks.find(t => t.id === parentId);
    setTasks(prev => [...prev, {
      id: uid(), name: name.trim(), goal: parent.goal, priority: parent.priority,
      level: parent.level, month: parent.month, week: parent.week,
      start: parent.start, due: parent.due, status: "todo", section: parent.section,
      notes: "", milestone: false, parentId, completed: false, completedDate: null,
    }]);
  }, [tasks]);

  const changeStatus = useCallback((id, s) => {
    setTasks(prev => prev.map(t => t.id !== id ? t : {
      ...t, status: s, completed: s === "done",
      completedDate: s === "done" ? today() : null,
    }));
  }, []);

  // Filter
  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (t.parentId) return false;
      if (!showCompleted && t.completed) return false;
      if (filterGoal !== "all" && t.goal !== filterGoal) return false;
      if (filterMonth !== "all" && t.month !== filterMonth) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterLevel !== "all" && String(t.level) !== filterLevel) return false;
      if (filterSection !== "all" && t.section !== filterSection) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, showCompleted, filterGoal, filterMonth, filterPriority, filterLevel, filterSection, search]);

  const selectedTask = tasks.find(t => t.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0f0f0f" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#C9A84C", letterSpacing: 1 }}>⚒ THE FORGE</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>v3.0</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "list", label: "☰ List" },
            { key: "kanban", label: "▦ Kanban" },
            { key: "calendar", label: "📅 Calendar" },
            { key: "dashboard", label: "◧ Dashboard" },
          ].map(v => (
            <Btn key={v.key} active={view === v.key} onClick={() => setView(v.key)}>{v.label}</Btn>
          ))}
        </div>
        <button onClick={() => setShowNewTask(true)} style={{
          fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "none",
          background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer", fontWeight: 600,
        }}>+ New Task</button>
      </div>

      {/* Filters */}
      {view !== "dashboard" && (
        <div style={{ padding: "8px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, width: 160 }} />
          <select value={filterGoal} onChange={e => setFilterGoal(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
            <option value="all">All Goals</option>
            {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
            <option value="all">All Months</option>
            {GREEK.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
            <option value="all">All Priorities</option>
            {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
            <option value="all">All Levels</option>
            {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>L{k}</option>)}
          </select>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
            <option value="all">All Sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Btn active={showCompleted} onClick={() => setShowCompleted(!showCompleted)}>Show Done</Btn>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: view === "list" ? 0 : 20 }}>
          {view === "list" && (
            <div>
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No tasks match filters</div>
              ) : (
                filtered.map(task => {
                  const children = tasks.filter(t => t.parentId === task.id);
                  return (
                    <TaskRow key={task.id} task={task} onToggle={toggleComplete} onSelect={setSelectedId}
                      selected={selectedId === task.id} childCount={children.length} childDone={children.filter(c => c.completed).length} />
                  );
                })
              )}
            </div>
          )}

          {view === "kanban" && (
            <div style={{ display: "flex", gap: 12, minHeight: "100%" }}>
              {STATUS_KEYS.map(s => (
                <KanbanCol key={s} status={s} tasks={filtered.filter(t => t.status === s)}
                  onDrop={changeStatus} onToggle={toggleComplete} onSelect={setSelectedId} selectedId={selectedId} />
              ))}
            </div>
          )}

          {view === "calendar" && (
            <CalendarView tasks={tasks.filter(t => !t.parentId)} month={calMonth} onMonthChange={setCalMonth}
              onSelect={setSelectedId} selectedId={selectedId} />
          )}

          {view === "dashboard" && <Dashboard tasks={tasks} />}
        </div>

        {/* Detail Panel */}
        {selectedTask && (
          <DetailPanel task={selectedTask} sections={sections} onUpdate={updateTask} onDelete={deleteTask}
            onClose={() => setSelectedId(null)} tasks={tasks} onToggle={toggleComplete} onAddChild={() => addChild(selectedTask.id)} />
        )}
      </div>

      {/* New Task Modal */}
      {showNewTask && <NewTaskModal sections={sections} onAdd={addTask} onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
