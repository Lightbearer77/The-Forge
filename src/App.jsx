import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { GOALS, PRIORITIES, GREEK_MONTHS, LEVELS, STATUS_KEYS, STATUS_META, RECURRENCE_OPTIONS, selectStyle, inputStyle, getGreekMonth, getGreekWeek, getWeekBounds } from "./constants.js";
import { loadTasks, saveTasks, loadHistory, saveHistory, loadActivity, saveActivity, exportJSON, importJSON, generateSyncCode, applySyncCode } from "./storage.js";
import { SEED_TASKS } from "./seed.js";

// ═══════════════════════════════════════════
// THE FORGE v5.5 — Batch · Sync · Timeline · MPL Import
// Dependencies · AI Panel · Recurring Tasks
// Obsidian Export · Completion History
// ═══════════════════════════════════════════

// ─── Mobile Detection ───
const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
const addDays = (d, n) => { const x = new Date(d + "T00:00:00"); x.setDate(x.getDate() + n); return x.toISOString().split("T")[0]; };

const getNextDue = (rec, due) => {
  if (!due || rec === "none") return null;
  const map = { daily: 1, weekly: 7, biweekly: 14, monthly: 28 };
  return map[rec] ? addDays(due, map[rec]) : null;
};

const isBlocked = (task, all) => (task.blockedBy || []).some(id => { const b = all.find(t => t.id === id); return b && !b.completed; });
const getBlockers = (task, all) => (task.blockedBy || []).map(id => all.find(t => t.id === id)).filter(Boolean);
const getBlocking = (taskId, all) => all.filter(t => (t.blockedBy || []).includes(taskId));

const useDebounce = (fn, ms) => {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), ms);
  }, [fn, ms]);
};

const generateObsidianExport = (tasks) => {
  const topLevel = tasks.filter(t => !t.parentId);
  const byMonth = {};
  topLevel.forEach(t => {
    const m = t.month || "Backlog";
    if (!byMonth[m]) byMonth[m] = {};
    const s = t.section || "Unsorted";
    if (!byMonth[m][s]) byMonth[m][s] = [];
    byMonth[m][s].push(t);
  });
  let md = `# Master Priority List\n**Exported from The Forge — ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}**\n\n`;
  const monthOrder = GREEK_MONTHS.map(g => g.id);
  const sorted = Object.keys(byMonth).sort((a, b) => {
    if (a === "Backlog") return 1; if (b === "Backlog") return -1;
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });
  sorted.forEach(m => {
    const gm = GREEK_MONTHS.find(g => g.id === m);
    md += `## ${gm ? gm.name + " (" + m + ")" : m}\n\n`;
    Object.entries(byMonth[m]).forEach(([sec, arr]) => {
      md += `### ${sec}\n`;
      arr.sort((a, b) => {
        const p = { High: 0, Mid: 1, Low: 2 };
        return (p[a.priority] || 2) - (p[b.priority] || 2);
      }).forEach(t => {
        const check = t.completed ? "[x]" : "[ ]";
        const dueTag = t.due ? ` \`due:: ${t.due}\`` : "";
        const tags = ` #${t.priority} #${t.goal}`;
        const comp = t.completedDate ? ` [completion:: ${t.completedDate}]` : "";
        const rec = t.recurrence && t.recurrence !== "none" ? ` 🔁${t.recurrence}` : "";
        md += `- ${check} ${t.name}${dueTag}${tags}${comp}${rec}\n`;
      });
      md += "\n";
    });
  });
  return md;
};

// ─── Micro Components ───
const Pill = ({ children, bg, color, style }) => (
  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: bg || "rgba(255,255,255,0.06)", color: color || "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap", ...style }}>{children}</span>
);

const Btn = ({ children, onClick, active, color, style }) => (
  <button onClick={onClick} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 5, border: "none", cursor: "pointer", background: active ? (color ? `${color}22` : "rgba(201,168,76,0.15)") : "rgba(255,255,255,0.04)", color: active ? (color || "#C9A84C") : "rgba(255,255,255,0.45)", fontWeight: active ? 600 : 400, transition: "all 0.15s", ...style }}>{children}</button>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
    {children}
  </div>
);

// ─── Undo Toast ───
const UndoToast = ({ message, onUndo, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: "#2a2a2a", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8,
      padding: "10px 16px", display: "flex", alignItems: "center", gap: 12,
      zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", maxWidth: "90vw",
    }}>
      <span style={{ fontSize: 12, color: "#e5e5e5", flex: 1 }}>{message}</span>
      <button onClick={onUndo} style={{
        fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 4, border: "none",
        background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer",
      }}>Undo</button>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14,
      }}>✕</button>
    </div>
  );
};

// ─── Task Row ───
const TaskRow = ({ task, onToggle, onSelect, selected, childCount, childDone, blocked, blockerNames, allTasks, batchMode, batchSelected, onBatchToggle }) => {
  const g = GOALS[task.goal];
  const overdue = !task.completed && task.due && new Date(task.due + "T23:59:59") < new Date();
  const hasRange = task.start && task.due && task.start !== task.due;
  const blocking = getBlocking(task.id, allTasks);

  const handleClick = () => {
    if (batchMode) { onBatchToggle(task.id); return; }
    onSelect(task.id);
  };

  return (
    <div onClick={handleClick} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
      background: batchSelected ? "rgba(201,168,76,0.12)" : selected ? "rgba(201,168,76,0.08)" : "transparent",
      borderLeft: `3px solid ${g?.color || "#555"}`,
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      cursor: "pointer", opacity: task.completed ? 0.45 : blocked ? 0.55 : 1,
    }}>
      {batchMode ? (
        <div style={{
          width: 17, height: 17, borderRadius: 3, flexShrink: 0,
          border: `1.5px solid ${batchSelected ? "#C9A84C" : "rgba(255,255,255,0.25)"}`,
          background: batchSelected ? "#C9A84C" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#000",
        }}>{batchSelected ? "✓" : ""}</div>
      ) : (
        <button onClick={e => { e.stopPropagation(); if (!blocked) onToggle(task.id); }} title={blocked ? "Blocked" : ""} style={{
        width: 17, height: 17, borderRadius: 3,
        border: `1.5px solid ${task.completed ? g?.color : blocked ? "#E8453C" : "rgba(255,255,255,0.25)"}`,
        background: task.completed ? g?.color : "transparent",
        cursor: blocked ? "not-allowed" : "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff",
      }}>{task.completed ? "✓" : blocked ? "🔒" : ""}</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: task.milestone ? 700 : 400,
          textDecoration: task.completed ? "line-through" : "none",
          color: task.milestone ? "#C9A84C" : "#e5e5e5",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {task.milestone ? "🏴 " : ""}{blocked ? "🔒 " : ""}{task.name}
          {task.recurrence && task.recurrence !== "none" && <span style={{ fontSize: 10, marginLeft: 4 }}>🔁</span>}
          {task.milestone && childCount > 0 && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>{childDone}/{childCount}</span>}
        </div>
        {blocked && blockerNames && (
          <div style={{ fontSize: 10, color: "#E8453C", marginTop: 1 }}>Blocked by: {blockerNames}</div>
        )}
        {!blocked && blocking.length > 0 && !task.completed && (
          <div style={{ fontSize: 10, color: "#D4A84B", marginTop: 1 }}>Blocking {blocking.length} task{blocking.length > 1 ? "s" : ""}</div>
        )}
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
const SectionSelect = ({ value, onChange, sections, style: extra }) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (creating && inputRef.current) inputRef.current.focus(); }, [creating]);

  if (creating) return (
    <div style={{ display: "flex", gap: 4 }}>
      <input ref={inputRef} value={newName} onChange={e => setNewName(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && newName.trim()) { onChange(newName.trim()); setCreating(false); setNewName(""); } if (e.key === "Escape") setCreating(false); }}
        placeholder="New section name..." style={{ ...inputStyle, flex: 1, ...extra }} />
      <button onClick={() => { if (newName.trim()) { onChange(newName.trim()); setCreating(false); setNewName(""); } }}
        style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: "none", background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer" }}>Add</button>
      <button onClick={() => setCreating(false)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>✕</button>
    </div>
  );

  return (
    <select value={value || ""} onChange={e => { if (e.target.value === "__new__") setCreating(true); else onChange(e.target.value); }}
      style={{ ...selectStyle, ...extra }}>
      <option value="">No section</option>
      {sections.map(s => <option key={s} value={s}>{s}</option>)}
      <option value="__new__">+ New Section</option>
    </select>
  );
};

// ─── Dependency Picker ───
const DependencyPicker = ({ task, allTasks, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const available = allTasks.filter(t => t.id !== task.id && !t.parentId && !(task.blockedBy || []).includes(t.id) && !(t.blockedBy || []).includes(task.id));
  const filtered = search ? available.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) : available.slice(0, 10);

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", width: "100%" }}>+ Add dependency</button>
  );

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: 8, background: "rgba(0,0,0,0.2)" }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ ...inputStyle, marginBottom: 6 }} autoFocus />
      <div style={{ maxHeight: 150, overflowY: "auto" }}>
        {filtered.map(t => (
          <div key={t.id} onClick={() => { onAdd(t.id); setOpen(false); setSearch(""); }} style={{
            fontSize: 11, padding: "4px 8px", cursor: "pointer", borderRadius: 3,
            color: "#e5e5e5", display: "flex", gap: 6, alignItems: "center",
          }}>
            <span style={{ color: GOALS[t.goal]?.color }}>{GOALS[t.goal]?.icon}</span>
            <span>{t.name}</span>
          </div>
        ))}
      </div>
      <button onClick={() => { setOpen(false); setSearch(""); }} style={{ fontSize: 10, marginTop: 4, border: "none", background: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>Cancel</button>
    </div>
  );
};

// ─── Detail Panel ───
const DetailPanel = ({ task, sections, onUpdate, onDelete, onClose, tasks, onToggle, onAddChild, isMobile }) => {
  if (!task) return null;
  const children = tasks.filter(t => t.parentId === task.id);
  const blocked = isBlocked(task, tasks);
  const blockers = getBlockers(task, tasks);
  const blocking = getBlocking(task.id, tasks);

  return (
    <div style={{ width: isMobile ? "100%" : 360, background: "#1a1a1a", borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "16px 16px 80px" : 20, overflowY: "auto", height: "100%", flexShrink: 0, ...(isMobile ? { position: "fixed", inset: 0, zIndex: 50 } : {}) }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Task Detail</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>

      {blocked && (
        <div style={{ padding: 10, background: "rgba(232,69,60,0.1)", border: "1px solid rgba(232,69,60,0.3)", borderRadius: 6, marginBottom: 14, fontSize: 11, color: "#E8453C" }}>
          🔒 <strong>Blocked</strong> — complete these first:
          {blockers.filter(b => !b.completed).map(b => <div key={b.id} style={{ marginTop: 4 }}>• {b.name}</div>)}
        </div>
      )}

      <Field label="Name"><input value={task.name} onChange={e => onUpdate(task.id, { name: e.target.value })} style={inputStyle} /></Field>

      <div style={{ display: "flex", gap: 8 }}>
        <Field label="Start"><input type="date" value={task.start || ""} onChange={e => onUpdate(task.id, { start: e.target.value })} style={{ ...inputStyle, flex: 1 }} /></Field>
        <Field label="Due"><input type="date" value={task.due || ""} onChange={e => onUpdate(task.id, { due: e.target.value })} style={{ ...inputStyle, flex: 1 }} /></Field>
      </div>

      <Field label="Goal"><select value={task.goal} onChange={e => onUpdate(task.id, { goal: e.target.value })} style={selectStyle}>
        {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k} — {v.name}</option>)}
      </select></Field>

      <Field label="Priority"><select value={task.priority} onChange={e => onUpdate(task.id, { priority: e.target.value })} style={selectStyle}>
        {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
      </select></Field>

      <Field label="Hierarchy Level"><select value={task.level || ""} onChange={e => onUpdate(task.id, { level: e.target.value ? Number(e.target.value) : null })} style={selectStyle}>
        <option value="">None</option>
        {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>L{k} — {v}</option>)}
      </select></Field>

      <Field label="Greek Month"><select value={task.month || ""} onChange={e => onUpdate(task.id, { month: e.target.value })} style={selectStyle}>
        {GREEK_MONTHS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
      </select></Field>

      <Field label="Section"><SectionSelect value={task.section} onChange={v => onUpdate(task.id, { section: v })} sections={sections} /></Field>

      <Field label="Status"><select value={task.status} onChange={e => {
        const s = e.target.value;
        onUpdate(task.id, { status: s, completed: s === "done", completedDate: s === "done" ? todayStr() : null });
      }} style={selectStyle}>
        {STATUS_KEYS.map(s => <option key={s} value={s}>{STATUS_META[s].icon} {STATUS_META[s].name}</option>)}
      </select></Field>

      <Field label="Recurrence"><select value={task.recurrence || "none"} onChange={e => onUpdate(task.id, { recurrence: e.target.value })} style={selectStyle}>
        {RECURRENCE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select></Field>

      <Field label="Notes"><textarea value={task.notes || ""} onChange={e => onUpdate(task.id, { notes: e.target.value })}
        style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} /></Field>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={task.milestone || false} onChange={e => onUpdate(task.id, { milestone: e.target.checked })} /> Milestone
        </label>
      </div>

      {/* Dependencies */}
      <div style={{ marginBottom: 16, padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Dependencies (Blocked By)</div>
        {blockers.map(b => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 11 }}>
            <span style={{ color: b.completed ? "#5B8A72" : "#E8453C" }}>{b.completed ? "✓" : "○"}</span>
            <span style={{ color: "#e5e5e5", flex: 1 }}>{b.name}</span>
            <button onClick={() => onUpdate(task.id, { blockedBy: (task.blockedBy || []).filter(id => id !== b.id) })}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 12 }}>✕</button>
          </div>
        ))}
        <DependencyPicker task={task} allTasks={tasks} onAdd={(depId) => onUpdate(task.id, { blockedBy: [...(task.blockedBy || []), depId] })} />
      </div>

      {blocking.length > 0 && (
        <div style={{ marginBottom: 16, padding: 10, background: "rgba(212,168,75,0.05)", borderRadius: 6 }}>
          <div style={{ fontSize: 10, color: "#D4A84B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Blocking ({blocking.length})</div>
          {blocking.map(b => <div key={b.id} style={{ fontSize: 11, color: "#e5e5e5", padding: "2px 0" }}>→ {b.name}</div>)}
        </div>
      )}

      {/* Subtasks */}
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
                background: c.completed ? "#5B8A72" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff",
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
        style={{ fontSize: 12, padding: "8px 16px", borderRadius: 5, border: "1px solid rgba(232,69,60,0.3)", background: "rgba(232,69,60,0.08)", color: "#E8453C", cursor: "pointer", width: "100%" }}>Delete Task</button>
    </div>
  );
};

// ─── New Task Modal ───
const NewTaskModal = ({ sections, onAdd, onClose, currentMonth }) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("G3");
  const [priority, setPriority] = useState("High");
  const [level, setLevel] = useState(1);
  const [month, setMonth] = useState(currentMonth || "M04");
  const [section, setSection] = useState("");
  const [start, setStart] = useState(todayStr());
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");
  const [milestone, setMilestone] = useState(false);
  const [recurrence, setRecurrence] = useState("none");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: uid(), name: name.trim(), goal, priority, level: Number(level), month, week: "",
      start, due, status: "todo", section, notes, milestone, parentId: null,
      completed: false, completedDate: null, blockedBy: [], recurrence,
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", borderRadius: 10, padding: 24, width: "min(400px, 95vw)", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#C9A84C", marginBottom: 16 }}>New Task</div>
        <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoFocus onKeyDown={e => e.key === "Enter" && submit()} /></Field>
        <div style={{ display: "flex", gap: 8 }}>
          <Field label="Start"><input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ ...inputStyle, flex: 1 }} /></Field>
          <Field label="Due"><input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...inputStyle, flex: 1 }} /></Field>
        </div>
        <Field label="Goal"><select value={goal} onChange={e => setGoal(e.target.value)} style={selectStyle}>
          {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k} — {v.name}</option>)}
        </select></Field>
        <Field label="Priority"><select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
          {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
        </select></Field>
        <Field label="Hierarchy Level"><select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
          {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>L{k} — {v}</option>)}
        </select></Field>
        <Field label="Greek Month"><select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}>
          {GREEK_MONTHS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
        </select></Field>
        <Field label="Section"><SectionSelect value={section} onChange={setSection} sections={sections} /></Field>
        <Field label="Recurrence"><select value={recurrence} onChange={e => setRecurrence(e.target.value)} style={selectStyle}>
          {RECURRENCE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select></Field>
        <Field label="Notes"><textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, minHeight: 50, resize: "vertical" }} /></Field>
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

// ─── Kanban Column (touch-aware) ───
const KanbanCol = ({ status, tasks, allTasks, onDrop, onToggle, onSelect, selectedId, isMobile, movingId, onStartMove }) => {
  const col = STATUS_META[status];
  const [dragOver, setDragOver] = useState(false);

  // On mobile, tapping a column header while a task is "moving" drops it here
  const handleColTap = () => {
    if (isMobile && movingId) onDrop(movingId, status);
  };

  return (
    <div onDragOver={!isMobile ? (e => { e.preventDefault(); setDragOver(true); }) : undefined}
      onDragLeave={!isMobile ? (() => setDragOver(false)) : undefined}
      onDrop={!isMobile ? (e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData("text/plain"); if (id) onDrop(id, status); }) : undefined}
      style={{
        flex: isMobile ? "0 0 75vw" : 1, minWidth: isMobile ? "75vw" : 220,
        background: (dragOver || (isMobile && movingId)) ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
        borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6,
        border: dragOver ? "1px dashed rgba(201,168,76,0.3)" : (isMobile && movingId) ? "1px dashed rgba(201,168,76,0.15)" : "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.15s",
      }}>
      <div onClick={handleColTap} style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
        cursor: isMobile && movingId ? "pointer" : "default",
        padding: isMobile && movingId ? "6px 8px" : 0,
        background: isMobile && movingId ? "rgba(201,168,76,0.1)" : "transparent",
        borderRadius: 6,
      }}>
        <span style={{ color: col.color, fontSize: 14 }}>{col.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{col.name}</span>
        {isMobile && movingId && <span style={{ fontSize: 10, color: "#C9A84C", marginLeft: "auto" }}>tap to drop</span>}
        {!movingId && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{tasks.length}</span>}
      </div>
      {tasks.map(task => {
        const g = GOALS[task.goal];
        const bk = isBlocked(task, allTasks);
        const isMoving = movingId === task.id;
        return (
          <div key={task.id} draggable={!isMobile && !bk}
            onDragStart={!isMobile ? (e => { if (bk) { e.preventDefault(); return; } e.dataTransfer.setData("text/plain", task.id); e.dataTransfer.effectAllowed = "move"; }) : undefined}
            onClick={() => {
              if (isMobile && !movingId && !bk) onStartMove(task.id);
              else if (isMobile && isMoving) onStartMove(null); // cancel
              else onSelect(task.id);
            }}
            style={{
              padding: "8px 10px", borderRadius: 6,
              background: isMoving ? "rgba(201,168,76,0.2)" : selectedId === task.id ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)",
              borderLeft: `3px solid ${g?.color || "#555"}`, cursor: bk ? "not-allowed" : isMobile ? "pointer" : "grab",
              opacity: task.completed ? 0.45 : bk ? 0.5 : 1, userSelect: "none",
              outline: isMoving ? "2px solid rgba(201,168,76,0.5)" : "none",
            }}>
            <div style={{ fontSize: 12, fontWeight: task.milestone ? 700 : 400, color: task.milestone ? "#C9A84C" : "#e5e5e5", marginBottom: 4 }}>
              {bk ? "🔒 " : ""}{task.milestone ? "🏴 " : ""}{isMoving ? "✋ " : ""}{task.name}
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

// ─── Week Focus View ───
const WeekFocusView = ({ tasks, allTasks, onToggle, onSelect, selectedId, isMobile }) => {
  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const weekEnd = (() => { const d = new Date(); const day = d.getDay(); const diff = day === 0 ? 0 : 7 - day; const end = new Date(d); end.setDate(d.getDate() + diff); return end.toISOString().split("T")[0]; })();

  const active = tasks.filter(t => !t.parentId && !t.completed);
  const overdue = active.filter(t => t.due && t.due < today);
  const todayTasks = active.filter(t => t.due === today);
  const tomorrowTasks = active.filter(t => t.due === tomorrow);
  const restOfWeek = active.filter(t => t.due > tomorrow && t.due <= weekEnd);
  const noDue = active.filter(t => !t.due).slice(0, 5);

  const sections = [
    { key: "overdue", title: "⚠️ OVERDUE", tasks: overdue, color: "#E8453C", bg: "rgba(232,69,60,0.06)", border: "rgba(232,69,60,0.15)" },
    { key: "today", title: "📌 TODAY", tasks: todayTasks, color: "#C9A84C", bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.15)" },
    { key: "tomorrow", title: "→ TOMORROW", tasks: tomorrowTasks, color: "#D4A84B", bg: "transparent", border: "rgba(255,255,255,0.06)" },
    { key: "week", title: "THIS WEEK", tasks: restOfWeek, color: "rgba(255,255,255,0.5)", bg: "transparent", border: "rgba(255,255,255,0.06)" },
  ];

  const renderRow = (task) => {
    const children = allTasks.filter(t => t.parentId === task.id);
    const bk = isBlocked(task, allTasks);
    const bNames = bk ? getBlockers(task, allTasks).filter(b => !b.completed).map(b => b.name).join(", ") : "";
    return <TaskRow key={task.id} task={task} onToggle={onToggle} onSelect={onSelect}
      selected={selectedId === task.id} childCount={children.length} childDone={children.filter(c => c.completed).length}
      blocked={bk} blockerNames={bNames} allTasks={allTasks} />;
  };

  return (
    <div style={{ padding: isMobile ? 10 : 20 }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
        W{getGreekWeek()} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
      </div>
      {sections.map(s => s.tasks.length > 0 && (
        <div key={s.key} style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", background: s.bg, border: `1px solid ${s.border}` }}>
          <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: 1 }}>{s.title}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.tasks.length}</span>
          </div>
          {s.tasks.sort((a, b) => {
            const p = { High: 0, Mid: 1, Low: 2 };
            return (p[a.priority] || 2) - (p[b.priority] || 2);
          }).map(renderRow)}
        </div>
      ))}
      {noDue.length > 0 && (
        <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ padding: "8px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>NO DUE DATE</span>
          </div>
          {noDue.map(renderRow)}
        </div>
      )}
      {overdue.length === 0 && todayTasks.length === 0 && tomorrowTasks.length === 0 && restOfWeek.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No tasks due this week</div>
      )}
    </div>
  );
};

// ─── Grouped List View ───
const GroupedListView = ({ tasks, allTasks, onToggle, onSelect, selectedId, isMobile, batchMode, batchIds, onBatchToggle }) => {
  const overdue = tasks.filter(t => !t.completed && t.due && t.due < todayStr());
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (s) => setCollapsedSections(prev => ({ ...prev, [s]: !prev[s] }));

  const grouped = {};
  tasks.forEach(t => {
    const s = t.section || "Unsorted";
    if (!grouped[s]) grouped[s] = [];
    grouped[s].push(t);
  });
  const sectionNames = Object.keys(grouped).sort();

  const renderRow = (task) => {
    const children = allTasks.filter(t => t.parentId === task.id);
    const bk = isBlocked(task, allTasks);
    const bNames = bk ? getBlockers(task, allTasks).filter(b => !b.completed).map(b => b.name).join(", ") : "";
    return <TaskRow key={task.id} task={task} onToggle={onToggle} onSelect={onSelect}
      selected={selectedId === task.id} childCount={children.length} childDone={children.filter(c => c.completed).length}
      blocked={bk} blockerNames={bNames} allTasks={allTasks}
      batchMode={batchMode} batchSelected={batchIds.has(task.id)} onBatchToggle={onBatchToggle} />;
  };

  return (
    <div>
      {/* Overdue Banner */}
      {overdue.length > 0 && (
        <div style={{ background: "rgba(232,69,60,0.08)", borderBottom: "1px solid rgba(232,69,60,0.2)" }}>
          <div onClick={() => setOverdueOpen(!overdueOpen)} style={{
            padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#E8453C" }}>⚠️ {overdue.length} OVERDUE</span>
            <span style={{ fontSize: 12, color: "#E8453C" }}>{overdueOpen ? "▾" : "▸"}</span>
          </div>
          {overdueOpen && overdue.map(renderRow)}
        </div>
      )}

      {/* Sections */}
      {sectionNames.map(sec => {
        const secTasks = grouped[sec];
        const collapsed = collapsedSections[sec];
        const doneCount = secTasks.filter(t => t.completed).length;
        return (
          <div key={sec}>
            <div onClick={() => toggleSection(sec)} style={{
              padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer", position: "sticky", top: 0, zIndex: 5,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{collapsed ? "▸" : "▾"}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{sec}</span>
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{doneCount}/{secTasks.length}</span>
            </div>
            {!collapsed && secTasks.map(renderRow)}
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No tasks match filters</div>
      )}
    </div>
  );
};

// ─── MPL Markdown Parser ───
const parseMPL = (markdown) => {
  const lines = markdown.split("\n");
  const tasks = [];
  let currentMonth = "";
  let currentSection = "";

  for (const line of lines) {
    // Month header: ## April 2026 (#M04)  or  ## May 2026 (#M05)
    const monthMatch = line.match(/^## .+?\(#(M\d{2})\)/);
    if (monthMatch) { currentMonth = monthMatch[1]; continue; }
    // Also catch: ## March 2026 (#M03) or just ## month (#Mxx)
    const monthMatch2 = line.match(/^## .+#(M\d{2})/);
    if (monthMatch2 && !monthMatch) { currentMonth = monthMatch2[1]; continue; }

    // Section header: ### Section Name
    const secMatch = line.match(/^### (.+)/);
    if (secMatch) { currentSection = secMatch[1].trim(); continue; }

    // Task line: - [ ] or - [x]
    const taskMatch = line.match(/^- \[([ x])\] (.+)/);
    if (!taskMatch) continue;

    const completed = taskMatch[1] === "x";
    let rest = taskMatch[2];

    // Extract due date
    const dueMatch = rest.match(/`due:: (\d{4}-\d{2}-\d{2})`/);
    const due = dueMatch ? dueMatch[1] : "";

    // Extract completion date
    const compMatch = rest.match(/\[completion:: (\d{4}-\d{2}-\d{2})\]/);
    const completedDate = compMatch ? compMatch[1] : completed ? todayStr() : null;

    // Extract goal
    const goalMatch = rest.match(/#(G[1-4])/);
    const goal = goalMatch ? goalMatch[1] : "G1";

    // Extract priority
    const priMatch = rest.match(/#(High|Mid|Low)/);
    const priority = priMatch ? priMatch[1] : "Mid";

    // Extract month tag if not set from header
    const mTagMatch = rest.match(/#(M\d{2})/);
    const month = currentMonth || (mTagMatch ? mTagMatch[1] : "M04");

    // Extract week
    const weekMatch = rest.match(/#(W\d+)/);
    const week = weekMatch ? weekMatch[1] : "";

    // Clean task name: strip everything after first backtick, or after (@, or after #tag sequences
    let name = rest
      .replace(/`due:: [^`]+`/, "")
      .replace(/\(@[^)]+\)/, "")
      .replace(/\[completion:: [^\]]+\]/, "")
      .replace(/#Q\d+/g, "").replace(/#M\d+/g, "").replace(/#W\d+/g, "")
      .replace(/#High|#Mid|#Low/g, "")
      .replace(/#G[1-4]/g, "")
      .replace(/\*\([^)]+\)\*/g, "") // *(carried note)*
      .trim();

    // Extract notes from *(...)* patterns
    const notesMatch = rest.match(/\*\(([^)]+)\)\*/);
    const notes = notesMatch ? notesMatch[1] : "";

    if (!name) continue;

    tasks.push({
      id: uid(), name, goal, priority, level: 1, month, week,
      start: due ? addDays(due, -2) : "", due,
      status: completed ? "done" : "todo",
      section: currentSection, notes,
      milestone: false, parentId: null,
      completed, completedDate,
      blockedBy: [], recurrence: "none",
    });
  }
  return tasks;
};

// ─── Import MPL Modal ───
const ImportMPLModal = ({ onImport, onClose }) => {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);

  const handlePreview = () => {
    const parsed = parseMPL(text);
    setPreview(parsed);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", borderRadius: 10, padding: 24, width: "min(600px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C" }}>📥 Import from Obsidian MPL</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          Paste your Master Priority List.md content below. The parser reads task lines, sections, goals, priorities, due dates, and completion states.
        </div>
        {!preview ? (
          <>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste Master Priority List.md content here..."
              style={{ ...inputStyle, flex: 1, minHeight: 250, fontFamily: "monospace", fontSize: 10, resize: "none" }} />
            <button onClick={handlePreview} disabled={!text.trim()} style={{
              marginTop: 10, padding: "8px 16px", borderRadius: 6, border: "none",
              background: text.trim() ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
              color: text.trim() ? "#C9A84C" : "rgba(255,255,255,0.2)", cursor: text.trim() ? "pointer" : "not-allowed", fontWeight: 600,
            }}>Preview Import</button>
          </>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#C9A84C", fontWeight: 600, marginBottom: 8 }}>
                Found {preview.length} tasks ({preview.filter(t => t.completed).length} completed, {preview.filter(t => !t.completed).length} open)
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                {Object.keys(GOALS).map(g => (
                  <div key={g} style={{ fontSize: 11 }}>
                    <span style={{ color: GOALS[g].color }}>{GOALS[g].icon} {g}:</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>{preview.filter(t => t.goal === g).length}</span>
                  </div>
                ))}
              </div>
              {preview.slice(0, 20).map((t, i) => (
                <div key={i} style={{ fontSize: 10, padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: t.completed ? "#5B8A72" : "rgba(255,255,255,0.3)" }}>{t.completed ? "✓" : "○"}</span>
                  <span style={{ color: GOALS[t.goal]?.color, flexShrink: 0 }}>{t.goal}</span>
                  <span style={{ color: "#e5e5e5", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{t.section}</span>
                </div>
              ))}
              {preview.length > 20 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>...and {preview.length - 20} more</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPreview(null)} style={{
                flex: 1, padding: "8px", borderRadius: 6, border: "none",
                background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", cursor: "pointer",
              }}>← Back</button>
              <button onClick={() => { onImport(preview); onClose(); }} style={{
                flex: 2, padding: "8px", borderRadius: 6, border: "none",
                background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer", fontWeight: 600,
              }}>Replace All Tasks ({preview.length})</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Batch Action Bar ───
const BatchBar = ({ count, onComplete, onDelete, onMove, onCancel, isMobile }) => (
  <div style={{
    position: "fixed", bottom: 0, left: 0, right: 0, padding: isMobile ? "10px 12px" : "10px 20px",
    background: "#1a1a1a", borderTop: "1px solid rgba(201,168,76,0.3)",
    display: "flex", alignItems: "center", gap: 8, zIndex: 60,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
  }}>
    <span style={{ fontSize: 12, color: "#C9A84C", fontWeight: 700, marginRight: 8 }}>{count} selected</span>
    <button onClick={onComplete} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 5, border: "none", background: "rgba(91,138,114,0.2)", color: "#5B8A72", cursor: "pointer", fontWeight: 600 }}>✓ Complete</button>
    <select onChange={e => { if (e.target.value) onMove(e.target.value); e.target.value = ""; }} style={{ fontSize: 11, padding: "6px 8px", borderRadius: 5, border: "none", background: "rgba(74,106,139,0.2)", color: "#4A6A8B", cursor: "pointer" }}>
      <option value="">→ Move to...</option>
      {STATUS_KEYS.map(s => <option key={s} value={s}>{STATUS_META[s].name}</option>)}
    </select>
    <button onClick={onDelete} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 5, border: "none", background: "rgba(232,69,60,0.15)", color: "#E8453C", cursor: "pointer", fontWeight: 600 }}>🗑 Delete</button>
    <div style={{ flex: 1 }} />
    <button onClick={onCancel} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 5, border: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>Cancel</button>
  </div>
);

// ─── Sync Modal ───
const SyncModal = ({ tasks, history, activity, onApply, onClose }) => {
  const [tab, setTab] = useState("export");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const syncCode = useMemo(() => generateSyncCode(tasks, history, activity), [tasks, history, activity]);

  const handleApply = () => {
    const data = applySyncCode(code);
    if (!data) { setError("Invalid sync code"); return; }
    const age = Date.now() - (data.timestamp || 0);
    const ageStr = age < 60000 ? "just now" : age < 3600000 ? `${Math.round(age/60000)}m ago` : `${Math.round(age/3600000)}h ago`;
    if (confirm(`Apply sync data? (${data.tasks?.length || 0} tasks, generated ${ageStr})\n\nThis will replace all current data.`)) {
      onApply(data);
      onClose();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", borderRadius: 10, padding: 24, width: "min(450px, 95vw)", maxHeight: "80vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C" }}>🔄 Sync</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          <Btn active={tab === "export"} onClick={() => setTab("export")}>Export Code</Btn>
          <Btn active={tab === "import"} onClick={() => setTab("import")}>Import Code</Btn>
        </div>
        {tab === "export" ? (
          <>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Copy this code and paste it on your other device:</div>
            <textarea value={syncCode} readOnly style={{ ...inputStyle, minHeight: 120, fontFamily: "monospace", fontSize: 9, resize: "none", wordBreak: "break-all" }} />
            <button onClick={() => { navigator.clipboard.writeText(syncCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
              marginTop: 10, padding: "8px 16px", borderRadius: 6, border: "none",
              background: copied ? "rgba(91,138,114,0.3)" : "rgba(201,168,76,0.2)",
              color: copied ? "#5B8A72" : "#C9A84C", cursor: "pointer", fontWeight: 600,
            }}>{copied ? "✓ Copied!" : "Copy to Clipboard"}</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Paste a sync code from another device:</div>
            <textarea value={code} onChange={e => { setCode(e.target.value); setError(""); }} placeholder="Paste sync code here..." style={{ ...inputStyle, minHeight: 120, fontFamily: "monospace", fontSize: 9, resize: "none" }} />
            {error && <div style={{ fontSize: 11, color: "#E8453C", marginTop: 6 }}>{error}</div>}
            <button onClick={handleApply} disabled={!code.trim()} style={{
              marginTop: 10, padding: "8px 16px", borderRadius: 6, border: "none",
              background: code.trim() ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
              color: code.trim() ? "#C9A84C" : "rgba(255,255,255,0.2)", cursor: code.trim() ? "pointer" : "not-allowed", fontWeight: 600,
            }}>Apply Sync Code</button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Timeline View ───
const TimelineView = ({ tasks, onSelect, selectedId, isMobile }) => {
  const active = tasks.filter(t => !t.parentId && t.start && t.due);
  const today = todayStr();

  // Calculate visible range: 2 weeks back to 6 weeks forward
  const rangeStart = addDays(today, -14);
  const rangeEnd = addDays(today, 42);
  const totalDays = 56;

  const inRange = active.filter(t => t.due >= rangeStart && t.start <= rangeEnd);
  const byGoal = {};
  inRange.forEach(t => {
    if (!byGoal[t.goal]) byGoal[t.goal] = [];
    byGoal[t.goal].push(t);
  });

  const dayToX = (d) => {
    const diff = (new Date(d + "T00:00:00") - new Date(rangeStart + "T00:00:00")) / 86400000;
    return (diff / totalDays) * 100;
  };

  // Week markers
  const weeks = [];
  for (let i = 0; i < totalDays; i += 7) {
    const d = addDays(rangeStart, i);
    weeks.push({ date: d, x: (i / totalDays) * 100 });
  }

  return (
    <div style={{ padding: isMobile ? 10 : 20 }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Timeline · {fmtDate(rangeStart)} → {fmtDate(rangeEnd)}</div>

      {/* Week headers */}
      <div style={{ position: "relative", height: 24, marginBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ position: "absolute", left: `${w.x}%`, fontSize: 9, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
            {fmtDate(w.date)}
          </div>
        ))}
        {/* Today marker */}
        <div style={{ position: "absolute", left: `${dayToX(today)}%`, top: 0, bottom: -4, width: 2, background: "#C9A84C", zIndex: 2 }} />
      </div>

      {/* Goal groups */}
      {Object.entries(byGoal).map(([goal, goalTasks]) => (
        <div key={goal} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: GOALS[goal]?.color, marginBottom: 6 }}>
            {GOALS[goal]?.icon} {goal} — {GOALS[goal]?.name}
          </div>
          {goalTasks.sort((a, b) => a.start.localeCompare(b.start)).map(task => {
            const left = Math.max(0, dayToX(task.start));
            const right = Math.min(100, dayToX(task.due));
            const width = Math.max(1.5, right - left);
            const overdue = !task.completed && task.due < today;
            return (
              <div key={task.id} onClick={() => onSelect(task.id)} style={{
                position: "relative", height: 22, marginBottom: 3, cursor: "pointer",
              }}>
                <div style={{
                  position: "absolute", left: `${left}%`, width: `${width}%`, top: 2, height: 18,
                  background: task.completed ? "rgba(91,138,114,0.3)" : overdue ? "rgba(232,69,60,0.3)" : `${GOALS[goal]?.color}33`,
                  border: `1px solid ${task.completed ? "rgba(91,138,114,0.5)" : overdue ? "rgba(232,69,60,0.5)" : GOALS[goal]?.color + "66"}`,
                  borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 4, overflow: "hidden",
                  outline: selectedId === task.id ? "2px solid rgba(201,168,76,0.5)" : "none",
                  opacity: task.completed ? 0.5 : 1,
                }}>
                  <span style={{
                    fontSize: 9, color: task.completed ? "rgba(255,255,255,0.4)" : "#e5e5e5",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    textDecoration: task.completed ? "line-through" : "none",
                  }}>{task.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {inRange.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No tasks with date ranges in this window</div>
      )}
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
  const td = todayStr();

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
          const isToday = dateStr === td;
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
const Dashboard = ({ tasks, history, isMobile, activity }) => {
  const active = tasks.filter(t => !t.parentId);
  const completed = active.filter(t => t.completed).length;
  const total = active.length;
  const overdue = active.filter(t => !t.completed && t.due && new Date(t.due + "T23:59:59") < new Date()).length;
  const blockedCount = active.filter(t => !t.completed && isBlocked(t, tasks)).length;

  const byGoal = Object.keys(GOALS).map(g => ({
    goal: g, ...GOALS[g],
    total: active.filter(t => t.goal === g).length,
    done: active.filter(t => t.goal === g && t.completed).length,
  }));

  const byStatus = STATUS_KEYS.map(s => ({
    status: s, ...STATUS_META[s],
    count: active.filter(t => t.status === s).length,
  }));

  const byLevel = Object.entries(LEVELS).map(([k, v]) => ({
    level: k, name: v,
    total: active.filter(t => String(t.level) === k).length,
    done: active.filter(t => String(t.level) === k && t.completed).length,
  }));

  const blockedTasks = active.filter(t => !t.completed && isBlocked(t, tasks));

  const historyDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(todayStr(), -i);
    const count = (history || []).filter(h => h.date === d).length;
    historyDays.push({ date: d, count });
  }
  const maxCount = Math.max(...historyDays.map(h => h.count), 1);

  // ─── Rebellion Block Calculation ───
  const weekBounds = getWeekBounds();
  const weekTasks = active.filter(t => {
    if (t.priority === "Low") return false;
    if (!t.due) return false;
    return t.due >= weekBounds.start && t.due <= weekBounds.end;
  });
  const weekDone = weekTasks.filter(t => t.completed).length;
  const weekTotal = weekTasks.length;
  const rebellionPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
  const rebellionUnlocked = rebellionPct >= 90;
  const rebellionColor = rebellionUnlocked ? "#C9A84C" : rebellionPct >= 70 ? "#D4A84B" : "#E8453C";

  return (
    <div>
      {/* Rebellion Block */}
      <div style={{
        background: rebellionUnlocked ? "rgba(201,168,76,0.08)" : "rgba(232,69,60,0.06)",
        border: `1px solid ${rebellionUnlocked ? "rgba(201,168,76,0.3)" : "rgba(232,69,60,0.2)"}`,
        borderRadius: 10, padding: isMobile ? 14 : 18, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: rebellionColor, letterSpacing: 0.5 }}>
              {rebellionUnlocked ? "⚡ REBELLION BLOCK UNLOCKED" : "🔥 DUTY RESET ACTIVE"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              {rebellionUnlocked
                ? "90%+ achieved — 4 hours unstructured time earned"
                : "Below 90% — 2hr focused duty + Stoicism Journal before leisure"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: rebellionColor, lineHeight: 1 }}>{rebellionPct}%</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{weekDone}/{weekTotal} High+Mid</div>
          </div>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, position: "relative", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4, transition: "width 0.5s ease",
            width: `${rebellionPct}%`,
            background: rebellionUnlocked
              ? "linear-gradient(90deg, #C9A84C, #D4A84B)"
              : `linear-gradient(90deg, ${rebellionColor}, ${rebellionColor}88)`,
          }} />
          <div style={{ position: "absolute", top: -2, bottom: -2, left: "90%", width: 2, background: "rgba(255,255,255,0.3)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>W{getGreekWeek()} · {weekBounds.start.slice(5)} → {weekBounds.end.slice(5)}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>90% threshold</span>
        </div>
        {weekTasks.filter(t => !t.completed).length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Remaining this week ({weekTasks.filter(t => !t.completed).length})
            </div>
            {weekTasks.filter(t => !t.completed).slice(0, 6).map(t => (
              <div key={t.id} style={{ fontSize: 11, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: GOALS[t.goal]?.color, fontSize: 10 }}>{GOALS[t.goal]?.icon}</span>
                <span style={{ color: "#e5e5e5", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                <Pill bg={`${PRIORITIES[t.priority]}22`} color={PRIORITIES[t.priority]}>{t.priority}</Pill>
              </div>
            ))}
            {weekTasks.filter(t => !t.completed).length > 6 && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>+{weekTasks.filter(t => !t.completed).length - 6} more</div>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: isMobile ? 8 : 12, marginBottom: 20 }}>
        {[
          { label: "Total", value: total, color: "#C9A84C" },
          { label: "Completed", value: completed, color: "#5B8A72" },
          { label: "In Progress", value: active.filter(t => t.status === "in_progress").length, color: "#D4A84B" },
          { label: "Overdue", value: overdue, color: "#E8453C" },
          { label: "Blocked", value: blockedCount, color: "#8B4A4A" },
        ].map(c => (
          <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
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

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Hierarchy Level Coverage</div>
          {byLevel.map(l => (
            <div key={l.level} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>L{l.level} — {l.name}</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{l.done}/{l.total}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                <div style={{ height: "100%", background: "#C9A84C", borderRadius: 3, width: `${l.total ? (l.done / l.total) * 100 : 0}%`, transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Completion History (14 days)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
          {historyDays.map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "100%", height: Math.max(4, (h.count / maxCount) * 50), background: h.count > 0 ? "#5B8A72" : "rgba(255,255,255,0.06)", borderRadius: 2, transition: "height 0.3s" }} />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                {new Date(h.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
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

      {blockedTasks.length > 0 && (
        <div style={{ background: "rgba(139,74,74,0.1)", borderRadius: 8, padding: 16, border: "1px solid rgba(139,74,74,0.2)", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8B4A4A", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>🔒 Blocked Tasks ({blockedTasks.length})</div>
          {blockedTasks.map(t => {
            const bNames = getBlockers(t, tasks).filter(b => !b.completed).map(b => b.name).join(", ");
            return (
              <div key={t.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: GOALS[t.goal]?.color }}>{GOALS[t.goal]?.icon} </span>
                <span style={{ color: "#e5e5e5" }}>{t.name}</span>
                <div style={{ fontSize: 10, color: "#E8453C", marginTop: 2 }}>Waiting on: {bNames}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Log */}
      {activity && activity.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>📝 Recent Activity</div>
          {activity.slice(-15).reverse().map((a, i) => {
            const time = new Date(a.timestamp);
            const icons = { completed: "✓", deleted: "🗑", created: "✚", status: "→" };
            const colors = { completed: "#5B8A72", deleted: "#E8453C", created: "#C9A84C", status: "#D4A84B" };
            return (
              <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: colors[a.action] || "#888", flexShrink: 0, width: 14 }}>{icons[a.action] || "•"}</span>
                <span style={{ fontSize: 11, color: "#e5e5e5", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.taskName}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                  {time.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Export Modal ───
const ExportModal = ({ markdown, onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", borderRadius: 10, padding: 24, width: "min(600px, 95vw)", maxHeight: "80vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C" }}>📋 Obsidian Export</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</button>
      </div>
      <textarea value={markdown} readOnly style={{ ...inputStyle, flex: 1, minHeight: 300, fontFamily: "monospace", fontSize: 11, resize: "none" }} />
      <button onClick={() => { navigator.clipboard.writeText(markdown); }} style={{
        marginTop: 10, padding: "8px 16px", borderRadius: 6, border: "none",
        background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer", fontWeight: 600,
      }}>Copy to Clipboard</button>
    </div>
  </div>
);

// ─── AI Panel ───
const AIPanel = ({ tasks, history, onClose, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const quickPrompts = [
    { label: "🎯 Focus Today", prompt: "Based on my current tasks, what are the top 5 things I should focus on today? Consider due dates, priorities, overdue items, blocked tasks, and dependency chains. Give me a ranked list with brief reasoning." },
    { label: "📊 Weekly Analysis", prompt: "Run a weekly analysis of my task data. Show: completion rate, tasks by goal (G1-G4), overdue count, hierarchy level coverage (L1-L6), key wins and gaps. Format it like my Weekly Mini-Analysis template." },
    { label: "⚡ G1 Status", prompt: "Give me a full G1 (Ultimate Autonomous Man) status report. What G1 tasks are executing vs just planned? Am I doing any Level 3+ identity work? What's the single most important G1 action right now?" },
    { label: "🔨 G3 Status", prompt: "Give me a full G3 (Physical Foundation) status report. Has the athletic training block started? What's the dependency chain look like? What's blocked and what's actionable? Single most important G3 action?" },
    { label: "📋 EoM Prep", prompt: "Prepare my End of Month review data. Summarize: total tasks completed this month, completion rate by goal, overdue items, hierarchy level balance, biggest win, biggest gap. Suggest Maturity Assessment scores for L1-L6 across all 4 goals based on actual execution evidence." },
  ];

  const buildContext = () => {
    const open = tasks.filter(t => !t.completed && !t.parentId);
    const done = tasks.filter(t => t.completed && !t.parentId);
    const od = open.filter(t => t.due && new Date(t.due + "T23:59:59") < new Date());
    const blocked = open.filter(t => isBlocked(t, tasks));
    return `You are the Forge AI — Connor's personal task intelligence system built into The Forge PM app. You understand his Ubermensch 6-Level Hierarchy (L1 Core Practices through L6 Ultimate Man), his 4 permanent life goals (G1 Ultimate Autonomous Man, G2 Longhouse Tribe, G3 Physical Foundation, G4 Legacy Work), his Greek calendar (current month: Delta/M04), and his Rebellion Block system (90%+ weekly completion = 4hr unstructured time). Speak in his language. Be direct and strategic.

CURRENT TASK DATA:
Open tasks: ${open.length} | Completed: ${done.length} | Overdue: ${od.length} | Blocked: ${blocked.length}

OPEN TASKS:
${open.map(t => `- [${t.priority}] [${t.goal}] [L${t.level}] "${t.name}" due:${t.due || 'none'} section:${t.section || 'none'} status:${t.status}${isBlocked(t, tasks) ? ' BLOCKED by: ' + getBlockers(t, tasks).filter(b => !b.completed).map(b => b.name).join(', ') : ''}${t.recurrence !== 'none' ? ' rec:' + t.recurrence : ''}`).join('\n')}

COMPLETED TASKS:
${done.slice(0, 20).map(t => `- done [${t.goal}] "${t.name}" completed:${t.completedDate}`).join('\n')}

OVERDUE:
${od.map(t => `- OVERDUE [${t.priority}] [${t.goal}] "${t.name}" was due:${t.due}`).join('\n')}`;
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: buildContext(),
          messages: [
            ...messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
            { role: "user", content: text.trim() },
          ],
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(c => c.text || "").join("\n") || "No response received.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Error: " + e.message }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, width: isMobile ? "100%" : 420, height: "100vh",
      background: "#141414", borderLeft: "1px solid rgba(201,168,76,0.2)",
      display: "flex", flexDirection: "column", zIndex: 100,
      boxShadow: "-8px 0 32px rgba(0,0,0,0.6)",
    }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C" }}>⚡ Forge AI</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>Powered by Claude</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>

      <div style={{ padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {quickPrompts.map((qp, i) => (
          <button key={i} onClick={() => sendMessage(qp.prompt)} style={{
            fontSize: 10, padding: "4px 10px", borderRadius: 12,
            border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.06)",
            color: "#C9A84C", cursor: "pointer", whiteSpace: "nowrap",
          }}>{qp.label}</button>
        ))}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 18px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", marginTop: 40, fontSize: 12, lineHeight: 1.8 }}>
            Ask me anything about your tasks.<br />Try a quick prompt above.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "90%", padding: "10px 14px",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.role === "user" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
              color: m.role === "user" ? "#C9A84C" : "#e5e5e5",
              fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 12, color: "rgba(201,168,76,0.5)", padding: "8px 14px" }}>Thinking...</div>}
      </div>

      <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !loading) sendMessage(input); }}
          placeholder="Ask about your tasks..."
          style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
          padding: "6px 14px", borderRadius: 6, border: "none",
          background: input.trim() ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)",
          color: input.trim() ? "#C9A84C" : "rgba(255,255,255,0.2)",
          cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 12,
        }}>Send</button>
      </div>
    </div>
  );
};

// ═══════ MAIN APP ═══════
export default function ForgeApp() {
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("list");
  const [filterGoal, setFilterGoal] = useState("all");
  const [filterMonth, setFilterMonth] = useState(() => getGreekMonth());
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [showExport, setShowExport] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [movingId, setMovingId] = useState(null); // touch kanban
  const [sortBy, setSortBy] = useState("default");
  const [activity, setActivity] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchIds, setBatchIds] = useState(new Set());
  const [showSync, setShowSync] = useState(false);
  const [showImportMPL, setShowImportMPL] = useState(false);
  const undoStack = useRef([]);
  const [undoToast, setUndoToast] = useState(null); // { message, snapshot }

  const pushUndo = (message) => {
    undoStack.current.push({ tasks: JSON.parse(JSON.stringify(tasks)), message });
    if (undoStack.current.length > 20) undoStack.current.shift();
  };

  const doUndo = () => {
    const entry = undoStack.current.pop();
    if (entry) { setTasks(entry.tasks); saveTasks(entry.tasks); }
    setUndoToast(null);
  };

  const logActivity = (action, taskName, details) => {
    setActivity(prev => {
      const next = [...prev, { action, taskName, details, timestamp: new Date().toISOString() }];
      return next;
    });
  };

  // Greek calendar info for header
  const currentGreek = useMemo(() => {
    const mid = getGreekMonth();
    const gm = GREEK_MONTHS.find(g => g.id === mid);
    const wk = getGreekWeek();
    return { month: gm?.name || "?", code: mid, week: wk };
  }, []);

  useEffect(() => {
    const saved = loadTasks();
    setTasks(saved && saved.length > 0 ? saved : SEED_TASKS);
    setHistory(loadHistory() || []);
    setActivity(loadActivity());
    setLoaded(true);
  }, []);

  const save = useCallback((t) => saveTasks(t), []);
  const debouncedSave = useDebounce(save, 500);
  useEffect(() => { if (loaded) debouncedSave(tasks); }, [tasks, loaded]);
  useEffect(() => { if (loaded && history.length > 0) saveHistory(history); }, [history, loaded]);
  useEffect(() => { if (loaded && activity.length > 0) saveActivity(activity); }, [activity, loaded]);

  const sections = useMemo(() => [...new Set(tasks.map(t => t.section).filter(Boolean))].sort(), [tasks]);
  const exportMd = useMemo(() => generateObsidianExport(tasks), [tasks]);

  const toggleComplete = useCallback((id) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      if (!target) return prev;
      if (!target.completed && isBlocked(target, prev)) return prev;

      // Push undo before mutating
      undoStack.current.push({ tasks: JSON.parse(JSON.stringify(prev)), message: `Toggle: ${target.name}` });
      if (undoStack.current.length > 20) undoStack.current.shift();

      const nowCompleting = !target.completed;
      let next = prev.map(t => t.id !== id ? t : {
        ...t, completed: nowCompleting,
        completedDate: nowCompleting ? todayStr() : null,
        status: nowCompleting ? "done" : "todo",
      });
      const toggled = next.find(t => t.id === id);
      if (toggled?.parentId) {
        const parent = next.find(t => t.id === toggled.parentId);
        if (parent?.milestone) {
          const sibs = next.filter(t => t.parentId === parent.id);
          const allDone = sibs.every(s => s.completed);
          if (allDone && !parent.completed) next = next.map(t => t.id === parent.id ? { ...t, completed: true, completedDate: todayStr(), status: "done" } : t);
          if (!allDone && parent.completed) next = next.map(t => t.id === parent.id ? { ...t, completed: false, completedDate: null, status: "in_progress" } : t);
        }
      }
      if (nowCompleting && target.recurrence && target.recurrence !== "none") {
        const nextDue = getNextDue(target.recurrence, target.due);
        if (nextDue) {
          const gap = { daily: 1, weekly: 7, biweekly: 14, monthly: 28 }[target.recurrence] || 7;
          const nextStart = target.start ? addDays(target.start, gap) : null;
          next = [...next, { ...target, id: uid(), completed: false, completedDate: null, status: "todo", due: nextDue, start: nextStart }];
        }
      }

      // Show undo toast
      setTimeout(() => setUndoToast({ message: nowCompleting ? `✓ Completed: ${target.name}` : `↩ Uncompleted: ${target.name}` }), 0);

      return next;
    });
    setHistory(prev => [...prev, { taskId: id, date: todayStr(), action: "completed" }]);
    setActivity(prev => {
      const t = tasks.find(x => x.id === id) || { name: "?" };
      return [...prev, { action: "completed", taskName: t.name, timestamp: new Date().toISOString() }];
    });
  }, [tasks]);

  const updateTask = useCallback((id, u) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...u } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      // Push undo before deleting
      undoStack.current.push({ tasks: JSON.parse(JSON.stringify(prev)), message: `Delete: ${target?.name}` });
      if (undoStack.current.length > 20) undoStack.current.shift();
      setTimeout(() => setUndoToast({ message: `🗑 Deleted: ${target?.name || "task"}` }), 0);
      return prev.filter(t => t.id !== id && t.parentId !== id).map(t => ({ ...t, blockedBy: (t.blockedBy || []).filter(bid => bid !== id) }));
    });
    setSelectedId(null);
    setActivity(prev => {
      const t = tasks.find(x => x.id === id) || { name: "?" };
      return [...prev, { action: "deleted", taskName: t.name, timestamp: new Date().toISOString() }];
    });
  }, [tasks]);

  const addTask = useCallback((t) => {
    setTasks(prev => [...prev, t]);
    setActivity(prev => [...prev, { action: "created", taskName: t.name, timestamp: new Date().toISOString() }]);
  }, []);
  const addChild = useCallback((parentId) => {
    const name = prompt("Subtask name:");
    if (!name?.trim()) return;
    const parent = tasks.find(t => t.id === parentId);
    setTasks(prev => [...prev, {
      id: uid(), name: name.trim(), goal: parent.goal, priority: parent.priority,
      level: parent.level, month: parent.month, week: parent.week,
      start: parent.start, due: parent.due, status: "todo", section: parent.section,
      notes: "", milestone: false, parentId, completed: false, completedDate: null,
      blockedBy: [], recurrence: "none",
    }]);
  }, [tasks]);

  const changeStatus = useCallback((id, s) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      if (s === "done" && target && isBlocked(target, prev)) return prev;
      undoStack.current.push({ tasks: JSON.parse(JSON.stringify(prev)), message: `Status: ${target?.name}` });
      if (undoStack.current.length > 20) undoStack.current.shift();
      return prev.map(t => t.id !== id ? t : {
        ...t, status: s, completed: s === "done",
        completedDate: s === "done" ? todayStr() : null,
      });
    });
    setMovingId(null);
  }, []);

  const handleImport = async () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json";
    inp.onchange = async (e) => {
      try {
        const data = await importJSON(e.target.files[0]);
        if (data.tasks) { setTasks(data.tasks); saveTasks(data.tasks); }
        if (data.history) { setHistory(data.history); saveHistory(data.history); }
        if (data.activity) { setActivity(data.activity); saveActivity(data.activity); }
        alert("Import successful!");
      } catch (err) { alert("Import failed: " + err.message); }
    };
    inp.click();
  };

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
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aB = isBlocked(a, tasks), bB = isBlocked(b, tasks);
      if (aB !== bB) return aB ? 1 : -1;
      // User-selected sort
      if (sortBy === "due") {
        if (a.due && b.due) return a.due.localeCompare(b.due);
        if (a.due) return -1; if (b.due) return 1; return 0;
      }
      if (sortBy === "priority") {
        const p = { High: 0, Mid: 1, Low: 2 };
        return (p[a.priority] || 2) - (p[b.priority] || 2);
      }
      if (sortBy === "goal") return (a.goal || "").localeCompare(b.goal || "");
      if (sortBy === "name") return a.name.localeCompare(b.name);
      // Default: priority then due
      const p = { High: 0, Mid: 1, Low: 2 };
      if ((p[a.priority] || 2) !== (p[b.priority] || 2)) return (p[a.priority] || 2) - (p[b.priority] || 2);
      if (a.due && b.due) return a.due.localeCompare(b.due);
      if (a.due) return -1; if (b.due) return 1;
      return 0;
    });
  }, [tasks, showCompleted, filterGoal, filterMonth, filterPriority, filterLevel, filterSection, search, sortBy]);

  const selectedTask = tasks.find(t => t.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0f0f0f", fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: isMobile ? "10px 12px" : "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: isMobile ? 8 : 16, flexShrink: 0 }}>
        <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: "#C9A84C", letterSpacing: 1 }}>⚒{isMobile ? "" : " THE FORGE"}</div>
        <div style={{ fontSize: 9, color: "rgba(201,168,76,0.5)", fontWeight: 600 }}>{currentGreek.month} W{currentGreek.week}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: isMobile ? 2 : 4 }}>
          {[
            { key: "list", icon: "☰", label: "List" },
            { key: "week", icon: "📌", label: "Week" },
            { key: "kanban", icon: "▦", label: "Kanban" },
            { key: "timeline", icon: "⏤", label: "Time" },
            { key: "calendar", icon: "📅", label: "Cal" },
            { key: "dashboard", icon: "◧", label: "Dash" },
          ].map(v => <Btn key={v.key} active={view === v.key} onClick={() => setView(v.key)}
            style={isMobile ? { padding: "5px 8px", fontSize: 13 } : {}}>{isMobile ? v.icon : `${v.icon} ${v.label}`}</Btn>)}
        </div>
        <Btn onClick={() => setShowAI(true)} style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", fontWeight: 700, padding: isMobile ? "5px 8px" : undefined }}>⚡{isMobile ? "" : " AI"}</Btn>
        <Btn onClick={() => { setBatchMode(!batchMode); setBatchIds(new Set()); }} active={batchMode}
          style={isMobile ? { padding: "5px 8px" } : {}}>☑{isMobile ? "" : " Batch"}</Btn>
        <Btn onClick={() => setShowSync(true)} style={isMobile ? { padding: "5px 8px" } : {}}>🔄{isMobile ? "" : " Sync"}</Btn>
        {!isMobile && <Btn onClick={() => setShowExport(true)}>📋 Export</Btn>}
        <Btn onClick={() => {
          if (isMobile) {
            const items = ["export JSON", "import JSON", "obsidian export", "import MPL", "reset seed data"];
            const choice = prompt("Options:\n1) export\n2) import\n3) obsidian export\n4) import MPL\n5) reset\n\nType number:");
            if (choice === "1") exportJSON(tasks, history, activity);
            else if (choice === "2") handleImport();
            else if (choice === "3") setShowExport(true);
            else if (choice === "4") setShowImportMPL(true);
            else if (choice === "5") { if (confirm("Reset all tasks to seed data?")) { setTasks(SEED_TASKS); saveTasks(SEED_TASKS); setHistory([]); saveHistory([]); setActivity([]); saveActivity([]); } }
          } else {
            const action = prompt("Type 'export', 'import', 'mpl' (import MPL), or 'reset':");
            if (action === "export") exportJSON(tasks, history, activity);
            else if (action === "import") handleImport();
            else if (action === "mpl") setShowImportMPL(true);
            else if (action === "reset") { if (confirm("Reset all tasks to seed data? This cannot be undone.")) { setTasks(SEED_TASKS); saveTasks(SEED_TASKS); setHistory([]); saveHistory([]); setActivity([]); saveActivity([]); } }
          }
        }} style={isMobile ? { padding: "5px 8px" } : {}}>⚙</Btn>
        <button onClick={() => setShowNewTask(true)} style={{
          fontSize: isMobile ? 16 : 12, padding: isMobile ? "4px 10px" : "6px 14px", borderRadius: 6, border: "none",
          background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer", fontWeight: 600,
        }}>{isMobile ? "+" : "+ New Task"}</button>
      </div>

      {/* Filters */}
      {view !== "dashboard" && view !== "week" && view !== "timeline" && (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          {isMobile ? (
            <>
              <div style={{ padding: "6px 12px", display: "flex", gap: 6, alignItems: "center" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "5px 8px" }} />
                <button onClick={() => setShowFilters(!showFilters)} style={{
                  fontSize: 11, padding: "5px 10px", borderRadius: 5, border: "none", cursor: "pointer",
                  background: showFilters ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                  color: showFilters ? "#C9A84C" : "rgba(255,255,255,0.45)", fontWeight: 600,
                }}>⊞ Filter</button>
                <Btn active={showCompleted} onClick={() => setShowCompleted(!showCompleted)} style={{ fontSize: 10, padding: "5px 8px" }}>✓</Btn>
              </div>
              {showFilters && (
                <div style={{ padding: "4px 12px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  <select value={filterGoal} onChange={e => setFilterGoal(e.target.value)} style={{ ...selectStyle, fontSize: 11, padding: "4px 6px" }}>
                    <option value="all">All Goals</option>
                    {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k}</option>)}
                  </select>
                  <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...selectStyle, fontSize: 11, padding: "4px 6px" }}>
                    <option value="all">All Months</option>
                    {GREEK_MONTHS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...selectStyle, fontSize: 11, padding: "4px 6px" }}>
                    <option value="all">All Priority</option>
                    {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ ...selectStyle, fontSize: 11, padding: "4px 6px" }}>
                    <option value="all">All Levels</option>
                    {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>L{k}</option>)}
                  </select>
                  <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{ ...selectStyle, fontSize: 11, padding: "4px 6px" }}>
                    <option value="all">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...selectStyle, fontSize: 11, padding: "4px 6px" }}>
                    <option value="default">Sort: Default</option>
                    <option value="due">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="goal">Goal</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: "8px 20px", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, width: 160 }} />
              <select value={filterGoal} onChange={e => setFilterGoal(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
                <option value="all">All Goals</option>
                {Object.entries(GOALS).map(([k, v]) => <option key={k} value={k}>{v.icon} {k}</option>)}
              </select>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
                <option value="all">All Months</option>
                {GREEK_MONTHS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
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
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...selectStyle, width: "auto" }}>
                <option value="default">Sort: Default</option>
                <option value="due">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="goal">Sort: Goal</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: (view === "list") ? 0 : (view === "week") ? 0 : isMobile ? 10 : 20 }}>
          {view === "list" && (
            <GroupedListView tasks={filtered} allTasks={tasks} onToggle={toggleComplete}
              onSelect={setSelectedId} selectedId={selectedId} isMobile={isMobile}
              batchMode={batchMode} batchIds={batchIds} onBatchToggle={(id) => setBatchIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; })} />
          )}

          {view === "week" && (
            <WeekFocusView tasks={tasks} allTasks={tasks} onToggle={toggleComplete}
              onSelect={setSelectedId} selectedId={selectedId} isMobile={isMobile} />
          )}

          {view === "kanban" && (
            <div>
              {isMobile && movingId && (
                <div style={{ padding: "8px 12px", marginBottom: 8, background: "rgba(201,168,76,0.1)", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#C9A84C" }}>✋ Tap a column header to move task</span>
                  <button onClick={() => setMovingId(null)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Cancel</button>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, minHeight: "100%", overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 12 : 0, scrollSnapType: isMobile ? "x mandatory" : "none" }}>
                {STATUS_KEYS.map(s => (
                  <KanbanCol key={s} status={s} tasks={filtered.filter(t => t.status === s)} allTasks={tasks}
                    onDrop={changeStatus} onToggle={toggleComplete} onSelect={setSelectedId} selectedId={selectedId}
                    isMobile={isMobile} movingId={movingId} onStartMove={setMovingId} />
                ))}
              </div>
            </div>
          )}

          {view === "calendar" && (
            <CalendarView tasks={tasks.filter(t => !t.parentId)} month={calMonth} onMonthChange={setCalMonth}
              onSelect={setSelectedId} selectedId={selectedId} />
          )}

          {view === "timeline" && (
            <TimelineView tasks={tasks} onSelect={setSelectedId} selectedId={selectedId} isMobile={isMobile} />
          )}

          {view === "dashboard" && <Dashboard tasks={tasks} history={history} isMobile={isMobile} activity={activity} />}
        </div>

        {selectedTask && !isMobile && (
          <DetailPanel task={selectedTask} sections={sections} onUpdate={updateTask} onDelete={deleteTask}
            onClose={() => setSelectedId(null)} tasks={tasks} onToggle={toggleComplete} onAddChild={() => addChild(selectedTask.id)} isMobile={false} />
        )}
      </div>

      {/* Mobile Detail Panel (full-screen overlay) */}
      {selectedTask && isMobile && (
        <DetailPanel task={selectedTask} sections={sections} onUpdate={updateTask} onDelete={deleteTask}
          onClose={() => setSelectedId(null)} tasks={tasks} onToggle={toggleComplete} onAddChild={() => addChild(selectedTask.id)} isMobile={true} />
      )}

      {showNewTask && <NewTaskModal sections={sections} onAdd={addTask} onClose={() => setShowNewTask(false)} currentMonth={filterMonth !== "all" ? filterMonth : getGreekMonth()} />}
      {showExport && <ExportModal markdown={exportMd} onClose={() => setShowExport(false)} />}
      {showAI && <><div onClick={() => setShowAI(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} /><AIPanel tasks={tasks} history={history} onClose={() => setShowAI(false)} isMobile={isMobile} /></>}

      {/* Batch Action Bar */}
      {batchMode && batchIds.size > 0 && (
        <BatchBar count={batchIds.size} isMobile={isMobile}
          onComplete={() => {
            undoStack.current.push({ tasks: JSON.parse(JSON.stringify(tasks)), message: `Batch complete ${batchIds.size} tasks` });
            setTasks(prev => prev.map(t => batchIds.has(t.id) ? { ...t, completed: true, completedDate: todayStr(), status: "done" } : t));
            setUndoToast({ message: `✓ Completed ${batchIds.size} tasks` });
            setActivity(prev => [...prev, { action: "completed", taskName: `${batchIds.size} tasks (batch)`, timestamp: new Date().toISOString() }]);
            setBatchIds(new Set()); setBatchMode(false);
          }}
          onDelete={() => {
            if (!confirm(`Delete ${batchIds.size} tasks?`)) return;
            undoStack.current.push({ tasks: JSON.parse(JSON.stringify(tasks)), message: `Batch delete ${batchIds.size} tasks` });
            setTasks(prev => prev.filter(t => !batchIds.has(t.id)).map(t => ({ ...t, blockedBy: (t.blockedBy || []).filter(id => !batchIds.has(id)) })));
            setUndoToast({ message: `🗑 Deleted ${batchIds.size} tasks` });
            setActivity(prev => [...prev, { action: "deleted", taskName: `${batchIds.size} tasks (batch)`, timestamp: new Date().toISOString() }]);
            setBatchIds(new Set()); setBatchMode(false);
          }}
          onMove={(status) => {
            undoStack.current.push({ tasks: JSON.parse(JSON.stringify(tasks)), message: `Batch move ${batchIds.size} tasks` });
            setTasks(prev => prev.map(t => batchIds.has(t.id) ? { ...t, status, completed: status === "done", completedDate: status === "done" ? todayStr() : null } : t));
            setUndoToast({ message: `→ Moved ${batchIds.size} tasks to ${STATUS_META[status].name}` });
            setBatchIds(new Set()); setBatchMode(false);
          }}
          onCancel={() => { setBatchIds(new Set()); setBatchMode(false); }}
        />
      )}

      {/* Sync Modal */}
      {showSync && <SyncModal tasks={tasks} history={history} activity={activity}
        onApply={(data) => {
          if (data.tasks) { setTasks(data.tasks); saveTasks(data.tasks); }
          if (data.history) { setHistory(data.history); saveHistory(data.history); }
          if (data.activity) { setActivity(data.activity); saveActivity(data.activity); }
        }}
        onClose={() => setShowSync(false)} />}

      {/* Import MPL Modal */}
      {showImportMPL && <ImportMPLModal
        onImport={(parsed) => {
          undoStack.current.push({ tasks: JSON.parse(JSON.stringify(tasks)), message: `Import MPL (${parsed.length} tasks)` });
          setTasks(parsed); saveTasks(parsed);
          setUndoToast({ message: `📥 Imported ${parsed.length} tasks from MPL` });
          setActivity(prev => [...prev, { action: "created", taskName: `MPL import (${parsed.length} tasks)`, timestamp: new Date().toISOString() }]);
        }}
        onClose={() => setShowImportMPL(false)} />}

      {/* Undo Toast */}
      {undoToast && <UndoToast message={undoToast.message} onUndo={doUndo} onDismiss={() => setUndoToast(null)} />}
    </div>
  );
}
