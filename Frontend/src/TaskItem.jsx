import { useSortable } from "@dnd-kit/sortable";
// adjustTranslate removed – not exported in current version
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { parseTime, stripTime } from "./utils/dates";

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
  const inputRef = useRef(null);
  const isMobile = ('ontouchstart' in window) || window.innerWidth <= 768;
  const lastTapRef = useRef(0);

  const handleTouchEnd = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!task.done) setIsEditing(true);
    }
    lastTapRef.current = now;
  };

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
    if (finalString === "") { setEditText(displayText); return; }
    finalString = finalString.charAt(0).toUpperCase() + finalString.slice(1);

    // Estrai orario dal testo solo se formato esplicito HH:MM o HH.MM (non numero singolo)
    const strictTimeMatch = finalString.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
    const extractedTime = strictTimeMatch
      ? `${strictTimeMatch[1].padStart(2, '0')}:${strictTimeMatch[2]}`
      : null;
    const cleanedText = extractedTime ? finalString.replace(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/, '').trim() : finalString;
    const finalText = cleanedText ? cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1) : finalString;

    // Orario: usa quello estratto dal testo, poi quello dell'input time, altrimenti mantieni quello esistente
    const newTime = extractedTime !== null ? extractedTime : (editTime || task.time || null);

    const textChanged = finalText !== displayText;
    const timeChanged = newTime !== (task.time || null);

    // Manda tutto in un unico PATCH per evitare race condition
    if (textChanged || timeChanged) {
      const changes = { text: finalText };
      if (timeChanged) changes.time = newTime;
      if (updateTask) updateTask(changes);
      if (textChanged) editTaskText(finalText);
    } else {
      setEditText(displayText);
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

  // Funzione per il rendering del reminder
  // Usiamo la select nativa su TUTTI i dispositivi: su mobile il sistema apre il picker nativo
  // che è touch-friendly e non interferisce con dnd-kit o gli eventi React.
  const renderReminderControl = (extraStyle = {}) => {
    return (
      <select
        className="reminder-select"
        value={currentOffset}
        onChange={(e) => updateTask && updateTask({ reminder_offset: parseInt(e.target.value, 10) })}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
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
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", flexShrink: 0, minWidth: "12px", alignSelf: "center" }}>
        {task.time && <span style={{ fontSize: "9px", lineHeight: "1", textAlign: "center", display: "block", transform: "translateX(-1.5px)" }}>⏰</span>}
        <input 
          type="checkbox" 
          checked={task.done} 
          onChange={toggleDone}
          onPointerDown={(e) => e.stopPropagation()} 
          style={{ margin: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} 
        />
      </div>
      
      <div ref={wrapperRef} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, boxSizing: "border-box", gap: "2px" }}>
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
            {displayText}
          </span>
        )}

        {isEditing ? (
          <div className="task-time-header" style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '138%', borderTop: '1px solid #eee', paddingTop: '2px', marginTop: '1px', marginBottom: '-10px', transform: 'scale(0.72)', transformOrigin: 'top left' }}>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); handleSave(); } if (e.key === "Escape") { setEditTime(task.time || ""); setIsEditing(false); } }}
              style={{ fontSize: "12px", padding: "1px 2px", borderRadius: "4px", border: "1px solid #aaa", background: "transparent", color: "inherit", cursor: "text", width: "100%", boxSizing: "border-box", minHeight: "18px", lineHeight: "1", textAlign: "center" }}
            />
            {updateTask && renderReminderControl()}
          </div>
        ) : task.time ? (
          <div className="task-time-header" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'flex-start', gap: '1px', width: '100%', overflow: 'hidden' }}>
            <span className="task-time-label" style={{ flexShrink: 1, whiteSpace: 'nowrap', minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{task.time}</span>
            {isMobile ? (
              <span className="reminder-badge-mobile" style={{ cursor: "default", flexShrink: 1, whiteSpace: 'nowrap', minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentOption.short}
              </span>
            ) : (
              updateTask && renderReminderControl()
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
