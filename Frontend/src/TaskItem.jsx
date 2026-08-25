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
  const [editTime, setEditTime] = useState(task.time || "");
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
    let finalString = editText.trim();
    if (finalString !== "") {
      finalString = finalString.charAt(0).toUpperCase() + finalString.slice(1);
    }
    const timeChanged = editTime !== (task.time || "");
    const textChanged = finalString !== "" && finalString !== displayText;
    if (textChanged) {
      editTaskText(finalString);
    } else {
      setEditText(displayText);
    }
    if (timeChanged && updateTask) {
      // Se l'utente ha svuotato l'orario, manda null; altrimenti il nuovo valore
      updateTask({ time: editTime.trim() || null });
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
        style={{ flexShrink: 0, cursor: "pointer" }} 
      />
      
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: "2px" }}>
        {isEditing ? (
          <div className="task-time-header" style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "nowrap" }}>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); handleSave(); } if (e.key === "Escape") { setEditTime(task.time || ""); setIsEditing(false); } }}
              style={{ fontSize: "0.75rem", padding: "1px 4px", borderRadius: "4px", border: "1px solid #aaa", background: "transparent", color: "inherit", cursor: "text" }}
            />
            {updateTask && (
              <span
                className="reminder-badge"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const offsets = [0, 5, 15, 30, 60, 120];
                  const currentOffset = task.reminder_offset !== undefined ? task.reminder_offset : 60;
                  const currentIndex = offsets.indexOf(currentOffset) !== -1 ? offsets.indexOf(currentOffset) : 4;
                  const nextOffset = offsets[(currentIndex + 1) % offsets.length];
                  updateTask({ reminder_offset: nextOffset });
                }}
                title="Clicca per cambiare l'anticipo della notifica"
              >
                🔔 {task.reminder_offset === 0 ? '0m' : task.reminder_offset === 5 ? '-5m' : task.reminder_offset === 15 ? '-15m' : task.reminder_offset === 30 ? '-30m' : task.reminder_offset === 60 ? '-1h' : task.reminder_offset === 120 ? '-2h' : '-1h'}
              </span>
            )}
          </div>
        ) : task.time ? (
          <div className="task-time-header" style={{ display: "flex", alignItems: "center", gap: "2px", flexWrap: "nowrap", overflow: "hidden" }}>
            <span className="task-time-label" style={{ whiteSpace: "nowrap" }}>{task.time}</span>
            <span
              className="reminder-badge"
              onPointerDown={(e) => {
                e.stopPropagation();
                const offsets = [0, 5, 15, 30, 60, 120];
                const currentOffset = task.reminder_offset !== undefined ? task.reminder_offset : 60;
                const currentIndex = offsets.indexOf(currentOffset) !== -1 ? offsets.indexOf(currentOffset) : 4;
                const nextOffset = offsets[(currentIndex + 1) % offsets.length];
                if (updateTask) updateTask({ reminder_offset: nextOffset });
              }}
              title="Clicca per cambiare l'anticipo della notifica"
            >
              🔔 {task.reminder_offset === 0 ? '0m' : task.reminder_offset === 5 ? '-5m' : task.reminder_offset === 15 ? '-15m' : task.reminder_offset === 30 ? '-30m' : task.reminder_offset === 60 ? '-1h' : task.reminder_offset === 120 ? '-2h' : '-1h'}
            </span>
          </div>
        ) : null}
        
        {isEditing ? (
          <textarea
            ref={inputRef}
            spellCheck={false}
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