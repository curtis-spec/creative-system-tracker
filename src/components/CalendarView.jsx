import { useMemo, useState } from 'react'

const initialForm = {
  title: '',
  event_date: new Date().toISOString().slice(0, 10),
  start_time: '09:00',
  end_time: '10:00',
  location: '',
  description: '',
  event_type: 'checkpoint',
  recurrence: 'none',
  reminder_minutes: '30',
  attendees: '',
  status: 'scheduled',
}

function CalendarView({ events, onSave, onDelete }) {
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(initialForm.event_date)

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          `${a.event_date} ${a.start_time}`.localeCompare(
            `${b.event_date} ${b.start_time}`,
          ),
      ),
    [events],
  )

  const selectedEvents = sortedEvents.filter(
    (event) => event.event_date === selectedDate,
  )

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setEditingId(null)
    setForm(initialForm)
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave({ ...form, id: editingId })
    setSelectedDate(form.event_date)
    resetForm()
  }

  function editEvent(event) {
    setEditingId(event.id)
    setForm({
      ...initialForm,
      ...event,
      reminder_minutes: event.reminder_minutes?.toString() ?? '30',
    })
  }

  return (
    <section className="split-layout calendar-layout">
      <div>
        <div className="section-heading">
          <p className="eyebrow">Calendar</p>
          <h2>Plan onboarding, reviews, reminders, and demonstrations</h2>
        </div>
        <form className="form-grid two-column" onSubmit={handleSubmit}>
          <label className="span-all">
            Event title
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Weekly checkpoint review"
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.event_date}
              onChange={(event) => updateField('event_date', event.target.value)}
              required
            />
          </label>
          <label>
            Event type
            <select
              value={form.event_type}
              onChange={(event) => updateField('event_type', event.target.value)}
            >
              <option value="learning">Learning block</option>
              <option value="checkpoint">Checkpoint</option>
              <option value="demo">Final demo</option>
              <option value="mentor">Mentor review</option>
              <option value="reminder">Reminder</option>
            </select>
          </label>
          <label>
            Start time
            <input
              type="time"
              value={form.start_time}
              onChange={(event) => updateField('start_time', event.target.value)}
            />
          </label>
          <label>
            End time
            <input
              type="time"
              value={form.end_time}
              onChange={(event) => updateField('end_time', event.target.value)}
            />
          </label>
          <label>
            Repeat
            <select
              value={form.recurrence}
              onChange={(event) => updateField('recurrence', event.target.value)}
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label>
            Reminder
            <select
              value={form.reminder_minutes}
              onChange={(event) =>
                updateField('reminder_minutes', event.target.value)
              }
            >
              <option value="0">At time of event</option>
              <option value="10">10 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="1440">1 day before</option>
              <option value="10080">1 week before</option>
            </select>
          </label>
          <label>
            Location or link
            <input
              value={form.location}
              onChange={(event) => updateField('location', event.target.value)}
              placeholder="Studio, Zoom, Google Meet"
            />
          </label>
          <label>
            Guests
            <input
              value={form.attendees}
              onChange={(event) => updateField('attendees', event.target.value)}
              placeholder="mentor@example.com, intern@example.com"
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
            >
              <option value="scheduled">Scheduled</option>
              <option value="complete">Complete</option>
              <option value="needs_reschedule">Needs reschedule</option>
              <option value="canceled">Canceled</option>
            </select>
          </label>
          <label className="span-all">
            Notes
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Agenda, preparation, outcome, or follow-up"
            />
          </label>
          <div className="button-row span-all">
            <button type="submit">{editingId ? 'Update event' : 'Add event'}</button>
            {editingId && (
              <button type="button" className="ghost-button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <aside className="history-panel calendar-panel">
        <h2>Schedule</h2>
        <label>
          View date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
        <div className="mini-calendar">
          {sortedEvents.slice(0, 12).map((event) => (
            <button
              key={event.id}
              type="button"
              className={event.event_date === selectedDate ? 'active' : ''}
              onClick={() => setSelectedDate(event.event_date)}
            >
              <strong>{event.event_date}</strong>
              <span>{event.title}</span>
            </button>
          ))}
        </div>
        <h2>Selected Day</h2>
        {selectedEvents.length === 0 ? (
          <p className="muted">No events scheduled for this date.</p>
        ) : (
          <ul>
            {selectedEvents.map((event) => (
              <li key={event.id}>
                <span>
                  {event.start_time} - {event.end_time} | {event.status}
                </span>
                <strong>{event.title}</strong>
                <p>{event.description || event.location}</p>
                <div className="button-row compact">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => editEvent(event)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ghost-button danger"
                    onClick={() => onDelete(event.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  )
}

export default CalendarView
