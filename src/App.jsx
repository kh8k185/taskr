import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import AppPage from './pages/AppPage'
import AdminPage from './pages/AdminPage'
import Sidebar from './components/Sidebar'
import styles from './App.module.css'

export default function App() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth()
  const [page, setPage] = useState('tasks')

  // ── Loading splash ─────────────────────────────────
  if (loading) {
    return (
      <div className={styles.splash}>
        <div className={styles.splashLogo}>⚡</div>
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    )
  }

  // ── Not authenticated ──────────────────────────────
  if (!user) {
    return <AuthPage onAuth={{ signIn, signUp }} />
  }

  // ── Authenticated ──────────────────────────────────
  return (
    <div className={styles.layout}>
      <Sidebar
        profile={profile}
        page={page}
        onNav={setPage}
        onSignOut={signOut}
      />
      <main className={styles.main}>
        {page === 'tasks'  && <AppPage   profile={profile} />}
        {page === 'stats'  && <AppPage   profile={profile} />}
        {page === 'admin'  && profile?.is_admin && <AdminPage />}
        {page === 'admin'  && !profile?.is_admin && (
          <div className={styles.denied}>
            <span>🔒</span>
            <p>Admin access required.</p>
          </div>
        )}
      </main>
    </div>
  )
}
