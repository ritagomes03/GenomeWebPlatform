import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTaxonomyDetail } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import GraphButtons from '../components/species/GraphButtons'
import GraphPreviewCard from '../components/species/GraphPreviewCard'
import SequencesTable from '../components/sequences/SequencesTable'
import Pagination from '../components/ui/Pagination'
import Spinner from '../components/ui/Spinner'
import SequenceModal from '../components/sequences/SequenceModal'


function range(min, max, decimals = 0) {
  if (min == null || max == null) return null
  const fmt = (v) => (decimals ? Number(v).toFixed(decimals) : v)
  return fmt(min) === fmt(max) ? `${fmt(min)}` : `${fmt(min)} – ${fmt(max)}`
}

export default function SpeciesDetail() {
  const [selectedSequence, setSelectedSequence] = useState(null)
  const navigate = useNavigate()
  const { id: urlSlug } = useParams()
  const id = urlSlug.split('-')[0]

  const [year, setYear] = useState('')
  const [seqPage, setSeqPage] = useState(1)
  const [previews, setPreviews] = useState([])

  const { data: detail, isLoading, error } = useTaxonomyDetail(id)
  const { data: seqData, isLoading: seqLoading } = useTaxonomyDetail(id, { year, page: seqPage })

  function handleYearChange(value) {
    setYear(value)
    setSeqPage(1)
  }

  function togglePreview(key, label) {
    setPreviews((prev) =>
      prev.find((p) => p.key === key)
        ? prev.filter((p) => p.key !== key)
        : [...prev, { key, label }]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1326] text-slate-100 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex items-center justify-center text-red-400">
        Species not found.
      </div>
    )
  }

  const tax = detail?.taxonomy ?? detail
  const hasGraphs = detail?.graphs_exist && Object.values(detail.graphs_exist).some(Boolean)
  const sequences = seqData?.sequences ?? detail?.sequences ?? []

  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-100 font-[Manrope,system-ui,sans-serif] selection:bg-cyan-400/30 selection:text-cyan-300">
      <nav className="bg-[#0b1326]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-700/20 shadow-[0_0_40px_rgba(218,226,253,0.06)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-bold tracking-tight text-slate-100 font-[Space_Grotesk,system-ui,sans-serif] cursor-pointer"
          >
            ViromeGenomics
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => navigate('/species')}
              className="text-cyan-400 border-b-2 border-cyan-400 pb-1"
            >
              Repository
            </button>

            <button
              onClick={() => navigate('/analysis')}
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              Analysis
            </button>

            <button
              onClick={() => navigate('/species')}
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              Taxonomy
            </button>

            <button className="text-slate-400 hover:text-slate-100 transition-colors">
              Documentation
            </button>
          </div>

          <button
            onClick={() => navigate('/species')}
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ← Back to Species List
          </button>
        </div>
      </nav>

      <main className="relative overflow-hidden">
        <section className="relative px-8 pt-16 pb-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src="/virus-750.jpg"
              alt="Virus background"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] object-cover rounded-full opacity-18 blur-[1px] scale-110"
            />
            <div className="absolute inset-0 bg-[#0b1326]/78" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,229,0.07)_0%,rgba(11,19,38,0.9)_76%)]" />
          </div>

          <div className="relative z-10 max-w-screen-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => navigate('/species')}
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                ← Back to Species List
              </button>
            </div>

            <h1 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl md:text-6xl font-bold tracking-tighter text-slate-100 mb-3 italic leading-tight">
              {tax?.species}
            </h1>

            <p className="text-slate-400 text-lg">
              Family: <strong className="text-slate-200">{tax?.family ?? '—'}</strong>
              <span className="mx-2">•</span>
              Genus: <strong className="text-slate-200">{tax?.genus ?? '—'}</strong>
            </p>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-8 pb-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-10">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Length (bp)</p>
              <h3 className="text-2xl font-bold text-cyan-400">
                {range(tax?.min_length, tax?.max_length) ?? '—'}
              </h3>
            </div>

            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">GC Content (%)</p>
              <h3 className="text-2xl font-bold text-cyan-400">
                {range(tax?.min_gc, tax?.max_gc, 2) ?? '—'}
              </h3>
            </div>

            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Melting Temp (°C)</p>
              <h3 className="text-2xl font-bold text-cyan-400">
                {range(tax?.min_mt, tax?.max_mt, 2) ?? '—'}
              </h3>
            </div>

            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Entropy</p>
              <h3 className="text-2xl font-bold text-cyan-400">
                {range(tax?.min_ent, tax?.max_ent, 2) ?? '—'}
              </h3>
            </div>

            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6 md:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Collection Dates</p>
              <h3 className="text-lg font-bold text-cyan-400 leading-snug">
                {tax?.first_collection
                  ? tax.first_collection === tax.last_collection
                    ? tax.first_collection
                    : `${tax.first_collection} to ${tax.last_collection}`
                  : '—'}
              </h3>
            </div>
          </div>

          <section className="mb-12">
            <div className="mb-6">
              <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-3xl font-bold text-slate-100 mb-2">
                Analysis Visualizations
              </h2>
              <p className="text-slate-400">
                Explore statistical plots and sequence-derived metrics for this species.
              </p>
            </div>

            {hasGraphs ? (
              <>
                <div className="[&>*]:!bg-slate-800/95 [&>*]:!border-slate-700/30 [&>*]:!text-slate-100">
                  <GraphButtons
                    taxonomyId={id}
                    graphsExist={detail.graphs_exist}
                    openKeys={previews.map((p) => p.key)}
                    onToggle={togglePreview}
                  />
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                    {previews.map(({ key, label }) => (
                      <div
                        key={key}
                        className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4"
                      >
                        <GraphPreviewCard
                          taxonomyId={id}
                          graphKey={key}
                          label={label}
                          onClose={() => togglePreview(key, label)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-800/95 border border-dashed border-slate-600 rounded-2xl p-10 text-center text-slate-400">
                <p className="font-medium mb-2 text-slate-200">
                  No visualizations available for this species.
                </p>
                <p className="m-0 text-[0.95rem]">
                  <em>
                    Visualizations are only generated for species with 4 or more sequences
                    (currently has {tax?.sequence_count}).
                  </em>
                </p>
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <div>
                <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-3xl font-bold text-slate-100 m-0">
                  Individual Sequences ({tax?.sequence_count?.toLocaleString()})
                </h2>
                <p className="text-slate-400 mt-2">
                  Browse sequences, filter by year, and download the species dataset.
                </p>
              </div>

              <button
                onClick={() => genomesApi.downloadZip(id)}
                className="inline-flex items-center gap-2 bg-gradient-to-br from-cyan-400 to-cyan-600 text-slate-950 px-5 py-3 rounded-xl font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                ↓ Download Sequences (ZIP)
              </button>
            </div>

            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6 overflow-hidden">
              <div className="[&_th]:!bg-slate-700 [&_th]:!text-slate-200 [&_td]:!text-slate-700 [&_tr]:!bg-white [&_tr:hover]:!bg-slate-50">
                <SequencesTable
                  sequences={sequences}
                  loading={seqLoading}
                  availableYears={detail?.available_years}
                  year={year}
                  onYearChange={handleYearChange}
                  onSequenceClick={setSelectedSequence}
                />
              </div>

              <div className="mt-6 flex justify-center">
                <div className="[&_*]:!text-slate-300 [&_button:hover]:!text-cyan-400">
                  <Pagination
                    page={seqData?.page ?? 1}
                    numPages={seqData?.num_pages ?? 1}
                    onPageChange={setSeqPage}
                  />
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
            {selectedSequence && (
        <SequenceModal
          sequence={selectedSequence}
          onClose={() => setSelectedSequence(null)}
        />
      )}
    </div>
  )
}