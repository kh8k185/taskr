import { useState, useMemo, useEffect } from 'react'
import { Sun, Moon, Search, X } from 'lucide-react'
import { useTasks } from './useTasks'
import AddTask from './components/AddTask'
import TaskItem from './components/TaskItem'
import styles from './App.module.css'

const FILTERS = ['all', 'active', 'done', 'pinned', 'high', 'overdue']
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'priority', label: 'Priority' },
  { value: 'due', label: 'Due date' },
  { value: 'az', label: 'A–Z' },
]

function isOverdue(due) {
  if (!due) return false
  return new Date(due + 'T00:00:00') < new Date(new Date().toDateString())
}

function priOrder(p) { return p === 'high' ? 0 : p === 'medium' ? 1 : 2 }

function formatTodayDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function App() {
  const {
    tasks, addTask, toggleDone, deleteTask, updateTask, clearDone,
    togglePin, addSubtask, toggleSubtask, deleteSubtask, reorderTasks,
  } = useTasks()

  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('taskr_theme') || 'dark')
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme === 'light' ? 'light' : '')
    localStorage.setItem('taskr_theme', theme)
  }, [theme])

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter(t => t.done).length
    const remaining = total - done
    const pct = total ? Math.round(done / total * 100) : 0
    return { total, done, remaining, pct }
  }, [tasks])

  const filterCounts = useMemo(() => {
    const overdueList = tasks.filter(t => !t.done && isOverdue(t.due))
    return {
      all: tasks.length,
      active: tasks.filter(t => !t.done).length,
      done: tasks.filter(t => t.done).length,
      pinned: tasks.filter(t => t.pinned).length,
      high: tasks.filter(t => t.priority === 'high').length,
      overdue: overdueList.length,
    }
  }, [tasks])

  const visible = useMemo(() => {
    let list = [...tasks]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.text.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      )
    }

    if (filter === 'active') list = list.filter(t => !t.done)
    else if (filter === 'done') list = list.filter(t => t.done)
    else if (filter === 'pinned') list = list.filter(t => t.pinned)
    else if (filter === 'high') list = list.filter(t => t.priority === 'high')
    else if (filter === 'overdue') list = list.filter(t => !t.done && isOverdue(t.due))

    if (sort === 'priority') {
      list.sort((a, b) => priOrder(a.priority) - priOrder(b.priority))
    } else if (sort === 'due') {
      list.sort((a, b) => {
        if (!a.due && !b.due) return 0
        if (!a.due) return 1
        if (!b.due) return -1
        return new Date(a.due) - new Date(b.due)
      })
    } else if (sort === 'az') {
      list.sort((a, b) => a.text.localeCompare(b.text))
    } else {
      list.sort((a, b) => b.createdAt - a.createdAt)
    }

    // Pinned tasks always float to top
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return 0
    })

    return list
  }, [tasks, filter, sort, search])

  function getEmptyMessage() {
    if (search) return { emoji: '🔍', text: `No tasks match "${search}"` }
    if (filter === 'done') return { emoji: '🎉', text: 'No completed tasks yet' }
    if (filter === 'active') return { emoji: '✅', text: 'All caught up! Nothing left to do.' }
    if (filter === 'pinned') return { emoji: '📌', text: 'No pinned tasks' }
    if (filter === 'high') return { emoji: '🟢', text: 'No high priority tasks' }
    if (filter === 'overdue') return { emoji: '🎊', text: 'Nothing overdue — great work!' }
    return { emoji: '✨', text: 'No tasks yet — add something!' }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Taskr</h1>
            <p className={styles.date}>{formatTodayDate()}</p>
          </div>
          <div className={styles.headerRight}>
            <button
              className={styles.themeBtn}
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className={styles.avatar}>K</div>
          </div>
        </header>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statVal}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCard}>
            <span className={`${styles.statVal} ${styles.doneVal}`}>{stats.done}</span>
            <span className={styles.statLabel}>Done</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCard}>
            <span className={styles.statVal}>{stats.remaining}</span>
            <span className={styles.statLabel}>Remaining</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressPct}>{stats.pct}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: stats.pct + '%' }}
              />
            </div>
          </div>
        </div>

        <AddTask onAdd={addTask} />

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.search}
              placeholder="Search tasks, notes, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <select
            className={styles.sortSel}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.filters}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                onClick={() => setFilter(f)}
              >
                <span className={styles.filterLabel}>{f}</span>
                <span className={`${styles.filterCount} ${filter === f ? styles.activeCount : ''}`}>
                  {filterCounts[f]}
                </span>
              </button>
            ))}
          </div>
          {stats.done > 0 && (
            <button className={styles.clearBtn} onClick={clearDone}>
              Clear done
            </button>
          )}
        </div>

        <div className={styles.list}>
          {visible.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyEmoji}>{getEmptyMessage().emoji}</div>
              <div className={styles.emptyText}>{getEmptyMessage().text}</div>
            </div>
          ) : (
            visible.map(t => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={toggleDone}
                onDelete={deleteTask}
                onUpdate={updateTask}
                onPin={togglePin}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                isDragging={dragId === t.id}
                isDragOver={dragOverId === t.id}
                onDragStart={() => setDragId(t.id)}
                onDragOver={(e) => { e.preventDefault(); setDragOverId(t.id) }}
                onDrop={() => {
                  if (dragId) reorderTasks(dragId, t.id)
                  setDragId(null)
                  setDragOverId(null)
                }}
              />
            ))
          )}
        </div>

      </div>
    </div>
  )
}
