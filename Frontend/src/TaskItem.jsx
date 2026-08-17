import { useSortable } from "@dnd-kit/sortable";
// adjustTranslate removed – not exported in current version
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useRef } from "react";

export default function TaskItem({ task, toggleDone, editTaskText, updateTask }) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: task.id || task.task,
  });
    
  const [isEditing, setIsEditing] = useState(false);
  const displayText = task.text || task.task || "";
  const [editText, setEditText] = useState(displayText);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.value.length;
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const style = {
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditing ? "text" : "grab",
    position: "relative",
    display: "flex",
    alignItems: "center",
    wordBreak: "break-word",
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editText.trim() !== "" && editText.trim() !== displayText) {
      editTaskText(editText.trim());
    } else {
      setEditText(displayText);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...(isEditing ? {} : listeners)}
      className={`task-item ${task.done ? "task-done" : ""}`}
      onDoubleClick={() => { if (!task.done) setIsEditing(true); }}
    >
      <input 
        type="checkbox" 
        checked={task.done} 
        onChange={toggleDone}
        onPointerDown={(e) => e.stopPropagation()} 
        style={{ marginTop: task.time ? "4px" : "0px", flexShrink: 0, cursor: "pointer" }} 
      />
      
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: "2px" }}>
        {task.time && !isEditing && (
          <div className="task-time-header" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="task-time-label">🕒 {task.time}</span>
            <div onPointerDown={(e) => e.stopPropagation()}>
              <select 
                className="reminder-select"
                value={task.reminder_offset !== undefined ? task.reminder_offset : 60}
                onChange={(e) => updateTask && updateTask({ reminder_offset: parseInt(e.target.value, 10) })}
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: "#475569",
                  cursor: "pointer",
                  outline: "none",
                  padding: "1px 4px",
                  fontWeight: "bold"
                }}
                title="Anticipo Notifica"
              >
                <option value={0}>🔔 0 min</option>
                <option value={5}>🔔 5 min</option>
                <option value={15}>🔔 15 min</option>
                <option value={30}>🔔 30 min</option>
                <option value={60}>🔔 1 h</option>
                <option value={120}>🔔 2 h</option>
              </select>
            </div>
          </div>
        )}
        
        {isEditing ? (
          <textarea
            ref={inputRef}
            style={{ 
              width: "100%",
              border: "none", 
              padding: "0", 
              resize: "none", 
              overflow: "hidden", 
              outline: "none", 
              fontFamily: "inherit", 
              fontSize: "inherit", 
              lineHeight: "inherit",
              background: "transparent"
            }}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onPointerDown={(e) => e.stopPropagation()} 
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") {
                setEditText(displayText);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <span className="task-text-content">
            {displayText}
          </span>
        )}
      </div>
    </div>
  );
}