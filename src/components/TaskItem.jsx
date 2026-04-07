import { useState } from 'react'
import { GripVertical, Pin, ChevronDown, ChevronUp, Trash2, Check, Plus, X } from 'lucide-react'
import styles from './TaskItem.module.css'

function isOverdue(due) {
  if (!due) return false
  return new Date(due + 'T00:00:00') < new Date(new Date().toDateString())
}

function isToday(due) {
  if (!due) return false
  const today = new Date().toISOString().slice(0, 10)
  return due === today
}

function isTomorrow(due) {
  if (!due) return false
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  return due === tomorrow
}

function isYesterday(due) {
  if (!due) return false
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  return due === yesterday
}

function formatDue(due) {
  if (!due) return null
  if (isToday(due)) return 'Today'
  if (isTomorrow(due)) return 'Tomorrow'
  if (isYesterday(due)) return 'Yesterday'
  const d = new Date(due + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
  onPin,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [expanded, setExpanded] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState('')
  const [notesVal, setNotesVal] = useState(task.notes || '')

  function saveEdit() {
    if (editText.trim()) onUpdate(task.id, { text: editText.trim() })
    setEditing(false)
  }

  function handleSubtaskAdd(e) {
    e.preventDefault()
    if (!subtaskInput.trim()) return
    onAddSubtask(task.id, subtaskInput)
    setSubtaskInput('')
  }

  function saveNotes() {
    onUpdate(task.id, { notes: notesVal })
  }

  const overdue = isOverdue(task.due)
  const dueStr = formatDue(task.due)
  const subtasks = task.subtasks || []
  const doneSubtasks = subtasks.filter(s => s.done).length
  const priorityClass = styles['priority_' + task.priority]

  return (
    <div
      className={[
        styles.task,
        task.done ? styles.taskDone : '',
        priorityClass,
        isDragging ? styles.dragging : '',
        isDragOver ? styles.dragOver : '',
      ].filter(Boolean).join(' ')}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={() => {}}
    >
      {/* Main row */}
      <div className={styles.mainRow}>
        <div className={styles.dragHandle} title="Drag to reorder">
          <GripVertical size={15} />
        </div>

        <button
          className={`${styles.checkbox} ${task.done ? styles.checkboxDone : ''}`}
          onClick={() => onToggle(task.id)}
          aria-label="Toggle done"
          type="button"
        >
          {task.done && <Check size={11} strokeWidth={3} />}
        </button>

        <div className={styles.body}>
          {editing ? (
            <input
              className={styles.editInput}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') { setEditText(task.text); setEditing(false) }
              }}
              autoFocus
            />
          ) : (
            <span
              className={styles.text}
              onDoubleClick={() => { if (!task.done) { setEditText(task.text); setEditing(true) } }}
              title={task.done ? '' : 'Double-click to edit'}
            >
              {task.text}
            </span>
          )}

          <div className={styles.meta}>
            <span className={`${styles.badge} ${styles['badge_' + task.priority]}`}>
              {task.priority}
            </span>
            {task.category && (
              <span className={`${styles.badge} ${styles.badgeCat}`}>
                {task.category}
              </span>
            )}
            {dueStr && (
              <span className={`${styles.dueBadge} ${overdue && !task.done ? styles.dueOverdue : isToday(task.due) ? styles.dueToday : ''}`}>
                {dueStr}
              </span>
            )}
            {subtasks.length > 0 && (
              <span className={styles.subtaskCount}>
                {doneSubtasks}/{subtasks.length}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${task.pinned ? styles.pinned : ''}`}
            onClick={() => onPin(task.id)}
            title={task.pinned ? 'Unpin' : 'Pin'}
            type="button"
          >
            <Pin size={13} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => setExpanded(v => !v)}
            title={expanded ? 'Collapse' : 'Expand'}
            type="button"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete(task.id)}
            title="Delete"
            type="button"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className={styles.expanded}>
          {/* Notes */}
          <div className={styles.expandSection}>
            <span className={styles.expandLabel}>Notes</span>
            <textarea
              className={styles.notes}
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
              onBlur={saveNotes}
              placeholder="Add a note..."
              rows={2}
            />
          </div>

          {/* Subtasks */}
          <div className={styles.expandSection}>
            <div className={styles.subtaskHeader}>
              <span className={styles.expandLabel}>Subtasks</span>
              {subtasks.length > 0 && (
                <span className={styles.subtaskProgress}>
                  {doneSubtasks}/{subtasks.length}
                </span>
              )}
            </div>

            {subtasks.length > 0 && (
              <div className={styles.subtaskBar}>
                <div
                  className={styles.subtaskBarFill}
                  style={{ width: (doneSubtasks / subtasks.length * 100) + '%' }}
                />
              </div>
            )}

            {subtasks.length > 0 && (
              <div className={styles.subtaskList}>
                {subtasks.map(sub => (
                  <div key={sub.id} className={`${styles.subtaskItem} ${sub.done ? styles.subtaskDone : ''}`}>
                    <button
                      className={`${styles.subtaskCheck} ${sub.done ? styles.subtaskChecked : ''}`}
                      onClick={() => onToggleSubtask(task.id, sub.id)}
                      type="button"
                      aria-label="Toggle subtask"
                    >
                      {sub.done && <Check size={8} strokeWidth={3} />}
                    </button>
                    <span className={styles.subtaskText}>{sub.text}</span>
                    <button
                      className={styles.subtaskDelete}
                      onClick={() => onDeleteSubtask(task.id, sub.id)}
                      type="button"
                      aria-label="Delete subtask"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form className={styles.addSubtask} onSubmit={handleSubtaskAdd}>
              <input
                className={styles.subtaskInput}
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                placeholder="Add subtask..."
              />
              <button
                type="submit"
                className={styles.subtaskAddBtn}
                disabled={!subtaskInput.trim()}
              >
                <Plus size={12} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
