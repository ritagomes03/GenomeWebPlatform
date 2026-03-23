import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { genomesApi } from '../api/genomes'
import Spinner from '../components/ui/Spinner'

const FIELD_LABELS = {
  accession:        'Accession',
  family:           'Family',
  genus:            'Genus',
  species:          'Species',
  organism_name:    'Organism Name',
  molecular_type:   'Molecular Type',
  collection_date:  'Collection Date',
  country:          'Country',
  completenessFlag: 'Completeness',
  source:           'Source',
}

export default function SequenceAnalysis() {
  const navigate = useNavigate()

  const [file, setFile]               = useState(null)
  const [results, setResults]         = useState(null)
  const [metaInfo, setMetaInfo]       = useState(null)
  const [cleanedFasta, setCleanedFasta] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  const [availableFields, setAvailableFields] = useState([])
  const [selectedFields, setSelectedFields]   = useState([])

  useEffect(() => {
    genomesApi.analysisFields()
      .then(data => setAvailableFields(data.fields))
      .catch(() => {})
  }, [])

  const metaOrder = selectedFields.join(',')

  const addField = (field) => {
    if (!selectedFields.includes(field))
      setSelectedFields(prev => [...prev, field])
  }

  const removeField = (field) => {
    setSelectedFields(prev => prev.filter(f => f !== field))
  }

  const moveField = (index, direction) => {
    setSelectedFields(prev => {
      const next  = [...prev]
      const swap  = index + direction
      if (swap < 0 || swap >= next.length) return prev
      ;[next[index], next[swap]] = [next[swap], next[index]]
      return next
    })
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResults(null)
    setCleanedFasta(null)
    try {
      const data = await genomesApi.analyzeFasta(file, metaOrder)
      if (!data?.results) throw new Error('Formato de resposta inválido.')
      setResults(data.results)
      setMetaInfo(data.meta)
      setCleanedFasta(data.cleaned_fasta)
    } catch (err) {
      setError(err.message || 'Erro de ligação ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  const triggerDownload = (blob, filename) => {
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getTimestamp = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  const downloadCSV = () => {
    if (!results?.length) return
    const headers = ['Sequence ID','Length (bp)','GC (%)','A (%)','T (%)','C (%)','G (%)','Tm (°C)']
    const esc = (v) => { const s = String(v??''); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g,'""')}"` : s }
    const rows = results.map(r => [r.id,r.length,r.gc_content,r.a_perc,r.t_perc,r.c_perc,r.g_perc,r.melting_temp])
    const csv  = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n')
    triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `analysis_${getTimestamp()}.csv`)
  }

  const downloadFasta = () => {
    if (!cleanedFasta) return
    const name = file?.name?.replace(/\.[^/.]+$/, '') ?? 'sequences'
    triggerDownload(new Blob([cleanedFasta], { type: 'text/plain;charset=utf-8;' }), `uniformized_${name}.fasta`)
  }

  const unselected = availableFields.filter(f => !selectedFields.includes(f))

  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-100 font-[Manrope,system-ui,sans-serif]">

      <nav className="bg-[#0b1326]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-700/20 shadow-[0_0_40px_rgba(218,226,253,0.06)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold tracking-tight text-slate-100 font-[Space_Grotesk,system-ui,sans-serif]">
            ViromeGenomics
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => navigate('/species')} className="text-slate-400 hover:text-slate-100 transition-colors">Repository</button>
            <button onClick={() => navigate('/analysis')} className="text-cyan-400 border-b-2 border-cyan-400 pb-1">Analysis</button>
            <button onClick={() => navigate('/species')} className="text-slate-400 hover:text-slate-100 transition-colors">Taxonomy</button>
            <button className="text-slate-400 hover:text-slate-100 transition-colors">Documentation</button>
          </div>
          <button onClick={() => navigate('/')} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">← Back to Home</button>
        </div>
      </nav>

      <main className="relative overflow-hidden">
        <section className="relative px-8 pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img src="/virus-750.jpg" alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] object-cover rounded-full opacity-25 blur-[1px] scale-110" />
            <div className="absolute inset-0 bg-[#0b1326]/72" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,229,0.08)_0%,rgba(11,19,38,0.88)_76%)]" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <h1 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl md:text-6xl font-bold tracking-tighter text-slate-100 mb-4 leading-[1.1]">
              Sequence Analysis
            </h1>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Upload a FASTA file to calculate sequence length, base composition, GC content and melting temperature.
            </p>
          </div>
        </section>

        <section className="max-w-screen-xl mx-auto px-8 pb-20 relative z-10 space-y-6">

          {/* ── Upload card ───────────────────────────────────────── */}
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-8">
            <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold text-slate-100 mb-1">
              Analyze FASTA File
            </h2>
            <p className="text-slate-400 mb-8">
              Supported formats: <span className="text-cyan-400">.fasta .fa .fna .ffn .faa .frn .txt</span>
            </p>

            {/* ── Field picker ──────────────────────────────────── */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-slate-300 mb-1">
                Header Metadata Order
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">
                Click fields to add them. Each field maps to a pipe-separated column in your FASTA headers.
                Leave empty to skip header parsing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Available fields */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-700/40 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Available fields
                  </p>
                  {unselected.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">All fields selected.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {unselected.map(field => (
                        <button
                          key={field}
                          onClick={() => addField(field)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40 hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
                        >
                          + {FIELD_LABELS[field] ?? field}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected fields in order */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-700/40 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Selected order {selectedFields.length > 0 && <span className="text-slate-600 normal-case font-normal">(matches | columns in header)</span>}
                  </p>
                  {selectedFields.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">No fields selected — headers will be ignored.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedFields.map((field, i) => (
                        <div
                          key={field}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/40 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-slate-600 w-5 text-right shrink-0">{i + 1}</span>
                            <span className="text-xs font-semibold text-cyan-400 truncate">
                              {FIELD_LABELS[field] ?? field}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => moveField(i, -1)}
                              disabled={i === 0}
                              className="p-1 rounded text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveField(i, 1)}
                              disabled={i === selectedFields.length - 1}
                              className="p-1 rounded text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move down"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => removeField(field)}
                              className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Live preview of meta_order string */}
              {selectedFields.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-600 uppercase tracking-wide shrink-0">Resolved order:</span>
                  <code className="text-xs text-purple-400 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-700/40 truncate">
                    {metaOrder}
                  </code>
                </div>
              )}
            </div>

            {/* ── File input ────────────────────────────────────── */}
            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Choose FASTA file</span>
                <input
                  type="file"
                  accept=".fasta,.fa,.fna,.ffn,.faa,.frn,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-400
                    file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0
                    file:text-sm file:font-semibold file:bg-cyan-400/10 file:text-cyan-400
                    hover:file:bg-cyan-400/20
                    border border-dashed border-slate-600 rounded-xl p-4 bg-slate-900/40
                    cursor-pointer outline-none"
                />
              </label>

              {file && (
                <p className="text-sm text-slate-300">
                  Selected file: <span className="text-cyan-400 font-semibold">{file.name}</span>
                  <span className="text-slate-600 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !file}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  loading || !file
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:brightness-110 shadow-lg'
                }`}
              >
                {loading ? 'Analyzing…' : 'Analyze File'}
              </button>
            </div>

            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>

          {/* ── Spinner ───────────────────────────────────────────── */}
          {loading && <div className="py-12"><Spinner /></div>}

          {/* ── Results ───────────────────────────────────────────── */}
          {results && results.length > 0 && (
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-8 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold text-slate-100">
                    Results
                  </h3>
                  <p className="text-slate-400">
                    Analysis output for {results.length} sequence{results.length !== 1 ? 's' : ''}.
                  </p>
                  {metaInfo && metaInfo.original_count > metaInfo.cleaned_count && (
                    <p className="text-emerald-400 text-sm mt-1 font-medium">
                      {metaInfo.original_count - metaInfo.cleaned_count} duplicates or low-quality sequences filtered.
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {cleanedFasta && (
                    <button
                      onClick={downloadFasta}
                      className="px-5 py-3 rounded-xl font-semibold bg-purple-400/10 text-purple-400 border border-purple-400/30 hover:bg-purple-400/20 transition-colors"
                    >
                      Download Cleaned FASTA
                    </button>
                  )}
                  <button
                    onClick={downloadCSV}
                    className="px-5 py-3 rounded-xl font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 transition-colors"
                  >
                    Download CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr>
                      {['Sequence ID','Length (bp)','GC (%)','A (%)','T (%)','C (%)','G (%)','Tm (°C)'].map(h => (
                        <th key={h} className="p-4 bg-slate-900/70 text-slate-300 font-semibold border-b border-slate-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 font-mono font-bold text-cyan-400">{item.id || <span className="text-slate-600 italic">—</span>}</td>
                        <td className="p-4 text-slate-300">{item.length.toLocaleString()}</td>
                        <td className="p-4 text-slate-300">{item.gc_content}</td>
                        <td className="p-4 text-slate-300">{item.a_perc}</td>
                        <td className="p-4 text-slate-300">{item.t_perc}</td>
                        <td className="p-4 text-slate-300">{item.c_perc}</td>
                        <td className="p-4 text-slate-300">{item.g_perc}</td>
                        <td className="p-4 text-slate-300">{item.melting_temp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results?.length === 0 && !loading && (
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 p-8 text-center text-slate-400">
              No results were returned for this file.
            </div>
          )}

        </section>
      </main>
    </div>
  )
}