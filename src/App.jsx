import { useEffect, useMemo, useState } from 'react'
import './styles/app.css'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import DailyLog from './components/DailyLog'
import FinalDemonstration from './components/FinalDemonstration'
import ProfileSetup from './components/ProfileSetup'
import WeeklyCheckpoint from './components/WeeklyCheckpoint'

const STORAGE_KEY = 'creative-system-tracker-demo'

const emptyProfile = {
  full_name: '',
  role: 'intern',
  mentor_name: '',
  development_focus: '',
  start_date: '',
  growth_goal: '',
}

const emptyFinalDemo = {
  assignment: '',
  audience: '',
  due_date: '',
  purpose: '',
  ownership_clarity: '',
  workflow_movement: '',
  feedback_applied: '',
  learning_reflection: '',
  score_execution: '',
  score_communication: '',
  score_system: '',
  score_growth: '',
  mentor_notes: '',
  status: 'in_progress',
}

const demoUser = {
  id: 'demo-user',
  email: 'demo@creative-system.local',
}

function calculateReadiness({ dailyLogs, weeklyCheckpoints, finalDemo }) {
  let score = 0

  score += Math.min(dailyLogs.length, 10) * 4
  score += Math.min(weeklyCheckpoints.length, 4) * 10

  if (
    finalDemo?.assignment &&
    finalDemo?.purpose &&
    finalDemo?.ownership_clarity &&
    finalDemo?.workflow_movement &&
    finalDemo?.learning_reflection
  ) {
    score += 20
  }

  return Math.min(score, 100)
}

function readDemoState() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return {
      profile: emptyProfile,
      dailyLogs: [],
      weeklyCheckpoints: [],
      finalDemo: null,
    }
  }

  try {
    return JSON.parse(saved)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return {
      profile: emptyProfile,
      dailyLogs: [],
      weeklyCheckpoints: [],
      finalDemo: null,
    }
  }
}

function App() {
  const demoMode = !isSupabaseConfigured
  const demoState = useMemo(() => (demoMode ? readDemoState() : null), [demoMode])
  const [session, setSession] = useState(demoMode ? { user: demoUser } : null)
  const [loading, setLoading] = useState(!demoMode)
  const [activeView, setActiveView] = useState('dashboard')
  const [profile, setProfile] = useState({
    ...emptyProfile,
    ...(demoState?.profile ?? {}),
  })
  const [dailyLogs, setDailyLogs] = useState(demoState?.dailyLogs ?? [])
  const [weeklyCheckpoints, setWeeklyCheckpoints] = useState(
    demoState?.weeklyCheckpoints ?? [],
  )
  const [finalDemo, setFinalDemo] = useState(demoState?.finalDemo ?? null)
  const [notice, setNotice] = useState('')

  const user = session?.user ?? demoUser

  const readinessScore = useMemo(
    () => calculateReadiness({ dailyLogs, weeklyCheckpoints, finalDemo }),
    [dailyLogs, weeklyCheckpoints, finalDemo],
  )

  useEffect(() => {
    if (demoMode) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [demoMode])

  useEffect(() => {
    if (!demoMode) return

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile, dailyLogs, weeklyCheckpoints, finalDemo }),
    )
  }, [dailyLogs, demoMode, finalDemo, profile, weeklyCheckpoints])

  useEffect(() => {
    if (demoMode || !user?.id) return

    async function loadTracker() {
      setLoading(true)

      const [profileResult, logsResult, checkpointsResult, finalDemoResult] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('log_date', { ascending: false }),
          supabase
            .from('weekly_checkpoints')
            .select('*')
            .eq('user_id', user.id)
            .order('week_ending', { ascending: false }),
          supabase
            .from('final_demonstrations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])

      if (profileResult.data) setProfile({ ...emptyProfile, ...profileResult.data })
      if (logsResult.data) setDailyLogs(logsResult.data)
      if (checkpointsResult.data) setWeeklyCheckpoints(checkpointsResult.data)
      if (finalDemoResult.data) setFinalDemo(finalDemoResult.data)

      setLoading(false)
    }

    loadTracker()
  }, [demoMode, user?.id])

  async function handleProfileSave(nextProfile) {
    if (demoMode) {
      setProfile(nextProfile)
      setNotice('Profile saved in local demo mode.')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      ...nextProfile,
      id: user.id,
      role: nextProfile.role || 'intern',
    })

    if (error) {
      setNotice(error.message)
      return
    }

    setProfile(nextProfile)
    setNotice('Profile saved.')
  }

  async function handleDailyLogSave(form) {
    const record = {
      ...form,
      user_id: user.id,
      log_date: form.log_date || new Date().toISOString().slice(0, 10),
    }

    if (demoMode) {
      setDailyLogs((current) => [
        { ...record, id: crypto.randomUUID(), created_at: new Date().toISOString() },
        ...current,
      ])
      setNotice('Daily log added.')
      return
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .insert(record)
      .select()
      .single()

    if (error) {
      setNotice(error.message)
      return
    }

    setDailyLogs((current) => [data, ...current])
    setNotice('Daily log added.')
  }

  async function handleWeeklyCheckpointSave(form) {
    const record = { ...form, user_id: user.id }

    if (demoMode) {
      setWeeklyCheckpoints((current) => [
        { ...record, id: crypto.randomUUID(), created_at: new Date().toISOString() },
        ...current,
      ])
      setNotice('Weekly checkpoint added.')
      return
    }

    const { data, error } = await supabase
      .from('weekly_checkpoints')
      .insert(record)
      .select()
      .single()

    if (error) {
      setNotice(error.message)
      return
    }

    setWeeklyCheckpoints((current) => [data, ...current])
    setNotice('Weekly checkpoint added.')
  }

  async function handleFinalDemoSave(form) {
    const scoreFields = [
      'score_execution',
      'score_communication',
      'score_system',
      'score_growth',
    ]
    const record = {
      ...form,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    scoreFields.forEach((field) => {
      record[field] = record[field] === '' ? null : Number(record[field])
    })

    if (demoMode) {
      setFinalDemo({
        ...emptyFinalDemo,
        ...record,
        id: finalDemo?.id ?? crypto.randomUUID(),
        created_at: finalDemo?.created_at ?? new Date().toISOString(),
      })
      setNotice('Final demonstration saved.')
      return
    }

    const { data, error } = await supabase
      .from('final_demonstrations')
      .upsert({ ...record, id: finalDemo?.id })
      .select()
      .single()

    if (error) {
      setNotice(error.message)
      return
    }

    setFinalDemo(data)
    setNotice('Final demonstration saved.')
  }

  async function handleSignOut() {
    if (demoMode) {
      localStorage.removeItem(STORAGE_KEY)
      setProfile(emptyProfile)
      setDailyLogs([])
      setWeeklyCheckpoints([])
      setFinalDemo(null)
      setNotice('Demo data cleared.')
      return
    }

    await supabase.auth.signOut()
  }

  if (loading) {
    return <main className="shell loading">Loading tracker...</main>
  }

  if (!session) {
    return <Auth />
  }

  const views = {
    dashboard: (
      <Dashboard
        profile={profile}
        readinessScore={readinessScore}
        dailyLogs={dailyLogs}
        weeklyCheckpoints={weeklyCheckpoints}
        finalDemo={finalDemo}
      />
    ),
    profile: (
      <ProfileSetup
        key={`${profile.id ?? 'profile'}-${profile.full_name}-${profile.start_date}`}
        profile={profile}
        onSave={handleProfileSave}
      />
    ),
    daily: <DailyLog logs={dailyLogs} onSave={handleDailyLogSave} />,
    weekly: (
      <WeeklyCheckpoint
        checkpoints={weeklyCheckpoints}
        onSave={handleWeeklyCheckpointSave}
      />
    ),
    final: (
      <FinalDemonstration
        key={finalDemo?.id ?? 'new-final-demo'}
        demonstration={finalDemo ?? emptyFinalDemo}
        onSave={handleFinalDemoSave}
      />
    ),
  }

  return (
    <main className="shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Internal onboarding</p>
          <h1>Creative System Tracker</h1>
        </div>
        <div className="account-panel">
          <span>{user.email}</span>
          <button type="button" className="ghost-button" onClick={handleSignOut}>
            {demoMode ? 'Clear demo' : 'Sign out'}
          </button>
        </div>
      </header>

      {demoMode && (
        <div className="notice">
          Add Supabase environment variables to switch from local demo storage to the
          live database.
        </div>
      )}
      {notice && <div className="notice success">{notice}</div>}

      <nav className="tabs" aria-label="Tracker sections">
        {[
          ['dashboard', 'Dashboard'],
          ['profile', 'Profile'],
          ['daily', 'Daily Log'],
          ['weekly', 'Weekly Checkpoint'],
          ['final', 'Final Demonstration'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeView === key ? 'active' : ''}
            onClick={() => setActiveView(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="workspace">{views[activeView]}</section>
    </main>
  )
}

export default App
