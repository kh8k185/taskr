import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'taskr_tasks'

const DEFAULT_TASKS = [
  { id: 1, text: 'Deploy this app to Vercel', priority: 'high', category: 'dev', due: '', done: false, createdAt: Date.now() - 3000 },
  { id: 2, text: 'Touch some grass', priority: 'medium', category: 'personal', due: '', done: false, createdAt: Date.now() - 2000 },
  { id: 3, text: 'Star the repo', priority: 'low', category: 'dev', due: '', done: true, createdAt: Date.now() - 1000 },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_TASKS
  } catch {
    return DEFAULT_TASKS
  }
}

let _nextId = Date.now()

export function useTasks() {
  const [tasks, setTasks] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = useCallback(({ text, priority, category, due }) => {
    setTasks(prev => [{
      id: ++_nextId,
      text: text.trim(),
      priority,
      category,
      due,
      done: false,
      createdAt: Date.now(),
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

  return { tasks, addTask, toggleDone, deleteTask, updateTask, clearDone }
}
