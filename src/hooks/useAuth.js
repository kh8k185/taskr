import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data: { user } } = await supabase.auth.getUser()

    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Profile missing (e.g. created before email confirmation) — create it now
    if (!data && user) {
      const displayName = user.user_metadata?.display_name || user.email.split('@')[0]
      const initial = displayName.charAt(0).toUpperCase()
      const { data: inserted } = await supabase.from('profiles').insert({
        id:             userId,
        email:          user.email,
        display_name:   displayName,
        avatar_initial: initial,
        is_admin:       false,
      }).select().single()
      data = inserted
    }

    setProfile(data ?? null)
    setLoading(false)
  }

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName?.trim() } },
    })
    if (error) throw error

    if (data.user) {
      const initial = displayName?.trim().charAt(0).toUpperCase() || email.charAt(0).toUpperCase()
      const { error: profileError } = await supabase.from('profiles').insert({
        id:             data.user.id,
        email:          email.toLowerCase(),
        display_name:   displayName?.trim() || email.split('@')[0],
        avatar_initial: initial,
        is_admin:       false,
      })
      if (profileError) console.warn('Profile insert error:', profileError)
    }
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signUp, signIn, signOut }
}
