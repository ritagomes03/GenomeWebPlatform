import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { genomesApi } from '../api/genomes'
import Spinner from '../components/ui/Spinner'
import PageLayout from '../components/layout/PageLayout'
import EmptyState from '../components/ui/EmptyState'


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

// Devolve o label para qualquer field, incluindo other_1, other_2...
const getLabel = (field) => {
  if (field.startsWith('other_')) return 'Other'
  return FIELD_LABELS[field] ?? field
}


export default function SequenceAnalysis() {
  const navigate = useNavigate()

  const [file, setFile]                 = useState(null)
  const [results, setResults]           = useState(null)
  const [metaInfo, setMetaInfo]         = useState(null)
  const [cleanedFasta, setCleanedFasta] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  const [availableFields, setAvailableFields] = useState([])
  const [selectedFields, setSelectedFields]   = useState([])

  useEffect(() => {
    genomesApi.analysisFields()
      .then(data => setAvailableFields(data.fields))
      .catch(() => {})
  }, [])

  // other_1, other_2 → envia "other" ao backend
  const metaOrder = selectedFields
  .map(f => f.startsWith('other_') ? '' : f)
  .join(',')

  const addField = (field) => {
    if (!selectedFields.includes(field))
      setSelectedFields(prev => [...prev, field])
  }

  // "Other" pode ser adicionado múltiplas vezes com ID único
  const addOther = () => {
    const count = selectedFields.filter(f => f.startsWith('other_')).length
    setSelectedFields(prev => [...prev, `other_${count + 1}`])
  }

  const removeField = (field) => {
    setSelectedFields(prev => prev.filter(f => f !== field))
  }

  const moveField = (index, direction) => {
    setSelectedFields(prev => {
      const next = [...prev]
      const swap = index + direction
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

  // "other_X" nunca aparece nos disponíveis — tem botão próprio
  const unselected = availableFields.filter(f => !selectedFields.includes(f))

  return (
    <PageLayout>

      {/* HERO */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-10 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img src="/virus-750.jpg" alt="" role="presentation" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1100px,140vw)] h-[min(1100px,140vw)] object-cover rounded-full dark:opacity-25 opacity-10 blur-[1px] scale-110" />
          <div className="absolute inset-0 dark:bg-[#0b1326]/72 bg-slate-50/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,229,0.08)_0%,rgba(11,19,38,0.88)_76%)] dark:block hidden" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <BackIcon /> Back to Home
            </button>
          </div>

          <h1 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl md:text-6xl font-bold tracking-tighter dark:text-slate-100 text-slate-900 mb-4 leading-[1.1]">
            Sequence Analysis
          </h1>
          <p className="dark:text-slate-400 text-slate-500 text-lg max-w-3xl">
            Upload a FASTA file to calculate sequence length, base composition, GC content and melting temperature.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 space-y-6">

        {/* UPLOAD CARD */}
        <div className="dark:bg-slate-800/95 bg-white backdrop-blur-xl rounded-2xl border dark:border-slate-700/30 border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8">
          <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold dark:text-slate-100 text-slate-900 mb-1">
            Analyze FASTA File
          </h2>
          <p className="dark:text-slate-400 text-slate-500 mb-8">
            Supported formats: <span className="text-cyan-400">.fasta .fa .fna .ffn .faa .frn</span>
          </p>

          {/* METADATA ORDER */}
          <div className="mb-8">
            <p className="text-sm font-semibold dark:text-slate-300 text-slate-700 mb-1">
              Header Metadata Order
            </p>
            <p className="text-xs dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-4">
              Click fields to add them. Each field maps to a pipe-separated column in your FASTA headers.
              Leave empty to skip header parsing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Available fields */}
              <div className="dark:bg-slate-900/60 bg-slate-50 rounded-xl border dark:border-slate-700/40 border-slate-200 p-4">
                <p className="text-xs font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-3">
                  Available fields
                </p>
                <div className="flex flex-wrap gap-2">
                  {unselected.map(field => (
                    <button
                      key={field}
                      onClick={() => addField(field)}
                      aria-label={`Add ${FIELD_LABELS[field] ?? field}`}
                      className="px-3 min-h-11 py-1.5 rounded-lg text-xs font-semibold dark:bg-slate-700/60 bg-slate-200 dark:text-slate-300 text-slate-600 border dark:border-slate-600/40 border-slate-300 hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/30 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      + {FIELD_LABELS[field] ?? field}
                    </button>
                  ))}

                  {/* Botão Other — sempre disponível, pode ser clicado várias vezes */}
                  <button
                    onClick={addOther}
                    aria-label="Add Other field"
                    className="px-3 min-h-11 py-1.5 rounded-lg text-xs font-semibold dark:bg-slate-700/60 bg-slate-200 dark:text-slate-300 text-slate-600 border dark:border-slate-600/40 border-slate-300 hover:bg-amber-400/10 hover:text-amber-400 hover:border-amber-400/30 transition-all focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    + Other
                  </button>

                  {unselected.length === 0 && (
                    <p className="text-xs dark:text-slate-600 text-slate-400 italic w-full">
                      All named fields selected. You can still add Other.
                    </p>
                  )}
                </div>
              </div>

              {/* Selected fields */}
              <div className="dark:bg-slate-900/60 bg-slate-50 rounded-xl border dark:border-slate-700/40 border-slate-200 p-4">
                <p className="text-xs font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-3">
                  Selected order {selectedFields.length > 0 && <span className="dark:text-slate-600 text-slate-400 normal-case font-normal">(matches | columns in header)</span>}
                </p>
                {selectedFields.length === 0 ? (
                  <p className="text-xs dark:text-slate-600 text-slate-400 italic">No fields selected — headers will be ignored.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedFields.map((field, i) => (
                      <div
                        key={field}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg dark:bg-slate-800 bg-white border dark:border-slate-700/40 border-slate-200 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold dark:text-slate-600 text-slate-400 w-5 text-right shrink-0">{i + 1}</span>
                          <span className={`text-xs font-semibold truncate ${field.startsWith('other_') ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {getLabel(field)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveField(i, -1)}
                            disabled={i === 0}
                            aria-label={`Move ${getLabel(field)} up`}
                            className="min-h-11 min-w-11 p-2 rounded dark:text-slate-500 text-slate-400 dark:hover:text-slate-200 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                            title="Move up"
                          >▲</button>
                          <button
                            onClick={() => moveField(i, 1)}
                            disabled={i === selectedFields.length - 1}
                            aria-label={`Move ${getLabel(field)} down`}
                            className="min-h-11 min-w-11 p-2 rounded dark:text-slate-500 text-slate-400 dark:hover:text-slate-200 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                            title="Move down"
                          >▼</button>
                          <button
                            onClick={() => removeField(field)}
                            aria-label={`Remove ${getLabel(field)}`}
                            className="min-h-11 min-w-11 p-2 rounded dark:text-slate-500 text-slate-400 hover:text-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                            title="Remove"
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedFields.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs dark:text-slate-600 text-slate-400 uppercase tracking-wide shrink-0">Resolved order:</span>
                <code className="text-xs text-purple-400 dark:bg-slate-900/60 bg-slate-100 px-3 py-1 rounded-lg border dark:border-slate-700/40 border-slate-200 truncate">
                  {metaOrder}
                </code>
              </div>
            )}
          </div>

          {/* FILE INPUT */}
          <div className="space-y-4">
            <label className="block">
              <span className="sr-only">Choose FASTA file</span>
              <input
                type="file"
                accept=".fasta,.fa,.fna,.ffn,.faa,.frn,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm dark:text-slate-400 text-slate-500
                  file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0
                  file:text-sm file:font-semibold file:bg-cyan-400/10 file:text-cyan-400
                  hover:file:bg-cyan-400/20
                  border border-dashed dark:border-slate-600 border-slate-300 rounded-xl p-4
                  dark:bg-slate-900/40 bg-slate-50
                  cursor-pointer outline-none"
              />
            </label>

            {file && (
              <p className="text-sm dark:text-slate-300 text-slate-600">
                Selected file: <span className="text-cyan-400 font-semibold">{file.name}</span>
                <span className="dark:text-slate-600 text-slate-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !file}
              aria-label="Run sequence analysis"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                loading || !file
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-slate-950 hover:brightness-110 shadow-lg'
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

        {loading && <div className="py-12"><Spinner /></div>}

        {/* RESULTS */}
        {results && results.length > 0 && (
          <div className="dark:bg-slate-800/95 bg-white backdrop-blur-xl rounded-2xl border dark:border-slate-700/30 border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <h3 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold dark:text-slate-100 text-slate-900">
                  Results
                </h3>
                <p className="dark:text-slate-400 text-slate-500">
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

            <div className="overflow-x-auto rounded-xl border dark:border-slate-700/30 border-slate-200">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr>
                    {['Sequence ID','Length (bp)','GC (%)','A (%)','T (%)','C (%)','G (%)','Tm (°C)'].map(h => (
                      <th scope="col" key={h} className="p-4 dark:bg-slate-900/70 bg-slate-50 dark:text-slate-300 text-slate-600 font-semibold border-b dark:border-slate-700 border-slate-200">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, idx) => (
                    <tr key={idx} className="border-b dark:border-slate-700/20 border-slate-100 dark:hover:bg-slate-700/20 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-cyan-400">{item.id || <span className="dark:text-slate-600 text-slate-400 italic">—</span>}</td>
                      <td className="p-4 dark:text-slate-300 text-slate-600">{item.length.toLocaleString()}</td>
                      <td className="p-4 dark:text-slate-300 text-slate-600">{item.gc_content}</td>
                      <td className="p-4 dark:text-slate-300 text-slate-600">{item.a_perc}</td>
                      <td className="p-4 dark:text-slate-300 text-slate-600">{item.t_perc}</td>
                      <td className="p-4 dark:text-slate-300 text-slate-600">{item.c_perc}</td>
                      <td className="p-4 dark:text-slate-300 text-slate-600">{item.g_perc}</td>
                      <td className="p-4 dark:text-slate-300 text-slate-600">{item.melting_temp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {results?.length === 0 && !loading && (
          <EmptyState
            title="No analysis results"
            description="No results were returned for this file."
          />
        )}
      </section>
    </PageLayout>
  )
}


function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}