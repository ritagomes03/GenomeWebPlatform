import { useState, useEffect } from 'react'
import { fetchSpecies, fetchAutocomplete } from '../api/genomes'

export default function SpeciesList() {
  const [species, setSpecies] = useState([])
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchSpecies()
      .then(setSpecies)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    fetchAutocomplete(query).then(setSuggestions).catch(console.error)
  }, [query])

  return (
    <div className="max-w-2xl mx-auto p-8 flex flex-col gap-6">
      <h1>Species</h1>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search species..."
          className="w-full px-4 py-2 rounded-lg"
          style={{ border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text-h)' }}
        />
        {suggestions.length > 0 && (
          <ul
            className="absolute w-full rounded-lg mt-1 z-10 overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', boxShadow: 'var(--shadow)' }}
          >
            {suggestions.map(s => (
              <li
                key={s.taxonomy_id}
                onClick={() => { setQuery(s.name); setSuggestions([]) }}
                className="px-4 py-2 cursor-pointer hover:opacity-80"
                style={{ color: 'var(--text-h)' }}
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p style={{ color: 'var(--text)' }}>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="flex flex-col gap-3">
        {species.map(s => (
          <li
            key={s.taxonomy_id}
            className="flex justify-between items-center p-4 rounded-xl"
            style={{ border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--text-h)' }}>{s.name}</span>
            <div className="flex gap-2">
              <a
                href={`/api/${s.taxonomy_id}/`}
                className="px-3 py-1 rounded-full text-sm"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
              >
                View
              </a>
              <a
                href={`/api/${s.taxonomy_id}/download-zip/`}
                className="px-3 py-1 rounded-full text-sm"
                style={{ background: 'var(--code-bg)', color: 'var(--text)' }}
              >
                ↓ ZIP
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <a href="/api/download-fasta-global/" className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          ↓ Download all FASTA
        </a>
        <a href="/api/download-metadata-global/" className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--code-bg)', color: 'var(--text)' }}>
          ↓ Download all Metadata
        </a>
      </div>
    </div>
  )
}
