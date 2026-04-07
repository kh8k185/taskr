import { useState, useEffect } from 'react'
import { Users, CheckSquare, Clock, AlertTriangle, RefreshCw, Shield, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const [profiles,  setProfiles]  = useState([])
  const [taskStats, setTaskStats] = useState({})
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [error,     setError]     = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      // Fetch all profiles
      const { data: profileData, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (pErr) throw pErr
      setProfiles(profileData || [])

      // Fetch task counts per user
      const { data: taskData, error: tErr } = await supabase
        .from('tasks')
        .select('user_id, done')

      if (!tErr && taskData) {
        const stats = {}
        taskData.forEach(({ user_id, done }) => {
          if (!stats[user_id]) stats[user_id] = { total: 0, done: 0 }
          stats[user_id].total++
          if (done) stats[user_id].done++
        })
        setTaskStats(stats)
      }
    } catch (err) {
      setError('Failed to load data. Make sure you are an admin and the schema is set up correctly.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = profiles.filter(p =>
    p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalUsers = profiles.length
  const totalTasks = Object.values(taskStats).reduce((a, s) => a + s.total, 0)
  const totalDone  = Object.values(taskStats).reduce((a, s) => a + s.done, 0)
  const admins     = profiles.filter(p => p.is_admin).length

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <Shield size={18} className={styles.shieldIcon} />
            <h2 className={styles.title}>Admin Dashboard</h2>
          </div>
          <p className={styles.sub}>All registered accounts and their activity</p>
        </div>
        <button className={styles.refreshBtn} onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? styles.spinning : ''} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(124,110,242,0.15)', color: 'var(--accent2)' }}>
            <Users size={18} />
          </div>
          <div>
            <div className={styles.cardNum}>{totalUsers}</div>
            <div className={styles.cardLab}>Total users</div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--low)' }}>
            <CheckSquare size={18} />
          </div>
          <div>
            <div className={styles.cardNum}>{totalDone}</div>
            <div className={styles.cardLab}>Tasks completed</div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--medium)' }}>
            <Clock size={18} />
          </div>
          <div>
            <div className={styles.cardNum}>{totalTasks}</div>
            <div className={styles.cardLab}>Total tasks</div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--high)' }}>
            <Shield size={18} />
          </div>
          <div>
            <div className={styles.cardNum}>{admins}</div>
            <div className={styles.cardLab}>Admins</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIco} />
          <input
            className={styles.searchInput}
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.count}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Error */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className="spinner" />
          <span>Loading accounts…</span>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Tasks</th>
                <th>Done</th>
                <th>Completion</th>
                <th>Joined</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.noResults}>No users found</td>
                </tr>
              ) : filtered.map(p => {
                const s = taskStats[p.id] || { total: 0, done: 0 }
                const pct = s.total ? Math.round(s.done / s.total * 100) : 0
                return (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{p.avatar_initial || p.display_name?.charAt(0).toUpperCase() || '?'}</div>
                        <span className={styles.userName}>{p.display_name}</span>
                      </div>
                    </td>
                    <td className={styles.email}>{p.email}</td>
                    <td className={styles.mono}>{s.total}</td>
                    <td className={styles.mono}>{s.done}</td>
                    <td>
                      <div className={styles.pctCell}>
                        <div className={styles.miniBar}>
                          <div className={styles.miniBarFill} style={{ width: pct + '%' }} />
                        </div>
                        <span className={styles.pctNum}>{pct}%</span>
                      </div>
                    </td>
                    <td className={styles.date}>
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${p.is_admin ? styles.roleAdmin : styles.roleUser}`}>
                        {p.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tip */}
      <div className={styles.tip}>
        <AlertTriangle size={12} />
        To make someone an admin, run:
        <code className={styles.sql}>UPDATE profiles SET is_admin = true WHERE email = 'email@example.com';</code>
        in your Supabase SQL editor.
      </div>
    </div>
  )
}
