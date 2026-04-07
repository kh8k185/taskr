import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal, Pin, Loader } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import AddTask from '../components/AddTask'
import TaskItem from '../components/TaskItem'
import styles from './AppPage.module.css'

const FILTERS = ['all', 'active', 'done', 'pinned', 'high', 'overdue']
const SORTS = [
  { value: 'newest',   label: 'Newest first' },
  { value: 'priority', label: 'Priority' },
  { value: 'due',      label: 'Due date' },
  { value: 'az',       label: 'A – Z' },
]

function isOverdue(due) {
  if (!due) return false
  return new Date(due + 'T00:00:00') < new Date(new Date().toDateString())
}

function priOrder(p) { return p === 'high' ? 0 : p === 'medium' ? 1 : 2 }

export default function AppPage({ profile }) {
  const {
    tasks, loading,
    addTask, toggleDone, deleteTask, updateTask,
    togglePin, clearDone,
    addSubtask, toggleSubtask, deleteSubtask, reorderTasks,
  } = useTasks(profile?.id)

  const [filter, setFilter]     = useState('all')
  const [sort, setSort]         = useState('newest')
  const [search, setSearch]     = useState('')
  const [dragId, setDragId]     = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  // ── Stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = tasks.length
    const done     = tasks.filter(t => t.done).length
    const overdue  = tasks.filter(t => !t.done && isOverdue(t.due)).length
    const pinned   = tasks.filter(t => t.pinned).length
    const pct      = total ? Math.round(done / total * 100) : 0
    return { total, done, remaining: total - done, overdue, pinned, pct }
  }, [tasks])

  const filterCounts = useMemo(() => ({
    all:     tasks.length,
    active:  tasks.filter(t => !t.done).length,
    done:    tasks.filter(t => t.done).length,
    pinned:  tasks.filter(t => t.pinned).length,
    high:    tasks.filter(t => t.priority === 'high' && !t.done).length,
    overdue: tasks.filter(t => !t.done && isOverdue(t.due)).length,
  }), [tasks])

  // ── Filtered & sorted list ─────────────────────────
  const visible = useMemo(() => {
    let list = [...tasks]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.text.toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      )
    }

    if (filter === 'active')  list = list.filter(t => !t.done)
    else if (filter === 'done')    list = list.filter(t => t.done)
    else if (filter === 'pinned')  list = list.filter(t => t.pinned)
    else if (filter === 'high')    list = list.filter(t => t.priority === 'high')
    else if (filter === 'overdue') list = list.filter(t => !t.done && isOverdue(t.due))

    if (sort === 'priority')  list.sort((a, b) => priOrder(a.priority) - priOrder(b.priority))
    else if (sort === 'due')  list.sort((a, b) => {
      if (!a.due && !b.due) return 0
      if (!a.due) return 1; if (!b.due) return -1
      return new Date(a.due) - new Date(b.due)
    })
    else if (sort === 'az')   list.sort((a, b) => a.text.localeCompare(b.text))
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    return list
  }, [tasks, filter, sort, search])

  // ── Drag & drop ────────────────────────────────────
  function onDragStart(id)  { setDragId(id) }
  function onDragOver(id)   { if (id !== dragId) setDragOverId(id) }
  function onDrop()         {
    if (dragId && dragOverId) reorderTasks(dragId, dragOverId)
    setDragId(null); setDragOverId(null)
  }

  // ── Empty state ────────────────────────────────────
  function emptyMsg() {
    if (search)          return { icon: '🔍', text: `No results for "${search}"` }
    if (filter === 'done')   return { icon: '🎉', text: 'No completed tasks yet' }
    if (filter === 'active') return { icon: '✅', text: 'All done — nothing left!' }
    if (filter === 'pinned') return { icon: '📌', text: 'No pinned tasks' }
    if (filter === 'high')   return { icon: '🟢', text: 'No high priority tasks' }
    if (filter === 'overdue')return { icon: '🎊', text: 'Nothing overdue — great work!' }
    return { icon: '✨', text: 'No tasks yet — add something above!' }
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <span>Loading tasks…</span>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>My Tasks</h2>
          <p className={styles.pageDate}>{today}</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className={styles.statsStrip}>
        <div className={styles.statBlock}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLab}>Total</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBlock}>
          <span className={`${styles.statNum} ${styles.greenNum}`}>{stats.done}</span>
          <span className={styles.statLab}>Done</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBlock}>
          <span className={styles.statNum}>{stats.remaining}</span>
          <span className={styles.statLab}>Remaining</span>
        </div>
        {stats.overdue > 0 && <>
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <span className={`${styles.statNum} ${styles.redNum}`}>{stats.overdue}</span>
            <span className={styles.statLab}>Overdue</span>
          </div>
        </>}
        <div className={styles.progressSection}>
          <div className={styles.progressTopRow}>
            <span className={styles.statLab}>Progress</span>
            <span className={styles.progressPct}>{stats.pct}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: stats.pct + '%' }} />
          </div>
        </div>
      </div>

      {/* Add task */}
      <AddTask onAdd={addTask} />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIco} />
          <input
            className={styles.searchInput}
            placeholder="Search tasks, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>
        <div className={styles.sortWrap}>
          <SlidersHorizontal size={13} className={styles.sortIco} />
          <select
            className={styles.sortSel}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'pinned' && <Pin size={10} />}
              <span>{f}</span>
              {filterCounts[f] > 0 && (
                <span className={`${styles.filterBadge} ${filter === f ? styles.filterBadgeActive : ''}`}>
                  {filterCounts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
        {stats.done > 0 && (
          <button className={styles.clearDoneBtn} onClick={clearDone}>
            Clear done
          </button>
        )}
      </div>

      {/* Task list */}
      <div className={styles.list}>
        {visible.length === 0 ? (
          <div className={styles.empty} style={{ animation: 'fadeIn 0.25s ease' }}>
            <span className={styles.emptyIcon}>{emptyMsg().icon}</span>
            <p className={styles.emptyText}>{emptyMsg().text}</p>
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
              onDragStart={() => onDragStart(t.id)}
              onDragOver={() => onDragOver(t.id)}
              onDrop={onDrop}
            />
          ))
        )}
      </div>
    </div>
  )
}
