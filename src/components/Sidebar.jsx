import { CheckSquare, LayoutDashboard, Shield, LogOut, Zap } from 'lucide-react'
import styles from './Sidebar.module.css'

const NAV = [
  { id: 'tasks',  label: 'Tasks',     icon: CheckSquare },
  { id: 'stats',  label: 'Overview',  icon: LayoutDashboard },
]

export default function Sidebar({ profile, page, onNav, onSignOut }) {
  const isAdmin = profile?.is_admin

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Zap size={18} strokeWidth={2.5} /></div>
        <span className={styles.logoText}>Taskr</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.navItem} ${page === id ? styles.active : ''}`}
            onClick={() => onNav(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
            {page === id && <div className={styles.activePip} />}
          </button>
        ))}

        {isAdmin && (
          <button
            className={`${styles.navItem} ${styles.adminItem} ${page === 'admin' ? styles.active : ''}`}
            onClick={() => onNav('admin')}
          >
            <Shield size={16} />
            <span>Admin</span>
            {page === 'admin' && <div className={styles.activePip} />}
          </button>
        )}
      </nav>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* User */}
      <div className={styles.user}>
        <div className={styles.avatar}>{profile?.avatar_initial || '?'}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{profile?.display_name || 'User'}</span>
          <span className={styles.userEmail}>{profile?.email || ''}</span>
        </div>
        <button className={styles.signOut} onClick={onSignOut} title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
