import { useState } from 'react'

function FinalDemonstration({ demonstration, onSave }) {
  const [form, setForm] = useState(demonstration)

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
        <p className="eyebrow">Final demonstration</p>
        <h2>Prove the system can move through real work</h2>
      </div>
      <form className="form-grid two-column" onSubmit={handleSubmit}>
        <label>
          Small assignment
          <input
            value={form.assignment ?? ''}
            onChange={(event) => updateField('assignment', event.target.value)}
            required
          />
        </label>
        <label>
          Audience or stakeholder
          <input
            value={form.audience ?? ''}
            onChange={(event) => updateField('audience', event.target.value)}
          />
        </label>
        <label>
          Due date
          <input
            type="date"
            value={form.due_date ?? ''}
            onChange={(event) => updateField('due_date', event.target.value)}
          />
        </label>
        <label>
          Status
          <select
            value={form.status ?? 'in_progress'}
            onChange={(event) => updateField('status', event.target.value)}
          >
            <option value="in_progress">In progress</option>
            <option value="ready_for_review">Ready for review</option>
            <option value="complete">Complete</option>
          </select>
        </label>
        <label className="span-all">
          Purpose
          <textarea
            value={form.purpose ?? ''}
            onChange={(event) => updateField('purpose', event.target.value)}
            required
          />
        </label>
        <label>
          Ownership clarity
          <textarea
            value={form.ownership_clarity ?? ''}
            onChange={(event) =>
              updateField('ownership_clarity', event.target.value)
            }
            required
          />
        </label>
        <label>
          Workflow movement
          <textarea
            value={form.workflow_movement ?? ''}
            onChange={(event) =>
              updateField('workflow_movement', event.target.value)
            }
            required
          />
        </label>
        <label>
          Feedback applied
          <textarea
            value={form.feedback_applied ?? ''}
            onChange={(event) => updateField('feedback_applied', event.target.value)}
          />
        </label>
        <label>
          Final reflection
          <textarea
            value={form.learning_reflection ?? ''}
            onChange={(event) =>
              updateField('learning_reflection', event.target.value)
            }
            required
          />
        </label>
        <fieldset className="rubric span-all">
          <legend>Mentor score</legend>
          {[
            ['score_execution', 'Execution'],
            ['score_communication', 'Communication'],
            ['score_system', 'System understanding'],
            ['score_growth', 'Growth'],
          ].map(([field, label]) => (
            <label key={field}>
              {label}
              <input
                type="number"
                min="0"
                max="5"
                value={form[field] ?? ''}
                onChange={(event) => updateField(field, event.target.value)}
              />
            </label>
          ))}
        </fieldset>
        <label className="span-all">
          Mentor notes
          <textarea
            value={form.mentor_notes ?? ''}
            onChange={(event) => updateField('mentor_notes', event.target.value)}
          />
        </label>
        <button type="submit">Save final demonstration</button>
      </form>
    </section>
  )
}

export default FinalDemonstration
