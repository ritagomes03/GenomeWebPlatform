import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../api/genomes'
import Pagination from '../components/Pagination'
import '../styles/species-list.css'

const DownloadIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
)

export default function SpeciesList({ onNavigate, initialQuery = '' }) {
  const [data, setData] = useState(null)
  const [query, setQuery] = useState(initialQuery)
  const [inputVal, setInputVal] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState([])
  const [sort, setSort] = useState('frequency')
  const [page, setPage] = useState(1)
  const wrapperRef = useRef(null)

  const load = useCallback(() => {
    api.speciesList({ q: query, sort, page }).then(setData)
  }, [query, sort, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (inputVal.length < 2) { setSuggestions([]); return }
    api.autocomplete(inputVal).then(setSuggestions)
  }, [inputVal])

  useEffect(() => {
    const handler = (e) => { if (!wrapperRef.current?.contains(e.target)) setSuggestions([]) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  function submitSearch(val) {
    setQuery(val)
    setInputVal(val)
    setSuggestions([])
    setPage(1)
  }

  return (
    <div className="list-container">
      <div className="back-nav">
        <button onClick={() => onNavigate('home')}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </button>
      </div>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
        Species Database
      </h1>

      {data && (
        <div className="stats-badge" style={{ marginBottom: 24 }}>
          <span>Total Species <strong>{data.total_species.toLocaleString()}</strong></span>
          <span>Total Sequences <strong>{data.total_sequences.toLocaleString()}</strong></span>
        </div>
      )}

      <div className="controls-wrapper">
        <div className="sorting-controls">
          <span>Sort by</span>
          {[['frequency', 'Most Frequent'], ['az', 'A–Z']].map(([val, label]) => (
            <button key={val} className={`sort-btn ${sort === val ? 'active' : ''}`}
              onClick={() => { setSort(val); setPage(1) }}>
              {label}
            </button>
          ))}
        </div>
        <div className="right-controls">
          <button className="btn btn-primary-solid" onClick={api.downloadGlobalMetadata}>
            <DownloadIcon /> CSV
          </button>
          <button className="btn btn-success" onClick={api.downloadGlobalFasta}>
            <DownloadIcon /> FASTA
          </button>
          <div className="search-form" ref={wrapperRef} style={{ position: 'relative' }}>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitSearch(inputVal)}
              placeholder="Search species..."
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map(s => (
                  <div key={s.id} className="suggestion-item" onClick={() => submitSearch(s.species)}>
                    {s.species}
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-primary-solid" onClick={() => submitSearch(inputVal)}>Search</button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Species</th><th>Family</th><th>Genus</th><th>Sequences</th></tr>
          </thead>
          <tbody>
            {data?.results.length === 0 ? (
              <tr><td colSpan="4" className="empty-state">No species found.</td></tr>
            ) : data?.results.map(s => (
              <tr key={s.id}>
                <td><button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#1e293b', padding: 0 }} onClick={() => onNavigate('detail', s.id)}><em>{s.species}</em></button></td>
                <td>{s.family || '-'}</td>
                <td>{s.genus || '-'}</td>
                <td style={{ fontWeight: 500 }}>{s.sequence_count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={data?.total_pages ?? 1} onPage={setPage} />
    </div>
  )
}
