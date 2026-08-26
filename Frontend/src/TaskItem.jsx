import { useSortable } from "@dnd-kit/sortable";
// adjustTranslate removed – not exported in current version
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const REMINDER_OPTIONS = [
  { value: 0,   label: '🔔 Al momento esatto',  short: '🔔0m' },
  { value: 5,   label: '🔔 5 minuti prima',      short: '🔔-5m' },
  { value: 15,  label: '🔔 15 minuti prima',     short: '🔔-15m' },
  { value: 30,  label: '🔔 30 minuti prima',     short: '🔔-30m' },
  { value: 60,  label: '🔔 1 ora prima',         short: '🔔-1h' },
  { value: 120, label: '🔔 2 ore prima',         short: '🔔-2h' },
];

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
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const inputRef = useRef(null);
  const isMobile = ('ontouchstart' in window) || window.innerWidth <= 768;

  const currentOffset = task.reminder_offset !== undefined ? task.reminder_offset : 60;
  const currentOption = REMINDER_OPTIONS.find(o => o.value === currentOffset) || REMINDER_OPTIONS[4];

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
      updateTask({ time: editTime.trim() || null });
    }
  };

  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        handleSave();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isEditing, editText, editTime]);

  // Bottom sheet per mobile
  const BottomSheet = () => createPortal(
    <div 
      className="reminder-sheet-overlay" 
      onClick={(e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setShowBottomSheet(false); 
      }}
    >
      <div 
        className="reminder-sheet" 
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
      >
        <div className="reminder-sheet-handle" />
        <p className="reminder-sheet-title">Anticipo notifica</p>
        {REMINDER_OPTIONS.map(o => (
          <button
            key={o.value}
            className={`reminder-sheet-option ${o.value === currentOffset ? 'active' : ''}`}
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              updateTask && updateTask({ reminder_offset: o.value }); 
              setShowBottomSheet(false); 
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );

  // Funzione per il rendering del reminder (evita l'errore di nested component)
  const renderReminderControl = (extraStyle = {}) => {
    if (isMobile) {
      return (
        <>
          <span
            className="reminder-badge-mobile"
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              setShowBottomSheet(true); 
            }}
            onPointerDown={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={extraStyle}
          >
            {currentOption.short}
          </span>
          {showBottomSheet && <BottomSheet />}
        </>
      );
    }
    return (
      <select
        className="reminder-select"
        value={currentOffset}
        onChange={(e) => updateTask && updateTask({ reminder_offset: parseInt(e.target.value, 10) })}
        onPointerDown={(e) => e.stopPropagation()}
        title="Cambia notifica"
        style={extraStyle}
      >
        {REMINDER_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.short}</option>
        ))}
      </select>
    );
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
        style={{ flexShrink: 0, cursor: "pointer", alignSelf: "center" }} 
      />
      
      <div ref={wrapperRef} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: "2px" }}>
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
            {task.time ? "⏰ " : ""}{displayText}
          </span>
        )}

        {isEditing ? (
          <div className="task-time-header">
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); handleSave(); } if (e.key === "Escape") { setEditTime(task.time || ""); setIsEditing(false); } }}
              style={{ fontSize: "0.75rem", padding: "1px 4px", borderRadius: "4px", border: "1px solid #aaa", background: "transparent", color: "inherit", cursor: "text", flexShrink: 1, minWidth: 0 }}
            />
            {updateTask && editTime && renderReminderControl()}
          </div>
        ) : task.time ? (
          <div className="task-time-header">
            <span className="task-time-label">{task.time}</span>
            {updateTask && renderReminderControl()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
