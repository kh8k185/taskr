import { useState, useMemo } from 'react'
import { useTasks } from './useTasks'
import AddTask from './components/AddTask'
import TaskItem from './components/TaskItem'
import styles from './App.module.css'

const FILTERS = ['all', 'active', 'done', 'high', 'overdue']
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'priority', label: 'Priority' },
  { value: 'due', label: 'Due date' },
]

function isOverdue(due) {
  if (!due) return false
  return new Date(due + 'T00:00:00') < new Date(new Date().toDateString())
}

function priOrder(p) { return p === 'high' ? 0 : p === 'medium' ? 1 : 2 }

export default function App() {
  const { tasks, addTask, toggleDone, deleteTask, updateTask, clearDone } = useTasks()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter(t => t.done).length
    const overdue = tasks.filter(t => !t.done && isOverdue(t.due)).length
    const pct = total ? Math.round(done / total * 100) : 0
    return { total, done, remaining: total - done, overdue, pct }
  }, [tasks])

  const visible = useMemo(() => {
    let list = [...tasks]
    if (search) list = list.filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
    if (filter === 'active') list = list.filter(t => !t.done)
    else if (filter === 'done') list = list.filter(t => t.done)
    else if (filter === 'high') list = list.filter(t => t.priority === 'high')
    else if (filter === 'overdue') list = list.filter(t => !t.done && isOverdue(t.due))

    if (sort === 'priority') list.sort((a, b) => priOrder(a.priority) - priOrder(b.priority))
    else if (sort === 'due') list.sort((a, b) => {
      if (!a.due && !b.due) return 0
      if (!a.due) return 1
      if (!b.due) return -1
      return new Date(a.due) - new Date(b.due)
    })
    else list.sort((a, b) => b.createdAt - a.createdAt)

    return list
  }, [tasks, filter, sort, search])

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Taskr</h1>
            <p className={styles.sub}>
              {stats.remaining} task{stats.remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <div className={styles.avatar}>K</div>
        </header>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{stats.done}</span>
            <span className={styles.statLabel}>Done</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statVal} ${stats.overdue > 0 ? styles.red : ''}`}>{stats.overdue}</span>
            <span className={styles.statLabel}>Overdue</span>
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: stats.pct + '%' }} />
            </div>
            <span className={styles.pct}>{stats.pct}%</span>
          </div>
        </div>

        <AddTask onAdd={addTask} />

        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className={styles.sortSel} value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === 'overdue' && stats.overdue > 0 && (
                <span className={styles.badge}>{stats.overdue}</span>
              )}
            </button>
          ))}
          {stats.done > 0 && (
            <button className={styles.clearBtn} onClick={clearDone}>
              Clear done
            </button>
          )}
        </div>

        <div className={styles.list}>
          {visible.length === 0 ? (
            <div className={styles.empty}>
              {search ? 'No tasks match your search' : 'Nothing here — add something!'}
            </div>
          ) : (
            visible.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={toggleDone}
                onDelete={deleteTask}
                onUpdate={updateTask}
              />
            ))
          )}
        </div>

      </div>
    </div>
  )
}
