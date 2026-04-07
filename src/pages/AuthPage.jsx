import { useState } from 'react'
import { LogIn, UserPlus, Zap, Eye, EyeOff, Loader } from 'lucide-react'
import styles from './AuthPage.module.css'

export default function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState('login')   // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await onAuth.signIn(email, password)
      } else {
        if (!name.trim()) { setError('Display name is required'); setLoading(false); return }
        await onAuth.signUp(email, password, name)
        setInfo('Account created! Check your email to confirm, then log in.')
        setMode('login')
        setPassword('')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Animated background */}
      <div className={styles.grid} />
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.card} style={{ animation: 'scaleIn 0.3s ease' }}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Zap size={20} strokeWidth={2.5} /></div>
          <span className={styles.logoText}>Taskr</span>
        </div>

        {/* Heading */}
        <div className={styles.heading}>
          <h1 className={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className={styles.sub}>
            {mode === 'login'
              ? 'Sign in to your workspace'
              : 'Start managing tasks today'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setMode('login'); setError(''); setInfo('') }}
            type="button"
          >
            <LogIn size={14} /> Sign in
          </button>
          <button
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => { setMode('register'); setError(''); setInfo('') }}
            type="button"
          >
            <UserPlus size={14} /> Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>Display name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus={mode === 'register'}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus={mode === 'login'}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.pwWrap}>
              <input
                className={styles.input}
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {info  && <div className={styles.info}>{info}</div>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading
              ? <span className="spinner" style={{ width: 18, height: 18 }} />
              : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className={styles.switchBtn}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo('') }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
