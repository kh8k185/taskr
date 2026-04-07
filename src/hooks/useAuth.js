import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data: { user: authUser } } = await supabase.auth.getUser()

    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Auto-create profile if missing
    if (!data && authUser) {
      const displayName = authUser.user_metadata?.display_name || authUser.email.split('@')[0]
      const initial = displayName.charAt(0).toUpperCase()
      const { data: inserted } = await supabase.from('profiles').insert({
        id:             userId,
        email:          authUser.email,
        display_name:   displayName,
        avatar_initial: initial,
        is_admin:       false,
        banned:         false,
      }).select().single()
      data = inserted
    }

    // Sign out banned users
    if (data?.banned) {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
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
      await supabase.from('profiles').insert({
        id:             data.user.id,
        email:          email.toLowerCase(),
        display_name:   displayName?.trim() || email.split('@')[0],
        avatar_initial: initial,
        is_admin:       false,
        banned:         false,
      })
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

  async function updateProfile(changes) {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .update(changes)
      .eq('id', user.id)
      .select()
      .single()
    if (!error && data) setProfile(data)
    return { data, error }
  }

  async function uploadAvatar(file) {
    if (!user) return
    const ext  = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (upErr) throw upErr

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    await updateProfile({ avatar_url: publicUrl + '?t=' + Date.now() })
    return publicUrl
  }

  return { user, profile, loading, signUp, signIn, signOut, updateProfile, uploadAvatar }
}
