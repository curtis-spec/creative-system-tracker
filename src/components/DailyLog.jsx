import { useState } from 'react'

const initialForm = {
  log_date: new Date().toISOString().slice(0, 10),
  system_area: '',
  learned: '',
  did: '',
  next_action: '',
  blockers: '',
}

function DailyLog({ logs, onSave }) {
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
          <p className="eyebrow">Daily learning log</p>
          <h2>Capture practice while it is fresh</h2>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Date
            <input
              type="date"
              value={form.log_date}
              onChange={(event) => updateField('log_date', event.target.value)}
              required
            />
          </label>
          <label>
            System area practiced
            <select
              value={form.system_area}
              onChange={(event) => updateField('system_area', event.target.value)}
              required
            >
              <option value="">Choose area</option>
              <option>Creative workflow</option>
              <option>Ownership clarity</option>
              <option>Stakeholder communication</option>
              <option>Feedback loop</option>
              <option>Delivery standards</option>
            </select>
          </label>
          <label>
            What did I learn?
            <textarea
              value={form.learned}
              onChange={(event) => updateField('learned', event.target.value)}
              required
            />
          </label>
          <label>
            What did I do?
            <textarea
              value={form.did}
              onChange={(event) => updateField('did', event.target.value)}
              required
            />
          </label>
          <label>
            What is my next action?
            <textarea
              value={form.next_action}
              onChange={(event) => updateField('next_action', event.target.value)}
              required
            />
          </label>
          <label>
            Questions or blockers
            <textarea
              value={form.blockers}
              onChange={(event) => updateField('blockers', event.target.value)}
            />
          </label>
          <button type="submit">Add daily log</button>
        </form>
      </div>
      <LogList logs={logs} />
    </section>
  )
}

function LogList({ logs }) {
  return (
    <aside className="history-panel">
      <h2>Completed Logs</h2>
      {logs.length === 0 ? (
        <p className="muted">Daily learning logs will appear here.</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              <span>{log.log_date}</span>
              <strong>{log.system_area}</strong>
              <p>{log.next_action}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default DailyLog
