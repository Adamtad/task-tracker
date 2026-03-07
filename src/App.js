import { useState } from "react";

const CATEGORIES = ["Work", "Personal", "Finance", "Health", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];

const PRIORITY_STYLES = {
  High: { dot: "#e05252", bg: "#fdf1f1", text: "#c13a3a" },
  Medium: { dot: "#e09a2f", bg: "#fdf8f0", text: "#a06b0e" },
  Low: { dot: "#5a9e6f", bg: "#f0f7f3", text: "#3a7a52" },
};

const CAT_COLORS = {
  Work: "#4a7fa5",
  Personal: "#9b6db5",
  Finance: "#5a9e6f",
  Health: "#d4754e",
  Other: "#888",
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00") < new Date(new Date().toDateString());
}

function getSoonestSubtaskDueDate(task) {
  const dates = task.subtasks.filter((s) => s.dueDate).map((s) => s.dueDate);
  if (dates.length === 0) return null;
  return dates.sort()[0];
}

function getEffectiveDueDate(task) {
  const soonest = getSoonestSubtaskDueDate(task);
  if (soonest) return soonest;
  return task.dueDate || null;
}

function TaskProgress({ subtasks }) {
  if (!subtasks.length) return null;
  const done = subtasks.filter((s) => s.done).length;
  const pct = Math.round((done / subtasks.length) * 100);
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#999", marginBottom: 3 }}>
        <span>{done}/{subtasks.length} steps</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "#efefef", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#5a9e6f" : "#4a7fa5", borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function SubtaskList({ subtasks, onToggle, onDelete, onAdd, onUpdateDueDate }) {
  const [newStep, setNewStep] = useState("");
  const [newDue, setNewDue] = useState("");
  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Steps</div>
      {subtasks.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#ccc", minWidth: 14, paddingTop: 2 }}>{i + 1}.</div>
            <button
              onClick={() => onToggle(s.id)}
              style={{
                width: 16, height: 16, borderRadius: 3, border: s.done ? "none" : "1.5px solid #ccc",
                background: s.done ? "#5a9e6f" : "white", cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 0, marginTop: 1
              }}
            >
              {s.done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3l2.5 2.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
            <span style={{ fontSize: 13, color: s.done ? "#bbb" : "#444", textDecoration: s.done ? "line-through" : "none", lineHeight: 1.4 }}>{s.text}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <input
              type="date"
              value={s.dueDate || ""}
              onChange={(e) => onUpdateDueDate(s.id, e.target.value)}
              title="Step due date"
              style={{ fontSize: 11, padding: "4px 6px", border: "1px solid #e8e8e8", borderRadius: 6, outline: "none", color: "#444", width: 120 }}
            />
            <button onClick={() => onDelete(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: 14, padding: "1px 2px", lineHeight: 1 }}>×</button>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <input
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && newStep.trim()) { onAdd(newStep.trim(), newDue || undefined); setNewStep(""); setNewDue(""); } }}
          placeholder="Add a step… (Enter to save)"
          style={{ flex: 1, minWidth: 120, fontSize: 12, padding: "5px 8px", border: "1px solid #e8e8e8", borderRadius: 6, outline: "none", color: "#444", background: "#fafafa" }}
        />
        <input
          type="date"
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
          placeholder="Due"
          style={{ fontSize: 11, padding: "5px 8px", border: "1px solid #e8e8e8", borderRadius: 6, outline: "none", color: "#444", width: 120 }}
        />
        <button
          onClick={() => { if (newStep.trim()) { onAdd(newStep.trim(), newDue || undefined); setNewStep(""); setNewDue(""); } }}
          style={{ fontSize: 12, padding: "5px 10px", background: "#4a7fa5", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
        >+ Add</button>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggleDone, onToggleSubtask, onDeleteSubtask, onAddSubtask, onUpdateSubtaskDueDate, onEdit, onDelete, onExpand, expanded }) {
  const allSubtasksDone = task.subtasks.length > 0 && task.subtasks.every((s) => s.done);
  const p = PRIORITY_STYLES[task.priority];
  const effectiveDue = getEffectiveDueDate(task);
  const overdue = !task.done && isOverdue(effectiveDue);

  return (
    <div style={{
      background: "white", borderRadius: 10, border: "1px solid #efefef",
      padding: "14px 16px", marginBottom: 10,
      opacity: task.done ? 0.55 : 1,
      transition: "opacity 0.2s",
      boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Checkbox */}
        <button
          onClick={() => onToggleDone(task.id)}
          title={task.subtasks.length > 0 && !allSubtasksDone ? "Complete all steps first" : ""}
          style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
            border: task.done ? "none" : "1.5px solid #ccc",
            background: task.done ? "#5a9e6f" : "white",
            cursor: task.subtasks.length > 0 && !allSubtasksDone && !task.done ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 0
          }}
        >
          {task.done && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4l3 3L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: task.done ? "#aaa" : "#222", textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
            <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: p.bg, color: p.text, fontWeight: 500 }}>{task.priority}</span>
            <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: "#f5f5f5", color: CAT_COLORS[task.category], fontWeight: 500 }}>{task.category}</span>
          </div>

          {(effectiveDue || task.dueDate) && (
            <div style={{ fontSize: 11, marginTop: 3, color: overdue ? "#e05252" : "#aaa", fontWeight: overdue ? 600 : 400 }}>
              {overdue ? "⚠ Overdue · " : "Due "}{formatDate(effectiveDue || task.dueDate)}
              {getSoonestSubtaskDueDate(task) && " (earliest step)"}
            </div>
          )}

          {task.description && (
            <div style={{ fontSize: 12, marginTop: 6, color: "#666", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{task.description}</div>
          )}

          {task.subtasks.length > 0 && !expanded && <TaskProgress subtasks={task.subtasks} />}
          {task.subtasks.length > 0 && !allSubtasksDone && !task.done && !expanded && (
            <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>Next: {task.subtasks.find(s => !s.done)?.text}</div>
          )}

          {expanded && (
            <SubtaskList
              subtasks={task.subtasks}
              onToggle={(sid) => onToggleSubtask(task.id, sid)}
              onDelete={(sid) => onDeleteSubtask(task.id, sid)}
              onAdd={(text, dueDate) => onAddSubtask(task.id, text, dueDate)}
              onUpdateDueDate={(sid, dueDate) => onUpdateSubtaskDueDate(task.id, sid, dueDate)}
            />
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEdit(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 14, padding: "2px 4px", lineHeight: 1 }} title="Edit">✎</button>
          <button onClick={() => onExpand(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: expanded ? "#4a7fa5" : "#ccc", fontSize: 16, padding: "2px 4px", lineHeight: 1 }} title="Expand">
            {expanded ? "▴" : "▾"}
          </button>
          <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: 18, padding: "2px 4px", lineHeight: 1 }} title="Delete">×</button>
        </div>
      </div>
    </div>
  );
}

const TaskFormFields = ({ title, setTitle, priority, setPriority, category, setCategory, dueDate, setDueDate, description, setDescription, steps, setSteps, isEdit }) => (
  <>
    <input
      autoFocus={!isEdit}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Task title"
      style={{ width: "100%", fontSize: 14, padding: "9px 12px", border: "1.5px solid #e8e8e8", borderRadius: 8, outline: "none", marginBottom: 12, boxSizing: "border-box", color: "#222" }}
    />
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Description (optional)</div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add notes or details…"
        rows={3}
        style={{ width: "100%", fontSize: 13, padding: "8px 12px", border: "1.5px solid #e8e8e8", borderRadius: 8, outline: "none", color: "#444", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
      />
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Priority</div>
        <div style={{ display: "flex", gap: 6 }}>
          {PRIORITIES.map(p => (
            <button key={p} type="button" onClick={() => setPriority(p)} style={{
              flex: 1, fontSize: 12, padding: "6px 0", border: "1.5px solid",
              borderColor: priority === p ? PRIORITY_STYLES[p].dot : "#eee",
              background: priority === p ? PRIORITY_STYLES[p].bg : "white",
              color: priority === p ? PRIORITY_STYLES[p].text : "#aaa",
              borderRadius: 7, cursor: "pointer", fontWeight: priority === p ? 600 : 400
            }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Category</div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", fontSize: 13, padding: "7px 10px", border: "1.5px solid #e8e8e8", borderRadius: 8, outline: "none", color: "#444", background: "white" }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Due Date</div>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: "100%", fontSize: 13, padding: "7px 10px", border: "1.5px solid #e8e8e8", borderRadius: 8, outline: "none", color: "#444", boxSizing: "border-box" }} />
      </div>
    </div>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Steps (optional)</div>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#ccc", minWidth: 16 }}>{i + 1}.</span>
          <input
            value={step.text}
            onChange={(e) => { const s = [...steps]; s[i] = { ...s[i], text: e.target.value }; setSteps(s); }}
            onKeyDown={(e) => { if (e.key === "Enter") { setSteps([...steps, { text: "", dueDate: "" }]); } }}
            placeholder={`Step ${i + 1}…`}
            style={{ flex: 1, fontSize: 13, padding: "7px 10px", border: "1.5px solid #e8e8e8", borderRadius: 8, outline: "none", color: "#444", minWidth: 0 }}
          />
          <input
            type="date"
            value={step.dueDate}
            onChange={(e) => { const s = [...steps]; s[i] = { ...s[i], dueDate: e.target.value }; setSteps(s); }}
            title="Step due date"
            style={{ fontSize: 12, padding: "7px 8px", border: "1.5px solid #e8e8e8", borderRadius: 8, outline: "none", color: "#444", width: 130 }}
          />
          {steps.length > 1 && (
            <button type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 18, padding: "0 4px" }}>×</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => setSteps([...steps, { text: "", dueDate: "" }])} style={{ fontSize: 12, color: "#4a7fa5", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>+ Add another step</button>
    </div>
  </>
);

function AddTaskModal({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Work");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ text: "", dueDate: "" }]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      id: generateId(),
      title: title.trim(),
      priority,
      category,
      dueDate,
      description: description.trim() || undefined,
      done: false,
      subtasks: steps.filter(s => s.text.trim()).map(s => ({ id: generateId(), text: s.text.trim(), done: false, dueDate: s.dueDate || undefined }))
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "white", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#222" }}>New Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
        </div>
        <TaskFormFields
          title={title} setTitle={setTitle}
          priority={priority} setPriority={setPriority}
          category={category} setCategory={setCategory}
          dueDate={dueDate} setDueDate={setDueDate}
          description={description} setDescription={setDescription}
          steps={steps} setSteps={setSteps}
          isEdit={false}
        />
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          style={{ width: "100%", padding: "11px", fontSize: 14, fontWeight: 600, background: title.trim() ? "#222" : "#e0e0e0", color: "white", border: "none", borderRadius: 9, cursor: title.trim() ? "pointer" : "not-allowed" }}
        >Add Task</button>
      </div>
    </div>
  );
}

function EditTaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [category, setCategory] = useState(task.category);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [description, setDescription] = useState(task.description || "");
  const [steps, setSteps] = useState(
    task.subtasks.length > 0
      ? task.subtasks.map(s => ({ text: s.text, dueDate: s.dueDate || "" }))
      : [{ text: "", dueDate: "" }]
  );

  const handleSubmit = () => {
    if (!title.trim()) return;
    const trimmedSteps = steps.filter(s => s.text.trim());
    onSave({
      ...task,
      title: title.trim(),
      priority,
      category,
      dueDate: dueDate || undefined,
      description: description.trim() || undefined,
      subtasks: trimmedSteps.map((s, i) => {
        const existing = task.subtasks[i];
        if (existing) return { ...existing, text: s.text.trim(), dueDate: s.dueDate || undefined };
        return { id: generateId(), text: s.text.trim(), done: false, dueDate: s.dueDate || undefined };
      })
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "white", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#222" }}>Edit Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
        </div>
        <TaskFormFields
          title={title} setTitle={setTitle}
          priority={priority} setPriority={setPriority}
          category={category} setCategory={setCategory}
          dueDate={dueDate} setDueDate={setDueDate}
          description={description} setDescription={setDescription}
          steps={steps} setSteps={setSteps}
          isEdit={true}
        />
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          style={{ width: "100%", padding: "11px", fontSize: 14, fontWeight: 600, background: title.trim() ? "#222" : "#e0e0e0", color: "white", border: "none", borderRadius: 9, cursor: title.trim() ? "pointer" : "not-allowed" }}
        >Save changes</button>
      </div>
    </div>
  );
}

export default function TaskTracker() {
  const [tasks, setTasks] = useState([
    {
      id: "demo1", title: "Send project proposal email", priority: "High", category: "Work",
      dueDate: new Date().toISOString().split("T")[0], done: false,
      subtasks: [
        { id: "s1", text: "Get sign-off from manager", done: true, dueDate: "" },
        { id: "s2", text: "Attach budget spreadsheet", done: false, dueDate: new Date().toISOString().split("T")[0] },
        { id: "s3", text: "Send to client", done: false, dueDate: "" },
      ]
    },
    {
      id: "demo2", title: "Renew gym membership", priority: "Low", category: "Health",
      dueDate: "", description: "Check if they have a discount for annual payment.", done: false, subtasks: []
    }
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [expanded, setExpanded] = useState(new Set(["demo1"]));
  const [filter, setFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [showDone, setShowDone] = useState(false);

  const toggleDone = (id) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const canComplete = t.subtasks.length === 0 || t.subtasks.every(s => s.done) || t.done;
      if (!canComplete) return t;
      return { ...t, done: !t.done };
    }));
  };

  const toggleSubtask = (taskId, subId) => {
    setTasks(tasks.map(t => t.id !== taskId ? t : {
      ...t, subtasks: t.subtasks.map(s => s.id !== subId ? s : { ...s, done: !s.done })
    }));
  };

  const deleteSubtask = (taskId, subId) => {
    setTasks(tasks.map(t => t.id !== taskId ? t : { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) }));
  };

  const addSubtask = (taskId, text, dueDate) => {
    setTasks(tasks.map(t => t.id !== taskId ? t : { ...t, subtasks: [...t.subtasks, { id: generateId(), text, done: false, dueDate: dueDate || undefined }] }));
  };

  const updateSubtaskDueDate = (taskId, subId, dueDate) => {
    setTasks(tasks.map(t => t.id !== taskId ? t : {
      ...t,
      subtasks: t.subtasks.map(s => s.id !== subId ? s : { ...s, dueDate: dueDate || undefined })
    }));
  };

  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const addTask = (task) => { setTasks([task, ...tasks]); setExpanded(new Set([...expanded, task.id])); };
  const updateTask = (updated) => {
    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    setEditingTaskId(null);
  };
  const toggleExpand = (id) => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };

  const filtered = tasks
    .filter(t => {
      if (!showDone && t.done) return false;
      if (filter !== "All" && t.priority !== filter) return false;
      if (catFilter !== "All" && t.category !== catFilter) return false;
      return true;
    })
    .slice()
    .sort((a, b) => {
      const dateA = getEffectiveDueDate(a) || "9999-12-31";
      const dateB = getEffectiveDueDate(b) || "9999-12-31";
      return dateA.localeCompare(dateB);
    });

  const counts = { total: tasks.filter(t => !t.done).length, done: tasks.filter(t => t.done).length };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6", fontFamily: "'Georgia', serif", padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #efefef", padding: "20px 24px 0" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Tasks</h1>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{counts.total} active · {counts.done} done</div>
            </div>
            <button onClick={() => setShowAdd(true)} style={{ fontSize: 13, padding: "8px 16px", background: "#222", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>+ New</button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12 }}>
            {["All", ...PRIORITIES].map(p => (
              <button key={p} onClick={() => setFilter(p)} style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "1.5px solid",
                borderColor: filter === p ? "#222" : "#e8e8e8",
                background: filter === p ? "#222" : "white",
                color: filter === p ? "white" : "#888",
                cursor: "pointer", whiteSpace: "nowrap", fontWeight: filter === p ? 600 : 400
              }}>{p}</button>
            ))}
            <div style={{ width: 1, background: "#eee", margin: "0 4px" }} />
            {["All", ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "1.5px solid",
                borderColor: catFilter === c ? CAT_COLORS[c] || "#222" : "#e8e8e8",
                background: catFilter === c ? (CAT_COLORS[c] ? CAT_COLORS[c] + "18" : "#f5f5f5") : "white",
                color: catFilter === c ? (CAT_COLORS[c] || "#222") : "#888",
                cursor: "pointer", whiteSpace: "nowrap", fontWeight: catFilter === c ? 600 : 400
              }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "20px 16px 0" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#bbb", fontSize: 14, padding: "60px 0" }}>
            {tasks.length === 0 ? "No tasks yet. Add your first one!" : "No tasks match this filter."}
          </div>
        )}
        {filtered.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            expanded={expanded.has(task.id)}
            onToggleDone={toggleDone}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
            onAddSubtask={addSubtask}
            onUpdateSubtaskDueDate={updateSubtaskDueDate}
            onEdit={(id) => setEditingTaskId(id)}
            onDelete={deleteTask}
            onExpand={toggleExpand}
          />
        ))}

        {counts.done > 0 && (
          <button onClick={() => setShowDone(!showDone)} style={{ fontSize: 12, color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: "8px 0", display: "block", margin: "4px auto" }}>
            {showDone ? "Hide" : "Show"} {counts.done} completed task{counts.done !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {showAdd && <AddTaskModal onAdd={addTask} onClose={() => setShowAdd(false)} />}
      {editingTaskId && (() => {
        const task = tasks.find(t => t.id === editingTaskId);
        return task ? <EditTaskModal task={task} onSave={updateTask} onClose={() => setEditingTaskId(null)} /> : null;
      })()}
    </div>
  );
}