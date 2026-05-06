import { flattenTrackerData } from '../utils/exports'

function Archive({ trackerData }) {
  const rows = flattenTrackerData(trackerData)

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">Saved archive</p>
        <h2>Everything saved in the app</h2>
      </div>
      <div className="archive-toolbar">
        <span>{rows.length} saved items</span>
        <button type="button" onClick={() => window.print()}>
          Print current view
        </button>
      </div>
      <div className="archive-grid">
        {rows.length === 0 ? (
          <p className="muted">Nothing has been saved yet.</p>
        ) : (
          rows.map((row, index) => (
            <article key={`${row.type}-${row.date}-${index}`}>
              <span>{row.type}</span>
              <h3>{row.title || row.status || 'Saved item'}</h3>
              <p>{row.evidence || 'No detail entered.'}</p>
              <small>{row.date || 'No date'}</small>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default Archive
