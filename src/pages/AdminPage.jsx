import { useState, useEffect } from 'react'
import { Users, CheckSquare, BarChart2, Shield, RefreshCw, Search, Ban, Trash2, ShieldCheck, AlertTriangle, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './AdminPage.module.css'

/* ── Confirm Modal ─────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, danger }) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal} style={{ animation: 'scaleIn 0.2s ease' }}>
        <div className={styles.modalIcon}>{danger ? <AlertTriangle size={22} /> : <Shield size={22} />}</div>
        <p className={styles.modalMsg}>{message}</p>
        <div className={styles.modalBtns}>
          <button className={styles.modalCancel} onClick={onCancel}>Cancel</button>
          <button className={`${styles.modalConfirm} ${danger ? styles.modalDanger : ''}`} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Bar Chart ─────────────────────────────────────── */
function BarChart({ data, height = 120 }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className={styles.chart}>
      {data.map((d, i) => (
        <div key={i} className={styles.chartCol}>
          <div className={styles.chartBarWrap} style={{ height }}>
            <div
              className={styles.chartBar}
              style={{ height: `${(d.value / max) * 100}%`, animationDelay: `${i * 40}ms` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className={styles.chartLabel}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Main Component ───────────────────────────────── */
export default function AdminPage() {
  const [profiles,  setProfiles]  = useState([])
  const [taskStats, setTaskStats] = useState({})
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [error,     setError]     = useState('')
  const [confirm,   setConfirm]   = useState(null) // { type, userId, name }

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true); setError('')
    try {
      const { data: profileData, error: pErr } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false })
      if (pErr) throw pErr
      setProfiles(profileData || [])

      const { data: taskData } = await supabase.from('tasks').select('user_id, done')
      if (taskData) {
        const stats = {}
        taskData.forEach(({ user_id, done }) => {
          if (!stats[user_id]) stats[user_id] = { total: 0, done: 0 }
          stats[user_id].total++
          if (done) stats[user_id].done++
        })
        setTaskStats(stats)
      }
    } catch (err) {
      setError('Failed to load. Make sure you are an admin and the schema is correct.')
    } finally {
      setLoading(false)
    }
  }

  async function handleBan(userId, currentlyBanned) {
    await supabase.from('profiles').update({ banned: !currentlyBanned }).eq('id', userId)
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, banned: !currentlyBanned } : p))
    setConfirm(null)
  }

  async function handleDelete(userId) {
    await supabase.from('profiles').delete().eq('id', userId)
    setProfiles(prev => prev.filter(p => p.id !== userId))
    setConfirm(null)
  }

  const filtered = profiles.filter(p =>
    p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalUsers  = profiles.length
  const totalTasks  = Object.values(taskStats).reduce((a, s) => a + s.total, 0)
  const totalDone   = Object.values(taskStats).reduce((a, s) => a + s.done, 0)
  const bannedCount = profiles.filter(p => p.banned).length

  // Chart data — top 8 users by task count
  const chartData = [...profiles]
    .sort((a, b) => (taskStats[b.id]?.total || 0) - (taskStats[a.id]?.total || 0))
    .slice(0, 8)
    .map(p => ({
      label: p.display_name?.split(' ')[0] || p.email?.split('@')[0] || '?',
      value: taskStats[p.id]?.total || 0,
    }))

  const completionData = [...profiles]
    .filter(p => taskStats[p.id]?.total > 0)
    .slice(0, 8)
    .map(p => {
      const s = taskStats[p.id]
      return {
        label: p.display_name?.split(' ')[0] || '?',
        value: Math.round(s.done / s.total * 100),
      }
    })

  return (
    <div className={styles.page}>
      {confirm && (
        <ConfirmModal
          message={
            confirm.type === 'delete'
              ? `Permanently delete ${confirm.name}'s account and all their data?`
              : confirm.banned
                ? `Unban ${confirm.name}?`
                : `Ban ${confirm.name}? They won't be able to log in.`
          }
          danger={confirm.type === 'delete'}
          onCancel={() => setConfirm(null)}
          onConfirm={() =>
            confirm.type === 'delete'
              ? handleDelete(confirm.userId)
              : handleBan(confirm.userId, confirm.banned)
          }
        />
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <div className={styles.titleIcon}><Shield size={16} /></div>
            <h2 className={styles.title}>Admin Dashboard</h2>
          </div>
          <p className={styles.sub}>Manage accounts and view platform activity</p>
        </div>
        <button className={styles.refreshBtn} onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? styles.spinning : ''} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className={styles.cards}>
        {[
          { icon: <Users size={18} />,       label: 'Users',     value: totalUsers,  color: 'accent' },
          { icon: <CheckSquare size={18} />, label: 'Completed', value: totalDone,   color: 'green'  },
          { icon: <BarChart2 size={18} />,   label: 'Total tasks', value: totalTasks, color: 'yellow' },
          { icon: <Ban size={18} />,         label: 'Banned',    value: bannedCount, color: 'red'    },
        ].map((c, i) => (
          <div key={i} className={`${styles.card} ${styles['card_' + c.color]}`}>
            <div className={styles.cardIcon}>{c.icon}</div>
            <div>
              <div className={styles.cardNum}>{c.value}</div>
              <div className={styles.cardLab}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {!loading && profiles.length > 0 && (
        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Tasks per user</h3>
            <BarChart data={chartData} />
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Completion rate (%)</h3>
            <BarChart data={completionData} />
          </div>
        </div>
      )}

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
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')}><X size={12} /></button>}
        </div>
        <span className={styles.count}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}><div className="spinner" /><span>Loading…</span></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Tasks</th>
                <th>Completion</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className={styles.noResults}>No users found</td></tr>
              ) : filtered.map(p => {
                const s   = taskStats[p.id] || { total: 0, done: 0 }
                const pct = s.total ? Math.round(s.done / s.total * 100) : 0
                return (
                  <tr key={p.id} className={p.banned ? styles.bannedRow : ''}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarCell}>
                          {p.avatar_url
                            ? <img src={p.avatar_url} alt="" className={styles.avatarImg} />
                            : <span>{p.avatar_initial || '?'}</span>
                          }
                        </div>
                        <div>
                          <div className={styles.userName}>{p.display_name}</div>
                          {p.is_admin && <div className={styles.adminTag}>admin</div>}
                        </div>
                      </div>
                    </td>
                    <td className={styles.email}>{p.email}</td>
                    <td className={styles.mono}>{s.total}</td>
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
                      <span className={`${styles.statusBadge} ${p.banned ? styles.statusBanned : styles.statusActive}`}>
                        {p.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        {!p.is_admin && (
                          <button
                            className={`${styles.actionBtn} ${p.banned ? styles.unbanBtn : styles.banBtn}`}
                            onClick={() => setConfirm({ type: 'ban', userId: p.id, name: p.display_name, banned: p.banned })}
                            title={p.banned ? 'Unban user' : 'Ban user'}
                          >
                            {p.banned ? <ShieldCheck size={13} /> : <Ban size={13} />}
                          </button>
                        )}
                        {!p.is_admin && (
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => setConfirm({ type: 'delete', userId: p.id, name: p.display_name })}
                            title="Delete account"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
