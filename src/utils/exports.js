export function downloadTextFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function toCsv(rows) {
  if (!rows.length) return ''

  const headers = Object.keys(rows[0])
  const escapeCell = (value) => {
    const text = value == null ? '' : String(value)
    return `"${text.replaceAll('"', '""')}"`
  }

  return [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ].join('\n')
}

export function flattenTrackerData(data) {
  const rows = []

  data.dailyLogs.forEach((log) => {
    rows.push({
      type: 'Daily Log',
      date: log.log_date,
      title: log.system_area,
      status: '',
      evidence: log.did || log.learned,
    })
  })

  data.weeklyCheckpoints.forEach((checkpoint) => {
    rows.push({
      type: 'Weekly Checkpoint',
      date: checkpoint.week_ending,
      title: checkpoint.system_part,
      status: '',
      evidence: checkpoint.evidence || checkpoint.practiced,
    })
  })

  data.calendarEvents.forEach((event) => {
    rows.push({
      type: 'Calendar Event',
      date: event.event_date,
      title: event.title,
      status: event.status,
      evidence: event.description,
    })
  })

  data.quizAttempts.forEach((attempt) => {
    rows.push({
      type: 'Video Bible Quiz',
      date: attempt.completed_at,
      title: attempt.section_title,
      status: `${attempt.score}/${attempt.total_questions}`,
      evidence: attempt.passed ? 'Passed' : 'Needs review',
    })
  })

  if (data.finalDemo) {
    rows.push({
      type: 'Final Demonstration',
      date: data.finalDemo.due_date,
      title: data.finalDemo.assignment,
      status: data.finalDemo.status,
      evidence: data.finalDemo.learning_reflection,
    })
  }

  return rows
}

export function buildReportHtml(data) {
  const rows = flattenTrackerData(data)
  const quizAverage = data.quizAttempts.length
    ? Math.round(
        data.quizAttempts.reduce(
          (total, attempt) => total + attempt.score / attempt.total_questions,
          0,
        ) /
          data.quizAttempts.length *
          100,
      )
    : 0

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Creative System Tracker Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #10243b; margin: 40px; }
    h1 { font-size: 34px; margin-bottom: 4px; }
    h2 { margin-top: 28px; }
    table { border-collapse: collapse; width: 100%; margin-top: 12px; }
    th, td { border: 1px solid #c7dbe3; padding: 10px; text-align: left; vertical-align: top; }
    th { background: #e7f8fd; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
    .metric { border: 1px solid #c7dbe3; padding: 14px; border-radius: 10px; }
    .metric strong { display: block; font-size: 26px; }
  </style>
</head>
<body>
  <h1>Creative System Tracker Report</h1>
  <p>${data.profile.full_name || 'Intern'} | Mentor: ${data.profile.mentor_name || 'Not set'}</p>
  <section class="metrics">
    <div class="metric"><strong>${data.readinessScore}</strong>Readiness</div>
    <div class="metric"><strong>${data.dailyLogs.length}</strong>Daily logs</div>
    <div class="metric"><strong>${data.weeklyCheckpoints.length}</strong>Checkpoints</div>
    <div class="metric"><strong>${quizAverage}%</strong>Quiz average</div>
  </section>
  <h2>Saved Work</h2>
  <table>
    <thead><tr><th>Type</th><th>Date</th><th>Title</th><th>Status</th><th>Evidence</th></tr></thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr><td>${row.type}</td><td>${row.date || ''}</td><td>${row.title || ''}</td><td>${row.status || ''}</td><td>${row.evidence || ''}</td></tr>`,
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`
}

export function buildSlideDeckHtml(data) {
  const rows = flattenTrackerData(data).slice(0, 8)

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Creative System Tracker Slide Deck</title>
  <style>
    body { margin: 0; background: #071d2a; color: white; font-family: Arial, sans-serif; }
    section { min-height: 100vh; box-sizing: border-box; padding: 72px; display: grid; align-content: center; page-break-after: always; }
    h1 { font-size: 68px; margin: 0 0 18px; }
    h2 { font-size: 46px; margin: 0 0 24px; }
    p, li { font-size: 26px; line-height: 1.35; color: #d9f8ff; }
    .score { font-size: 150px; font-weight: 900; color: #7ce7ff; }
  </style>
</head>
<body>
  <section>
    <h1>Creative System Tracker</h1>
    <p>${data.profile.full_name || 'Intern Progress'} | ${new Date().toLocaleDateString()}</p>
  </section>
  <section>
    <h2>Readiness Score</h2>
    <div class="score">${data.readinessScore}</div>
  </section>
  <section>
    <h2>Completion Summary</h2>
    <p>Daily logs: ${data.dailyLogs.length}</p>
    <p>Weekly checkpoints: ${data.weeklyCheckpoints.length}</p>
    <p>Calendar events: ${data.calendarEvents.length}</p>
    <p>Video Bible quiz attempts: ${data.quizAttempts.length}</p>
  </section>
  <section>
    <h2>Evidence Highlights</h2>
    <ul>${rows.map((row) => `<li>${row.type}: ${row.title || row.evidence || 'Saved item'}</li>`).join('')}</ul>
  </section>
</body>
</html>`
}

export function printHtml(html) {
  const printWindow = window.open('', '_blank', 'width=1100,height=800')
  if (!printWindow) return

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
