function Dashboard({
  profile,
  readinessScore,
  dailyLogs,
  weeklyCheckpoints,
  finalDemo,
}) {
  const finalStatus = finalDemo?.status?.replace('_', ' ') ?? 'not started'

  return (
    <div className="dashboard-grid">
      <section className="summary-panel">
        <div>
          <p className="eyebrow">Readiness score</p>
          <div className="score">{readinessScore}</div>
        </div>
        <div className="progress-track" aria-label={`Readiness ${readinessScore}%`}>
          <span style={{ width: `${readinessScore}%` }} />
        </div>
      </section>

      <section className="detail-list">
        <h2>Intern Snapshot</h2>
        <dl>
          <div>
            <dt>Intern</dt>
            <dd>{profile.full_name || 'Not set'}</dd>
          </div>
          <div>
            <dt>Start date</dt>
            <dd>{profile.start_date || 'Not set'}</dd>
          </div>
          <div>
            <dt>Mentor</dt>
            <dd>{profile.mentor_name || 'Not set'}</dd>
          </div>
          <div>
            <dt>Development focus</dt>
            <dd>{profile.development_focus || 'Not set'}</dd>
          </div>
        </dl>
      </section>

      <section className="metric-row">
        <article>
          <strong>{dailyLogs.length}</strong>
          <span>Daily logs completed</span>
        </article>
        <article>
          <strong>{weeklyCheckpoints.length}</strong>
          <span>Weekly checkpoints completed</span>
        </article>
        <article>
          <strong>{finalStatus}</strong>
          <span>Final demonstration status</span>
        </article>
      </section>

      <section className="recent-list">
        <h2>Recent Evidence</h2>
        {[...dailyLogs.slice(0, 3), ...weeklyCheckpoints.slice(0, 2)].length ===
        0 ? (
          <p className="muted">No learning evidence recorded yet.</p>
        ) : (
          <ul>
            {dailyLogs.slice(0, 3).map((log) => (
              <li key={log.id}>
                <span>{log.log_date}</span>
                <strong>{log.system_area || 'Daily learning log'}</strong>
                <p>{log.did || log.learned}</p>
              </li>
            ))}
            {weeklyCheckpoints.slice(0, 2).map((checkpoint) => (
              <li key={checkpoint.id}>
                <span>{checkpoint.week_ending}</span>
                <strong>{checkpoint.system_part || 'Weekly checkpoint'}</strong>
                <p>{checkpoint.evidence || checkpoint.practiced}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Dashboard
