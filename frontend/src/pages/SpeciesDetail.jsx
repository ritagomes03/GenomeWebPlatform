import { useState, useEffect } from 'react'
import { api } from '../api/genomes'
import SequenceModal from '../components/SequenceModal'
import Pagination from '../components/Pagination'
import '../styles/species-detail.css'

const DownloadIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
)

export default function SpeciesDetail({ id, onNavigate }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setData(null)
    api.speciesDetail(id, { year, page })
      .then(setData)
      .catch(e => setError(e.message))
  }, [id, year, page])

  if (error) return <pre style={{ color: 'red', padding: '2rem' }}>{error}</pre>
  if (!data)  return <p style={{ padding: '2rem', color: '#64748b' }}>Loading...</p>

  const { taxonomy, sequences, graphs_exist, available_years, total_pages } = data

  return (
    <div className="detail-container" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Back */}
      <div className="back-nav">
        <button onClick={() => onNavigate('list')}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Species List
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
          <em>{taxonomy.species}</em>
        </h1>
        <div className="taxonomy-badge">
          <span>Family <strong>{taxonomy.family || '-'}</strong></span>
          <span>Genus <strong>{taxonomy.genus || '-'}</strong></span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {[
          ['Length (bp)', `${taxonomy.min_length ?? '-'} – ${taxonomy.max_length ?? '-'}`],
          ['GC Content', `${taxonomy.min_gc?.toFixed(2) ?? '-'} – ${taxonomy.max_gc?.toFixed(2) ?? '-'}`],
          ['Melting Temp °C', `${taxonomy.min_mt?.toFixed(2) ?? '-'} – ${taxonomy.max_mt?.toFixed(2) ?? '-'}`],
          ['Entropy', `${taxonomy.min_ent?.toFixed(4) ?? '-'} – ${taxonomy.max_ent?.toFixed(4) ?? '-'}`],
        ].map(([label, val]) => (
          <div key={label} className="stat-card">
            <strong>{label}</strong>
            <span>{val}</span>
          </div>
        ))}
      </div>

      {/* Sequences header + download */}
      <div className="section-header">
        <h3>Individual Sequences <span style={{ color: '#64748b', fontWeight: 400, fontSize: '1rem' }}>({taxonomy.sequence_count?.toLocaleString()})</span></h3>
        <button className="btn-primary" onClick={() => api.downloadSpeciesZip(id)}>
          <DownloadIcon /> Download Species ZIP
        </button>
      </div>

      {/* Year filter */}
      {available_years.length > 0 && (
        <div className="year-filters">
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Filter:</span>
          <button className={`year-btn ${!year ? 'active' : ''}`} onClick={() => { setYear(''); setPage(1) }}>All</button>
          {available_years.map(y => (
            <button key={y} className={`year-btn ${year == y ? 'active' : ''}`} onClick={() => { setYear(y); setPage(1) }}>{y}</button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Accession</th><th>Country</th><th>Date</th>
              <th>Length</th><th>GC %</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sequences.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">No sequences found.</td></tr>
            ) : sequences.map(s => {
              const isCncb = s.source_db?.toLowerCase().includes('cncb')
              const isBvBrc = s.source_db?.toLowerCase().includes('bv-brc')
              return (
                <tr key={s.accession}>
                  <td>
                    <button className="seq-trigger" onClick={() => setSelected(s)}>{s.accession}</button>
                  </td>
                  <td>{s.country || '-'}</td>
                  <td>{s.collection_date || '-'}</td>
                  <td>{s.length ?? '-'}</td>
                  <td>{s.gc_content?.toFixed(2) ?? '-'}</td>
                  <td>
                    {isCncb && (
                      <button className="btn-link" onClick={() => api.downloadCncbFasta(s.accession)}>↓ FASTA</button>
                    )}
                    {isBvBrc && (
                      <a className="btn-link" href={`https://www.bv-brc.org/view/Genome/${s.genome_id}`} target="_blank" rel="noopener noreferrer">BV-BRC ↗</a>
                    )}
                    {!isCncb && !isBvBrc && (
                      <a className="btn-link" href={`https://www.ncbi.nlm.nih.gov/nuccore/${s.accession}`} target="_blank" rel="noopener noreferrer">NCBI ↗</a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={total_pages} onPage={setPage} />

      {selected && <SequenceModal sequence={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
