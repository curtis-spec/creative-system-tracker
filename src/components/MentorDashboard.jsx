import { videoBibleSections } from '../data/videoBible'

function MentorDashboard({ profile, trackerData, teamRecords }) {
  const latestBySection = trackerData.quizAttempts.reduce((lookup, attempt) => {
    const current = lookup[attempt.section_id]
    if (!current || attempt.completed_at > current.completed_at) {
      lookup[attempt.section_id] = attempt
    }
    return lookup
  }, {})

  const completedLessons = videoBibleSections.filter(
    (section) => latestBySection[section.id]?.passed,
  ).length

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">Mentor view</p>
        <h2>Completion and understanding at a glance</h2>
      </div>
      <section className="metric-row mentor-metrics">
        <article>
          <strong>{trackerData.readinessScore}</strong>
          <span>Readiness score</span>
        </article>
        <article>
          <strong>{completedLessons}/{videoBibleSections.length}</strong>
          <span>Video Bible lessons passed</span>
        </article>
        <article>
          <strong>{trackerData.calendarEvents.length}</strong>
          <span>Scheduled onboarding events</span>
        </article>
      </section>
      <div className="dashboard-grid">
        <section className="detail-list">
          <h2>Current Intern</h2>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{profile.full_name || 'Not set'}</dd>
            </div>
            <div>
              <dt>Mentor</dt>
              <dd>{profile.mentor_name || 'Not set'}</dd>
            </div>
            <div>
              <dt>Daily logs</dt>
              <dd>{trackerData.dailyLogs.length}</dd>
            </div>
            <div>
              <dt>Weekly checkpoints</dt>
              <dd>{trackerData.weeklyCheckpoints.length}</dd>
            </div>
            <div>
              <dt>Final demo</dt>
              <dd>{trackerData.finalDemo?.status?.replace('_', ' ') || 'Not started'}</dd>
            </div>
          </dl>
        </section>
        <section className="recent-list">
          <h2>Video Bible Progress</h2>
          <ul>
            {videoBibleSections.map((section) => {
              const attempt = latestBySection[section.id]
              return (
                <li key={section.id}>
                  <span>{attempt?.completed_at || 'Not completed'}</span>
                  <strong>{section.title}</strong>
                  <p>
                    {attempt
                      ? `${attempt.score}/${attempt.total_questions} ${attempt.passed ? 'passed' : 'needs review'}`
                      : 'No test attempt yet'}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      <section className="recent-list">
        <h2>Team Records Available To This Login</h2>
        {teamRecords.length === 0 ? (
          <p className="muted">
            Admin or mentor Supabase policies can return team records here. In demo
            mode, this shows the current local intern only.
          </p>
        ) : (
          <ul>
            {teamRecords.map((record) => (
              <li key={record.id}>
                <span>{record.email || record.role || 'Team member'}</span>
                <strong>{record.full_name || 'Unnamed profile'}</strong>
                <p>{record.development_focus || record.growth_goal || 'No focus set'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

export default MentorDashboard
