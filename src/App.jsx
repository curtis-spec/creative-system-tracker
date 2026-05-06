import { useEffect, useMemo, useState } from 'react'
import './styles/app.css'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import Archive from './components/Archive'
import Auth from './components/Auth'
import CalendarView from './components/CalendarView'
import Dashboard from './components/Dashboard'
import DailyLog from './components/DailyLog'
import FinalDemonstration from './components/FinalDemonstration'
import MentorDashboard from './components/MentorDashboard'
import ProfileSetup from './components/ProfileSetup'
import Reports from './components/Reports'
import VideoBible from './components/VideoBible'
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
      calendarEvents: [],
      quizAttempts: [],
      teamRecords: [],
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
      calendarEvents: [],
      quizAttempts: [],
      teamRecords: [],
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
  const [calendarEvents, setCalendarEvents] = useState(
    demoState?.calendarEvents ?? [],
  )
  const [quizAttempts, setQuizAttempts] = useState(demoState?.quizAttempts ?? [])
  const [teamRecords, setTeamRecords] = useState(demoState?.teamRecords ?? [])
  const [notice, setNotice] = useState('')

  const user = session?.user ?? demoUser

  const readinessScore = useMemo(
    () => calculateReadiness({ dailyLogs, weeklyCheckpoints, finalDemo }),
    [dailyLogs, weeklyCheckpoints, finalDemo],
  )

  const trackerData = useMemo(
    () => ({
      profile,
      dailyLogs,
      weeklyCheckpoints,
      finalDemo,
      calendarEvents,
      quizAttempts,
      readinessScore,
    }),
    [
      calendarEvents,
      dailyLogs,
      finalDemo,
      profile,
      quizAttempts,
      readinessScore,
      weeklyCheckpoints,
    ],
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
      JSON.stringify({
        profile,
        dailyLogs,
        weeklyCheckpoints,
        finalDemo,
        calendarEvents,
        quizAttempts,
        teamRecords,
      }),
    )
  }, [
    calendarEvents,
    dailyLogs,
    demoMode,
    finalDemo,
    profile,
    quizAttempts,
    teamRecords,
    weeklyCheckpoints,
  ])

  useEffect(() => {
    if (demoMode || !user?.id) return

    async function loadTracker() {
      setLoading(true)

      const [
        profileResult,
        logsResult,
        checkpointsResult,
        finalDemoResult,
        eventsResult,
        quizResult,
        teamResult,
      ] = await Promise.all([
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
          supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', user.id)
            .order('event_date', { ascending: true }),
          supabase
            .from('video_quiz_attempts')
            .select('*')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', {
            ascending: false,
          }),
        ])

      if (profileResult.data) setProfile({ ...emptyProfile, ...profileResult.data })
      if (logsResult.data) setDailyLogs(logsResult.data)
      if (checkpointsResult.data) setWeeklyCheckpoints(checkpointsResult.data)
      if (finalDemoResult.data) setFinalDemo(finalDemoResult.data)
      if (eventsResult.data) setCalendarEvents(eventsResult.data)
      if (quizResult.data) setQuizAttempts(quizResult.data)
      if (teamResult.data) setTeamRecords(teamResult.data)

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

  async function handleCalendarEventSave(form) {
    const record = {
      ...form,
      user_id: user.id,
      reminder_minutes:
        form.reminder_minutes === '' ? null : Number(form.reminder_minutes),
      updated_at: new Date().toISOString(),
    }

    if (demoMode) {
      setCalendarEvents((current) => {
        if (record.id) {
          return current.map((event) =>
            event.id === record.id ? { ...event, ...record } : event,
          )
        }

        return [
          {
            ...record,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          },
          ...current,
        ]
      })
      setNotice(record.id ? 'Calendar event updated.' : 'Calendar event added.')
      return
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .upsert(record)
      .select()
      .single()

    if (error) {
      setNotice(error.message)
      return
    }

    setCalendarEvents((current) => {
      const exists = current.some((event) => event.id === data.id)
      return exists
        ? current.map((event) => (event.id === data.id ? data : event))
        : [data, ...current]
    })
    setNotice(record.id ? 'Calendar event updated.' : 'Calendar event added.')
  }

  async function handleCalendarEventDelete(eventId) {
    if (demoMode) {
      setCalendarEvents((current) => current.filter((event) => event.id !== eventId))
      setNotice('Calendar event deleted.')
      return
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)

    if (error) {
      setNotice(error.message)
      return
    }

    setCalendarEvents((current) => current.filter((event) => event.id !== eventId))
    setNotice('Calendar event deleted.')
  }

  async function handleQuizSubmit(attempt) {
    const record = {
      ...attempt,
      user_id: user.id,
    }

    if (demoMode) {
      setQuizAttempts((current) => [
        { ...record, id: crypto.randomUUID(), created_at: new Date().toISOString() },
        ...current,
      ])
      setNotice(
        `Knowledge check saved: ${record.score}/${record.total_questions}.`,
      )
      return
    }

    const { data, error } = await supabase
      .from('video_quiz_attempts')
      .insert(record)
      .select()
      .single()

    if (error) {
      setNotice(error.message)
      return
    }

    setQuizAttempts((current) => [data, ...current])
    setNotice(`Knowledge check saved: ${data.score}/${data.total_questions}.`)
  }

  async function handleSignOut() {
    if (demoMode) {
      localStorage.removeItem(STORAGE_KEY)
      setProfile(emptyProfile)
      setDailyLogs([])
      setWeeklyCheckpoints([])
      setFinalDemo(null)
      setCalendarEvents([])
      setQuizAttempts([])
      setTeamRecords([])
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
        calendarEvents={calendarEvents}
        quizAttempts={quizAttempts}
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
    calendar: (
      <CalendarView
        events={calendarEvents}
        onSave={handleCalendarEventSave}
        onDelete={handleCalendarEventDelete}
      />
    ),
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
    bible: <VideoBible attempts={quizAttempts} onSubmit={handleQuizSubmit} />,
    archive: <Archive trackerData={trackerData} />,
    reports: <Reports trackerData={trackerData} />,
    mentor: (
      <MentorDashboard
        profile={profile}
        trackerData={trackerData}
        teamRecords={teamRecords}
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
          ['calendar', 'Calendar'],
          ['weekly', 'Weekly Checkpoint'],
          ['final', 'Final Demonstration'],
          ['bible', 'Video Bible'],
          ['archive', 'Archive'],
          ['reports', 'Reports'],
          ['mentor', 'Mentor View'],
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
