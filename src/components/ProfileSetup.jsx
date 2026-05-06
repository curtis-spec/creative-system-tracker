import { useState } from 'react'

function ProfileSetup({ profile, onSave }) {
  const [form, setForm] = useState(profile)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(form)
  }

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">Profile</p>
        <h2>Intern and mentor setup</h2>
      </div>
      <form className="form-grid two-column" onSubmit={handleSubmit}>
        <label>
          Intern name
          <input
            value={form.full_name ?? ''}
            onChange={(event) => updateField('full_name', event.target.value)}
            placeholder="Full name"
          />
        </label>
        <label>
          Start date
          <input
            type="date"
            value={form.start_date ?? ''}
            onChange={(event) => updateField('start_date', event.target.value)}
          />
        </label>
        <label>
          Mentor
          <input
            value={form.mentor_name ?? ''}
            onChange={(event) => updateField('mentor_name', event.target.value)}
            placeholder="Mentor name"
          />
        </label>
        <label>
          Development focus
          <input
            value={form.development_focus ?? ''}
            onChange={(event) =>
              updateField('development_focus', event.target.value)
            }
            placeholder="Creative operations, workflow, client communication"
          />
        </label>
        <label className="span-all">
          Growth goal
          <textarea
            value={form.growth_goal ?? ''}
            onChange={(event) => updateField('growth_goal', event.target.value)}
            placeholder="What should this intern be able to do by the end?"
          />
        </label>
        <button type="submit">Save profile</button>
      </form>
    </section>
  )
}

export default ProfileSetup
