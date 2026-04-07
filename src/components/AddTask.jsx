import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import styles from './AddTask.module.css'

const PRIORITIES = ['high', 'medium', 'low']
const CATEGORIES = ['personal', 'work', 'dev', 'health', 'other']

export default function AddTask({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('personal')
  const [due, setDue] = useState('')
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd({ text, priority, category, due, notes })
    setText('')
    setDue('')
    setNotes('')
    setPriority('medium')
    setCategory('personal')
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') close()
  }

  const showAddBtn = text.trim().length > 0

  return (
    <div className={styles.wrap}>
      <form onSubmit={submit} className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
        <div className={styles.mainRow}>
          <input
            className={styles.input}
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
            autoComplete="off"
          />
          {open && (
            <button
              type="button"
              className={styles.closeBtn}
              onClick={close}
              aria-label="Close"
              tabIndex={-1}
            >
              <X size={14} />
            </button>
          )}
          {showAddBtn && open && (
            <button type="submit" className={styles.addBtn}>
              <Plus size={15} />
              Add
            </button>
          )}
        </div>

        {open && (
          <div className={styles.options}>
            <div className={styles.optRow}>
              <div className={styles.optGroup}>
                <span className={styles.optLabel}>Priority</span>
                <div className={styles.pills}>
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.pill} ${styles['p_' + p]} ${priority === p ? styles['p_' + p + '_active'] : ''}`}
                      onClick={() => setPriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.optGroup}>
                <span className={styles.optLabel}>Category</span>
                <div className={styles.pills}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.pill} ${styles.catPill} ${category === c ? styles.catActive : ''}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.optRow}>
              <div className={styles.optGroup}>
                <span className={styles.optLabel}>Due date</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={due}
                  onChange={e => setDue(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.notesGroup}>
              <span className={styles.optLabel}>Notes</span>
              <input
                type="text"
                className={styles.notesInput}
                placeholder="Add a note..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
