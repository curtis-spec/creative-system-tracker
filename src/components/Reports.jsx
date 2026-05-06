import {
  buildReportHtml,
  buildSlideDeckHtml,
  downloadTextFile,
  flattenTrackerData,
  printHtml,
  toCsv,
} from '../utils/exports'

function Reports({ trackerData }) {
  const reportHtml = buildReportHtml(trackerData)
  const slideDeckHtml = buildSlideDeckHtml(trackerData)
  const rows = flattenTrackerData(trackerData)

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">Reports and slide decks</p>
        <h2>Print, export, or present saved progress</h2>
      </div>
      <div className="action-grid">
        <article>
          <h3>Progress Report</h3>
          <p>Printable HTML report with profile, readiness, evidence, and completion.</p>
          <div className="button-row">
            <button type="button" onClick={() => printHtml(reportHtml)}>
              Print report
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                downloadTextFile('creative-system-report.html', reportHtml, 'text/html')
              }
            >
              Export HTML
            </button>
          </div>
        </article>
        <article>
          <h3>Slide Deck</h3>
          <p>Presentation-style deck that can be printed to PDF or opened in browser.</p>
          <div className="button-row">
            <button type="button" onClick={() => printHtml(slideDeckHtml)}>
              Print slides
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                downloadTextFile(
                  'creative-system-slide-deck.html',
                  slideDeckHtml,
                  'text/html',
                )
              }
            >
              Export deck
            </button>
          </div>
        </article>
        <article>
          <h3>Data Files</h3>
          <p>Export saved tracker data for spreadsheets, audits, or backup.</p>
          <div className="button-row">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'creative-system-tracker.json',
                  JSON.stringify(trackerData, null, 2),
                  'application/json',
                )
              }
            >
              Export JSON
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                downloadTextFile(
                  'creative-system-tracker.csv',
                  toCsv(rows),
                  'text/csv',
                )
              }
            >
              Export CSV
            </button>
          </div>
        </article>
      </div>
      <section className="recent-list report-preview">
        <h2>Report Preview</h2>
        {rows.length === 0 ? (
          <p className="muted">Saved items will appear here before export.</p>
        ) : (
          <ul>
            {rows.slice(0, 10).map((row, index) => (
              <li key={`${row.type}-${row.date}-${index}`}>
                <span>{row.type} | {row.date || 'No date'}</span>
                <strong>{row.title || row.status || 'Saved item'}</strong>
                <p>{row.evidence}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

export default Reports
