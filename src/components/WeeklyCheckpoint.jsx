import { useState } from 'react'

const initialForm = {
  week_ending: '',
  system_part: '',
  practiced: '',
  evidence: '',
  confusion: '',
  next_week: '',
}

function WeeklyCheckpoint({ checkpoints, onSave }) {
  const [form, setForm] = useState(initialForm)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(form)
    setForm(initialForm)
  }

  return (
    <section className="split-layout">
      <div>
        <div className="section-heading">
          <p className="eyebrow">Weekly checkpoint</p>
          <h2>Turn practice into evidence</h2>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Week ending
            <input
              type="date"
              value={form.week_ending}
              onChange={(event) => updateField('week_ending', event.target.value)}
              required
            />
          </label>
          <label>
            System part practiced
            <input
              value={form.system_part}
              onChange={(event) => updateField('system_part', event.target.value)}
              placeholder="RACI, intake, feedback, handoff"
              required
            />
          </label>
          <label>
            What did I practice this week?
            <textarea
              value={form.practiced}
              onChange={(event) => updateField('practiced', event.target.value)}
              required
            />
          </label>
          <label>
            What evidence shows I practiced it?
            <textarea
              value={form.evidence}
              onChange={(event) => updateField('evidence', event.target.value)}
              required
            />
          </label>
          <label>
            Where did I get confused?
            <textarea
              value={form.confusion}
              onChange={(event) => updateField('confusion', event.target.value)}
            />
          </label>
          <label>
            What will I practice next week?
            <textarea
              value={form.next_week}
              onChange={(event) => updateField('next_week', event.target.value)}
              required
            />
          </label>
          <button type="submit">Add checkpoint</button>
        </form>
      </div>
      <aside className="history-panel">
        <h2>Completed Checkpoints</h2>
        {checkpoints.length === 0 ? (
          <p className="muted">Weekly checkpoints will appear here.</p>
        ) : (
          <ul>
            {checkpoints.map((checkpoint) => (
              <li key={checkpoint.id}>
                <span>{checkpoint.week_ending}</span>
                <strong>{checkpoint.system_part}</strong>
                <p>{checkpoint.next_week}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  )
}

export default WeeklyCheckpoint
