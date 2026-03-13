import { useState, useEffect, useRef } from 'react'
import { api } from '../api/genomes'
import '../styles/home.css'

export default function Home({ onNavigate }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const wrapperRef = useRef(null)

  useEffect(() => {
    api.home().then(setData).catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    api.autocomplete(query).then(setSuggestions)
  }, [query])

  useEffect(() => {
    const handler = (e) => { if (!wrapperRef.current?.contains(e.target)) setSuggestions([]) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  if (error) return <pre style={{ color: 'red', padding: '2rem' }}>{error}</pre>
  if (!data)  return <p style={{ padding: '2rem', color: '#64748b' }}>Loading...</p>

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero */}
      <header className="hero">
        <div className="hero-container">
          <h1>GenomeWebPlatform</h1>
          <p className="lead">Advanced exploration of genomic architectures and large-scale viral sequencing analytics.</p>
          <div className="search-wrapper" ref={wrapperRef}>
            <div className="search-container">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for virus or strain..."
                autoComplete="off"
              />
              <button
                className="btn-search"
                onClick={() => query && onNavigate('list', null, query)}
              >
                Search
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="suggestions-box">
                {suggestions.map(s => (
                  <div
                    key={s.id}
                    className="suggestion-item"
                    onClick={() => { setQuery(s.species); setSuggestions([]); onNavigate('list', null, s.species) }}
                  >
                    {s.species}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>

        {/* Stats */}
        <div className="stats-grid" style={{ marginTop: '-50px' }}>
          <div className="stat-card">
            <h3>{data.total_species.toLocaleString()}</h3>
            <p>Taxonomies</p>
          </div>
          <div className="stat-card">
            <h3>{data.total_sequences.toLocaleString()}</h3>
            <p>Active Sequences</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="quick-actions">
          <button className="btn-outline" onClick={() => onNavigate('list')}>Explore Repository</button>
          <button className="btn-outline success" onClick={api.downloadGlobalFasta}>Export FASTA</button>
        </div>

        {/* Top species */}
        <h2 className="section-title">Most Sequenced Species</h2>
        <div className="species-grid">
          {data.top_species.map(s => (
            <div key={s.id} className="species-card" onClick={() => onNavigate('detail', s.id)}>
              <em className="species-card-name">{s.species}</em>
              <small>{s.sequence_count.toLocaleString()} documented samples</small>
            </div>
          ))}
        </div>

        {/* Data sources */}
        <h2 className="section-title">Data Sources</h2>
        <div className="sources-grid">
          {[
            { name: 'NCBI', desc: 'National Center for Biotechnology Information', url: 'https://www.ncbi.nlm.nih.gov' },
            { name: 'BV-BRC', desc: 'Bacterial and Viral Bioinformatics Resource Center', url: 'https://www.bv-brc.org' },
            { name: 'CNCB', desc: 'China National Center for Bioinformation', url: 'https://ngdc.cncb.ac.cn' },
          ].map(src => (
            <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer" className="source-card">
              <h4>{src.name}</h4>
              <p>{src.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
