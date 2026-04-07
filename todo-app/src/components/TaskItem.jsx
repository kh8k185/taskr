import { useState } from 'react'
import styles from './TaskItem.module.css'

function isOverdue(due) {
  if (!due) return false
  return new Date(due + 'T00:00:00') < new Date(new Date().toDateString())
}

function formatDue(due) {
  if (!due) return null
  const d = new Date(due + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  function saveEdit() {
    if (editText.trim()) onUpdate(task.id, { text: editText.trim() })
    setEditing(false)
  }

  const overdue = isOverdue(task.due)
  const dueStr = formatDue(task.due)

  return (
    <div className={`${styles.task} ${task.done ? styles.done : ''}`}>
      <button
        className={`${styles.check} ${task.done ? styles.checked : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label="Toggle done"
      >
        {task.done && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>

      <div className={styles.body}>
        {editing ? (
          <input
            className={styles.editInput}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
            autoFocus
          />
        ) : (
          <span className={styles.text} onDoubleClick={() => !task.done && setEditing(true)}>
            {task.text}
          </span>
        )}
        <div className={styles.meta}>
          <span className={`${styles.badge} ${styles['p_' + task.priority]}`}>{task.priority}</span>
          <span className={`${styles.badge} ${styles.cat}`}>{task.category}</span>
          {dueStr && (
            <span className={`${styles.due} ${overdue && !task.done ? styles.overdue : ''}`}>
              {overdue && !task.done ? 'overdue · ' : ''}{dueStr}
            </span>
          )}
        </div>
      </div>

      <button className={styles.del} onClick={() => onDelete(task.id)} aria-label="Delete">
        <svg width="14" height="14" viewBox="0 0 14 14"><line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  )
}
