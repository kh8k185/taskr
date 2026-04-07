import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'taskr_v2'

let _nextId = Date.now()

const DEFAULT_TASKS = [
  {
    id: ++_nextId,
    text: 'Ship the new landing page',
    priority: 'high',
    category: 'work',
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    done: false,
    createdAt: Date.now() - 7200000,
    notes: 'Make sure to A/B test the hero CTA. Check with design on the final mockup before pushing.',
    subtasks: [
      { id: 's1', text: 'Write copy for hero section', done: true },
      { id: 's2', text: 'Finalize color palette', done: true },
      { id: 's3', text: 'QA on mobile', done: false },
    ],
    pinned: true,
  },
  {
    id: ++_nextId,
    text: 'Review pull requests from the team',
    priority: 'medium',
    category: 'dev',
    due: new Date().toISOString().slice(0, 10),
    done: false,
    createdAt: Date.now() - 5400000,
    notes: 'Focus on the auth module PRs first. Leave comments, don\'t approve blindly.',
    subtasks: [
      { id: 's4', text: 'PR #42 - auth refactor', done: false },
      { id: 's5', text: 'PR #43 - dark mode fixes', done: false },
    ],
    pinned: false,
  },
  {
    id: ++_nextId,
    text: 'Touch some grass today',
    priority: 'low',
    category: 'health',
    due: new Date().toISOString().slice(0, 10),
    done: false,
    createdAt: Date.now() - 3600000,
    notes: 'Seriously. Step outside for at least 20 minutes.',
    subtasks: [],
    pinned: false,
  },
  {
    id: ++_nextId,
    text: 'Write unit tests for the API layer',
    priority: 'high',
    category: 'dev',
    due: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    done: false,
    createdAt: Date.now() - 2700000,
    notes: '',
    subtasks: [
      { id: 's6', text: 'Test auth endpoints', done: false },
      { id: 's7', text: 'Test task CRUD', done: false },
      { id: 's8', text: 'Mock database calls', done: false },
    ],
    pinned: false,
  },
  {
    id: ++_nextId,
    text: 'Read "Thinking, Fast and Slow"',
    priority: 'low',
    category: 'personal',
    due: '',
    done: false,
    createdAt: Date.now() - 1800000,
    notes: 'Up to chapter 12. Continue from the heuristics section.',
    subtasks: [],
    pinned: false,
  },
  {
    id: ++_nextId,
    text: 'Set up CI/CD pipeline',
    priority: 'medium',
    category: 'dev',
    due: '',
    done: true,
    createdAt: Date.now() - 900000,
    notes: '',
    subtasks: [
      { id: 's9', text: 'Configure GitHub Actions', done: true },
      { id: 's10', text: 'Add deploy step', done: true },
    ],
    pinned: false,
  },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_TASKS
  } catch {
    return DEFAULT_TASKS
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = useCallback(({ text, priority, category, due, notes }) => {
    setTasks(prev => [{
      id: ++_nextId,
      text: text.trim(),
      priority: priority || 'medium',
      category: category || 'personal',
      due: due || '',
      done: false,
      createdAt: Date.now(),
      notes: notes || '',
      subtasks: [],
      pinned: false,
    }, ...prev])
  }, [])

  const toggleDone = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateTask = useCallback((id, changes) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
  }, [])

  const clearDone = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.done))
  }, [])

  const togglePin = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t))
  }, [])

  const addSubtask = useCallback((taskId, text) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: [
          ...t.subtasks,
          { id: 'sub_' + Date.now() + '_' + Math.random(), text: text.trim(), done: false }
        ]
      }
    }))
  }, [])

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s)
      }
    }))
  }, [])

  const deleteSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) }
    }))
  }, [])

  const reorderTasks = useCallback((fromId, toId) => {
    if (fromId === toId) return
    setTasks(prev => {
      const arr = [...prev]
      const fromIndex = arr.findIndex(t => t.id === fromId)
      const toIndex = arr.findIndex(t => t.id === toId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const [moved] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, moved)
      return arr
    })
  }, [])

  return {
    tasks,
    addTask,
    toggleDone,
    deleteTask,
    updateTask,
    clearDone,
    togglePin,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderTasks,
  }
}
