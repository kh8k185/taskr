import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(userId) {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)

  // ── Fetch ──────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) setTasks(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ── Add task ───────────────────────────────────────
  const addTask = useCallback(async ({ text, priority, category, due, notes }) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id:  userId,
        text:     text.trim(),
        priority: priority  || 'medium',
        category: category  || 'personal',
        due:      due       || null,
        notes:    notes     || '',
        done:     false,
        pinned:   false,
      })
      .select('*, subtasks(*)')
      .single()

    if (!error && data) setTasks(prev => [data, ...prev])
  }, [userId])

  // ── Toggle done ────────────────────────────────────
  const toggleDone = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newDone = !task.done
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t))
    await supabase.from('tasks').update({ done: newDone }).eq('id', id)
  }, [tasks])

  // ── Delete task ────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }, [])

  // ── Update task ────────────────────────────────────
  const updateTask = useCallback(async (id, changes) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
    const { subtasks: _s, ...dbChanges } = changes
    if (Object.keys(dbChanges).length) {
      await supabase.from('tasks').update(dbChanges).eq('id', id)
    }
  }, [])

  // ── Toggle pin ─────────────────────────────────────
  const togglePin = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const pinned = !task.pinned
    setTasks(prev => prev.map(t => t.id === id ? { ...t, pinned } : t))
    await supabase.from('tasks').update({ pinned }).eq('id', id)
  }, [tasks])

  // ── Clear done ─────────────────────────────────────
  const clearDone = useCallback(async () => {
    const doneIds = tasks.filter(t => t.done).map(t => t.id)
    setTasks(prev => prev.filter(t => !t.done))
    if (doneIds.length) {
      await supabase.from('tasks').delete().in('id', doneIds)
    }
  }, [tasks])

  // ── Add subtask ────────────────────────────────────
  const addSubtask = useCallback(async (taskId, text) => {
    const { data, error } = await supabase
      .from('subtasks')
      .insert({ task_id: taskId, text: text.trim(), done: false })
      .select()
      .single()

    if (!error && data) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), data] } : t
      ))
    }
  }, [])

  // ── Toggle subtask ─────────────────────────────────
  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    let newDone = false
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      const subtasks = (t.subtasks || []).map(s => {
        if (s.id !== subtaskId) return s
        newDone = !s.done
        return { ...s, done: newDone }
      })
      return { ...t, subtasks }
    }))
    await supabase.from('subtasks').update({ done: newDone }).eq('id', subtaskId)
  }, [])

  // ── Delete subtask ─────────────────────────────────
  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId) }
        : t
    ))
    await supabase.from('subtasks').delete().eq('id', subtaskId)
  }, [])

  // ── Reorder (client-only) ──────────────────────────
  const reorderTasks = useCallback((fromId, toId) => {
    if (fromId === toId) return
    setTasks(prev => {
      const arr = [...prev]
      const fi  = arr.findIndex(t => t.id === fromId)
      const ti  = arr.findIndex(t => t.id === toId)
      if (fi === -1 || ti === -1) return prev
      const [item] = arr.splice(fi, 1)
      arr.splice(ti, 0, item)
      return arr
    })
  }, [])

  return {
    tasks, loading, fetchTasks,
    addTask, toggleDone, deleteTask, updateTask,
    togglePin, clearDone,
    addSubtask, toggleSubtask, deleteSubtask,
    reorderTasks,
  }
}
