import { CheckSquare, LayoutDashboard, Shield, LogOut, Zap } from 'lucide-react'
import AvatarUpload from './AvatarUpload'
import styles from './Sidebar.module.css'

const NAV = [
  { id: 'tasks',  label: 'Tasks',    icon: CheckSquare },
  { id: 'stats',  label: 'Overview', icon: LayoutDashboard },
]

export default function Sidebar({ profile, page, onNav, onSignOut, onAvatarUpload }) {
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
            <Icon size={15} />
            <span>{label}</span>
            {page === id && <div className={styles.activePip} />}
          </button>
        ))}

        {isAdmin && (
          <>
            <div className={styles.navDivider} />
            <button
              className={`${styles.navItem} ${styles.adminItem} ${page === 'admin' ? styles.active : ''}`}
              onClick={() => onNav('admin')}
            >
              <Shield size={15} />
              <span>Admin</span>
              {page === 'admin' && <div className={styles.activePip} />}
            </button>
          </>
        )}
      </nav>

      <div className={styles.spacer} />

      {/* User */}
      <div className={styles.user}>
        <AvatarUpload profile={profile} onUpload={onAvatarUpload} size="sm" />
        <div className={styles.userInfo}>
          <span className={styles.userName}>{profile?.display_name || 'User'}</span>
          <span className={styles.userEmail}>{profile?.email || ''}</span>
        </div>
        <button className={styles.signOut} onClick={onSignOut} title="Sign out">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
