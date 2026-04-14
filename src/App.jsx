import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { GOALS, PRIORITIES, GREEK_MONTHS, LEVELS, STATUS_KEYS, STATUS_META, RECURRENCE_OPTIONS, selectStyle, inputStyle, getGreekMonth, getGreekWeek } from "./constants.js";
import { loadTasks, saveTasks, loadHistory, saveHistory, exportJSON, importJSON } from "./storage.js";
import { SEED_TASKS } from "./seed.js";

// ═══════════════════════════════════════════
// THE FORGE v5.1 — Mobile · PWA · Greek Cal
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

// ─── Task Row ───
const TaskRow = ({ task, onToggle, onSelect, selected, childCount, childDone, blocked, blockerNames, allTasks }) => {
  const g = GOALS[task.goal];
  const overdue = !task.completed && task.due && new Date(task.due + "T23:59:59") < new Date();
  const hasRange = task.start && task.due && task.start !== task.due;
  const blocking = getBlocking(task.id, allTasks);

  return (
    <div onClick={() => onSelect(task.id)} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
      background: selected ? "rgba(201,168,76,0.08)" : "transparent",
      borderLeft: `3px solid ${g?.color || "#555"}`,
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      cursor: "pointer", opacity: task.completed ? 0.45 : blocked ? 0.55 : 1,
    }}>
      <button onClick={e => { e.stopPropagation(); if (!blocked) onToggle(task.id); }} title={blocked ? "Blocked — complete dependencies first" : ""} style={{
        width: 17, height: 17, borderRadius: 3,
        border: `1.5px solid ${task.completed ? g?.color : blocked ? "#E8453C" : "rgba(255,255,255,0.25)"}`,
        background: task.completed ? g?.color : "transparent",
        cursor: blocked ? "not-allowed" : "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff",
      }}>{task.completed ? "✓" : blocked ? "🔒" : ""}</button>
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

// ─── Kanban Column ───
const KanbanCol = ({ status, tasks, allTasks, onDrop, onToggle, onSelect, selectedId }) => {
  const col = STATUS_META[status];
  const [dragOver, setDragOver] = useState(false);

  return (
    <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData("text/plain"); if (id) onDrop(id, status); }}
      style={{
        flex: 1, minWidth: 220, background: dragOver ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
        borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6,
        border: dragOver ? "1px dashed rgba(201,168,76,0.3)" : "1px solid rgba(255,255,255,0.05)", transition: "all 0.15s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color: col.color, fontSize: 14 }}>{col.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{col.name}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{tasks.length}</span>
      </div>
      {tasks.map(task => {
        const g = GOALS[task.goal];
        const bk = isBlocked(task, allTasks);
        return (
          <div key={task.id} draggable={!bk}
            onDragStart={e => { if (bk) { e.preventDefault(); return; } e.dataTransfer.setData("text/plain", task.id); e.dataTransfer.effectAllowed = "move"; }}
            onClick={() => onSelect(task.id)}
            style={{
              padding: "8px 10px", borderRadius: 6,
              background: selectedId === task.id ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.04)",
              borderLeft: `3px solid ${g?.color || "#555"}`, cursor: bk ? "not-allowed" : "grab",
              opacity: task.completed ? 0.45 : bk ? 0.5 : 1, userSelect: "none",
            }}>
            <div style={{ fontSize: 12, fontWeight: task.milestone ? 700 : 400, color: task.milestone ? "#C9A84C" : "#e5e5e5", marginBottom: 4 }}>
              {bk ? "🔒 " : ""}{task.milestone ? "🏴 " : ""}{task.name}
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
const Dashboard = ({ tasks, history, isMobile }) => {
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

  return (
    <div>
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
        <div style={{ background: "rgba(139,74,74,0.1)", borderRadius: 8, padding: 16, border: "1px solid rgba(139,74,74,0.2)" }}>
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
    setLoaded(true);
  }, []);

  const save = useCallback((t) => saveTasks(t), []);
  const debouncedSave = useDebounce(save, 500);
  useEffect(() => { if (loaded) debouncedSave(tasks); }, [tasks, loaded]);
  useEffect(() => { if (loaded && history.length > 0) saveHistory(history); }, [history, loaded]);

  const sections = useMemo(() => [...new Set(tasks.map(t => t.section).filter(Boolean))].sort(), [tasks]);
  const exportMd = useMemo(() => generateObsidianExport(tasks), [tasks]);

  const toggleComplete = useCallback((id) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      if (!target) return prev;
      if (!target.completed && isBlocked(target, prev)) return prev;
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
      return next;
    });
    setHistory(prev => [...prev, { taskId: id, date: todayStr(), action: "completed" }]);
  }, []);

  const updateTask = useCallback((id, u) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...u } : t)), []);
  const deleteTask = useCallback((id) => { setTasks(prev => prev.filter(t => t.id !== id && t.parentId !== id).map(t => ({ ...t, blockedBy: (t.blockedBy || []).filter(bid => bid !== id) }))); setSelectedId(null); }, []);
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
      blockedBy: [], recurrence: "none",
    }]);
  }, [tasks]);

  const changeStatus = useCallback((id, s) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      if (s === "done" && target && isBlocked(target, prev)) return prev;
      return prev.map(t => t.id !== id ? t : {
        ...t, status: s, completed: s === "done",
        completedDate: s === "done" ? todayStr() : null,
      });
    });
  }, []);

  const handleImport = async () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json";
    inp.onchange = async (e) => {
      try {
        const data = await importJSON(e.target.files[0]);
        if (data.tasks) { setTasks(data.tasks); saveTasks(data.tasks); }
        if (data.history) { setHistory(data.history); saveHistory(data.history); }
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
      const p = { High: 0, Mid: 1, Low: 2 };
      if ((p[a.priority] || 2) !== (p[b.priority] || 2)) return (p[a.priority] || 2) - (p[b.priority] || 2);
      if (a.due && b.due) return a.due.localeCompare(b.due);
      if (a.due) return -1; if (b.due) return 1;
      return 0;
    });
  }, [tasks, showCompleted, filterGoal, filterMonth, filterPriority, filterLevel, filterSection, search]);

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
            { key: "kanban", icon: "▦", label: "Kanban" },
            { key: "calendar", icon: "📅", label: "Cal" },
            { key: "dashboard", icon: "◧", label: "Dash" },
          ].map(v => <Btn key={v.key} active={view === v.key} onClick={() => setView(v.key)}
            style={isMobile ? { padding: "5px 8px", fontSize: 13 } : {}}>{isMobile ? v.icon : `${v.icon} ${v.label}`}</Btn>)}
        </div>
        <Btn onClick={() => setShowAI(true)} style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", fontWeight: 700, padding: isMobile ? "5px 8px" : undefined }}>⚡{isMobile ? "" : " AI"}</Btn>
        {!isMobile && <Btn onClick={() => setShowExport(true)}>📋 Export</Btn>}
        <Btn onClick={() => {
          if (isMobile) {
            const items = ["export JSON", "import JSON", "obsidian export", "reset seed data"];
            const choice = prompt("Options:\n1) export\n2) import\n3) obsidian export\n4) reset\n\nType number:");
            if (choice === "1") exportJSON(tasks, history);
            else if (choice === "2") handleImport();
            else if (choice === "3") setShowExport(true);
            else if (choice === "4") { if (confirm("Reset all tasks to seed data?")) { setTasks(SEED_TASKS); saveTasks(SEED_TASKS); setHistory([]); saveHistory([]); } }
          } else {
            const action = prompt("Type 'export' to backup JSON, 'import' to restore, or 'reset' to reload seed data:");
            if (action === "export") exportJSON(tasks, history);
            else if (action === "import") handleImport();
            else if (action === "reset") { if (confirm("Reset all tasks to seed data? This cannot be undone.")) { setTasks(SEED_TASKS); saveTasks(SEED_TASKS); setHistory([]); saveHistory([]); } }
          }
        }} style={isMobile ? { padding: "5px 8px" } : {}}>⚙</Btn>
        <button onClick={() => setShowNewTask(true)} style={{
          fontSize: isMobile ? 16 : 12, padding: isMobile ? "4px 10px" : "6px 14px", borderRadius: 6, border: "none",
          background: "rgba(201,168,76,0.2)", color: "#C9A84C", cursor: "pointer", fontWeight: 600,
        }}>{isMobile ? "+" : "+ New Task"}</button>
      </div>

      {/* Filters */}
      {view !== "dashboard" && (
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
                  <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{ ...selectStyle, fontSize: 11, padding: "4px 6px", gridColumn: "1 / -1" }}>
                    <option value="all">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
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
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: view === "list" ? 0 : isMobile ? 10 : 20 }}>
          {view === "list" && (
            <div>
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No tasks match filters</div>
              ) : (
                filtered.map(task => {
                  const children = tasks.filter(t => t.parentId === task.id);
                  const bk = isBlocked(task, tasks);
                  const bNames = bk ? getBlockers(task, tasks).filter(b => !b.completed).map(b => b.name).join(", ") : "";
                  return (
                    <TaskRow key={task.id} task={task} onToggle={toggleComplete} onSelect={setSelectedId}
                      selected={selectedId === task.id} childCount={children.length} childDone={children.filter(c => c.completed).length}
                      blocked={bk} blockerNames={bNames} allTasks={tasks} />
                  );
                })
              )}
            </div>
          )}

          {view === "kanban" && (
            <div style={{ display: "flex", gap: 12, minHeight: "100%", overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 12 : 0 }}>
              {STATUS_KEYS.map(s => (
                <KanbanCol key={s} status={s} tasks={filtered.filter(t => t.status === s)} allTasks={tasks}
                  onDrop={changeStatus} onToggle={toggleComplete} onSelect={setSelectedId} selectedId={selectedId} />
              ))}
            </div>
          )}

          {view === "calendar" && (
            <CalendarView tasks={tasks.filter(t => !t.parentId)} month={calMonth} onMonthChange={setCalMonth}
              onSelect={setSelectedId} selectedId={selectedId} />
          )}

          {view === "dashboard" && <Dashboard tasks={tasks} history={history} isMobile={isMobile} />}
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
    </div>
  );
}
