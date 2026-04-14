import { useEffect, useState } from 'react'
import type { SearchHistoryItem } from '../../models/Weather'

const STORAGE_KEY = 'weather-search-history'

function loadHistory(): SearchHistoryItem[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as SearchHistoryItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function History() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }

  return (
    <section className="page-card">
      <h2 className="section-title">Search History</h2>
      <div className="content-box">
        {history.length === 0 ? (
          <p className="status-message">No search history found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date and time</th>
                  <th>City</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.when}</td>
                    <td>{item.cityHe || item.cityEn}</td>
                    <td>{item.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {history.length > 0 && (
          <button type="button" className="secondary-button" onClick={clearHistory}>
            Clear history
          </button>
        )}
      </div>
    </section>
  )
}
