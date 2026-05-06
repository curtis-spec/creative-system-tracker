import { useMemo, useState } from 'react'
import { howWeOperateSections } from '../data/howWeOperate'

function HowWeOperate({ attempts, onSubmit }) {
  const [activeId, setActiveId] = useState(howWeOperateSections[0].id)
  const [answers, setAnswers] = useState({})

  const activeSection = howWeOperateSections.find((section) => section.id === activeId)
  const latestAttempts = useMemo(() => {
    return attempts.reduce((lookup, attempt) => {
      const current = lookup[attempt.section_id]
      if (!current || attempt.completed_at > current.completed_at) {
        lookup[attempt.section_id] = attempt
      }
      return lookup
    }, {})
  }, [attempts])

  function selectSection(sectionId) {
    setActiveId(sectionId)
    setAnswers({})
  }

  function handleSubmit(event) {
    event.preventDefault()

    const score = activeSection.questions.reduce((total, question, index) => {
      return total + (Number(answers[index]) === question.answer ? 1 : 0)
    }, 0)

    onSubmit({
      section_id: activeSection.id,
      section_title: activeSection.title,
      score,
      total_questions: activeSection.questions.length,
      passed: score >= 4,
      answers,
      completed_at: new Date().toISOString(),
    })
  }

  return (
    <section className="library-layout">
      <aside className="history-panel">
        <h2>How We Operate</h2>
        <ul>
          {howWeOperateSections.map((section) => {
            const attempt = latestAttempts[section.id]
            return (
              <li key={section.id}>
                <button
                  type="button"
                  className={`text-button ${activeId === section.id ? 'active' : ''}`}
                  onClick={() => selectSection(section.id)}
                >
                  <strong>{section.title}</strong>
                  <span>
                    {attempt
                      ? `${attempt.score}/${attempt.total_questions} ${attempt.passed ? 'Passed' : 'Review'}`
                      : section.duration}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <div className="lesson-panel">
        <div className="section-heading">
          <p className="eyebrow">Operating documentation</p>
          <h2>{activeSection.title}</h2>
        </div>
        <p className="lesson-summary">{activeSection.summary}</p>
        <div className="reading-panel">
          {activeSection.reading.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <form className="quiz-form" onSubmit={handleSubmit}>
          <h2>Knowledge Check</h2>
          {activeSection.questions.map((question, questionIndex) => (
            <fieldset key={question.prompt}>
              <legend>{question.prompt}</legend>
              {question.options.map((option, optionIndex) => (
                <label key={option} className="choice-row">
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={optionIndex}
                    checked={answers[questionIndex] === String(optionIndex)}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [questionIndex]: event.target.value,
                      }))
                    }
                    required
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
          <button type="submit">Submit 5-question test</button>
        </form>
      </div>
    </section>
  )
}

export default HowWeOperate
