import { useState } from 'react'
import styles from './AddTask.module.css'

const CATEGORIES = ['personal', 'work', 'dev', 'health', 'other']
const PRIORITIES = ['high', 'medium', 'low']

export default function AddTask({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('personal')
  const [due, setDue] = useState('')
  const [open, setOpen] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd({ text, priority, category, due })
    setText('')
    setDue('')
    setPriority('medium')
    setCategory('personal')
  }

  return (
    <div className={styles.wrap}>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.mainRow}>
          <input
            className={styles.input}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a task..."
            onFocus={() => setOpen(true)}
          />
          <button type="submit" className={styles.addBtn}>Add</button>
        </div>

        {open && (
          <div className={styles.options}>
            <div className={styles.optGroup}>
              <span className={styles.label}>Priority</span>
              <div className={styles.pills}>
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.pill} ${styles['p_' + p]} ${priority === p ? styles.active : ''}`}
                    onClick={() => setPriority(p)}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div className={styles.optGroup}>
              <span className={styles.label}>Category</span>
              <div className={styles.pills}>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.pill} ${styles.cat} ${category === c ? styles.activeCat : ''}`}
                    onClick={() => setCategory(c)}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div className={styles.optGroup}>
              <span className={styles.label}>Due date</span>
              <input
                type="date"
                className={styles.dateInput}
                value={due}
                onChange={e => setDue(e.target.value)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
