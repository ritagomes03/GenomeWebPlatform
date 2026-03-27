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
import { ThemeToggle } from '../components/ui/ThemeToggle'


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

  const [seqPage, setSeqPage] = useState(1)
  const [previews, setPreviews] = useState([])

  const { data: detail, isLoading, error } = useTaxonomyDetail(id)
  const { data: seqData, isLoading: seqLoading } = useTaxonomyDetail(id, { page: seqPage })

  function togglePreview(key, label) {
    setPreviews((prev) =>
      prev.find((p) => p.key === key)
        ? prev.filter((p) => p.key !== key)
        : [...prev, { key, label }]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen dark:bg-[#0b1326] bg-slate-50 flex items-center justify-center dark:text-slate-100 text-slate-900">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen dark:bg-[#0b1326] bg-slate-50 flex items-center justify-center text-red-400">
        Species not found.
      </div>
    )
  }

  const tax = detail?.taxonomy ?? detail
  const hasGraphs = detail?.graphs_exist && Object.values(detail.graphs_exist).some(Boolean)
  const sequences = seqData?.sequences ?? detail?.sequences ?? []

  return (
    <div className="min-h-screen dark:bg-[#0b1326] bg-slate-50 dark:text-slate-100 text-slate-900 font-[Manrope,system-ui,sans-serif] selection:bg-cyan-400/30 selection:text-cyan-300">

      {/* NAVBAR */}
      <nav className="dark:bg-[#0b1326]/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b dark:border-slate-700/20 border-slate-200/50 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-bold tracking-tight dark:text-slate-100 text-slate-900 font-[Space_Grotesk,system-ui,sans-serif] cursor-pointer hover:opacity-80 transition-opacity"
          >
            ViromeGenomics
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => navigate('/')} className="dark:text-slate-400 text-slate-500 dark:hover:text-slate-100 hover:text-slate-900 transition-colors">
              Home
            </button>
            <button onClick={() => navigate('/species')} className="text-cyan-400 border-b-2 border-cyan-400 pb-1">
              Database
            </button>
            <button onClick={() => navigate('/analysis')} className="dark:text-slate-400 text-slate-500 dark:hover:text-slate-100 hover:text-slate-900 transition-colors">
              Analysis
            </button>
            <button onClick={() => navigate('/documentation')} className="dark:text-slate-400 text-slate-500 dark:hover:text-slate-100 hover:text-slate-900 transition-colors">
              Documentation
            </button>
          </div>

          {/* TOGGLE */}
          <div className="w-24 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="relative overflow-hidden">

        {/* HERO */}
        <section className="relative px-8 pt-16 pb-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src="/virus-750.jpg"
              alt="Virus background"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] object-cover rounded-full dark:opacity-10 opacity-5 blur-[2px] scale-110"
            />
            <div className="absolute inset-0 dark:bg-[#0b1326]/80 bg-slate-50/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,229,0.05)_0%,rgba(11,19,38,1)_85%)] dark:block hidden" />
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

            <h1 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl md:text-6xl font-bold tracking-tighter dark:text-slate-100 text-slate-900 mb-3 italic leading-tight">
              {tax?.species}
            </h1>

            <p className="dark:text-slate-300 text-slate-600 text-lg">
              Family: <strong className="dark:text-white text-slate-900">{tax?.family ?? '—'}</strong>
              <span className="mx-2 dark:text-slate-500 text-slate-400">•</span>
              Genus: <strong className="dark:text-white text-slate-900">{tax?.genus ?? '—'}</strong>
            </p>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-8 pb-20 relative z-10">

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-12">
            {[
              { label: 'Length (bp)',       value: range(tax?.min_length, tax?.max_length) },
              { label: 'GC Content (%)',    value: range(tax?.min_gc, tax?.max_gc, 2) },
              { label: 'Melting Temp (°C)', value: range(tax?.min_mt, tax?.max_mt, 2) },
              { label: 'Entropy',           value: range(tax?.min_ent, tax?.max_ent, 2) },
            ].map(({ label, value }) => (
              <div key={label} className="dark:bg-slate-700 bg-white rounded-xl border dark:border-slate-600 border-slate-200 shadow-md p-6">
                <p className="text-xs uppercase tracking-[0.2em] dark:text-slate-300 text-slate-500 mb-2 font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-cyan-400">{value ?? '—'}</h3>
              </div>
            ))}

            <div className="dark:bg-slate-700 bg-white rounded-xl border dark:border-slate-600 border-slate-200 shadow-md p-6 md:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] dark:text-slate-300 text-slate-500 mb-2 font-medium">Collection Dates</p>
              <h3 className="text-lg font-bold text-cyan-400 leading-snug">
                {tax?.first_collection
                  ? tax.first_collection === tax.last_collection
                    ? tax.first_collection
                    : `${tax.first_collection} to ${tax.last_collection}`
                  : '—'}
              </h3>
            </div>
          </div>

          {/* VISUALIZATIONS */}
          <section className="mb-14">
            <div className="mb-6">
              <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-3xl font-bold dark:text-slate-100 text-slate-900 mb-2">
                Analysis Visualizations
              </h2>
              <p className="dark:text-slate-300 text-slate-600">
                Explore statistical plots and sequence-derived metrics for this species.
              </p>
            </div>

            {hasGraphs ? (
              <>
                <div className="flex flex-wrap gap-3 [&_button]:!dark:bg-slate-700 [&_button]:!bg-slate-100 [&_button]:!border [&_button]:!dark:border-slate-600 [&_button]:!border-slate-300 hover:[&_button]:!dark:bg-slate-600 hover:[&_button]:!bg-slate-200 [&_a]:!dark:bg-slate-700 [&_a]:!bg-slate-100 [&_a]:!border [&_a]:!dark:border-slate-600 [&_a]:!border-slate-300 hover:[&_a]:!dark:bg-slate-600 hover:[&_a]:!bg-slate-200 [&_.bg-white]:!dark:bg-slate-700 [&_.bg-white]:!bg-slate-100 [&_*]:!dark:text-slate-100 [&_*]:!text-slate-700">
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
                      <div key={key} className="dark:bg-slate-700 bg-white rounded-xl border dark:border-slate-600 border-slate-200 shadow-md p-4">
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
              <div className="dark:bg-slate-700/50 bg-slate-100 border border-dashed dark:border-slate-500 border-slate-300 rounded-2xl p-10 text-center dark:text-slate-300 text-slate-600">
                <p className="font-medium mb-2 dark:text-white text-slate-900">
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

          {/* SEQUENCES TABLE */}
          <section>
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <div>
                <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-3xl font-bold dark:text-slate-100 text-slate-900 m-0">
                  Individual Sequences ({tax?.sequence_count?.toLocaleString()})
                </h2>
                <p className="dark:text-slate-300 text-slate-600 mt-2">
                  Browse sequences and download the species dataset.
                </p>
              </div>

              <button
                onClick={() => genomesApi.downloadZip(id)}
                className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-6 py-3 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 shadow-lg"
              >
                <DownloadIcon /> Download Sequences (ZIP)
              </button>
            </div>

            <div className="dark:bg-slate-700 bg-white rounded-xl shadow-xl border dark:border-slate-600 border-slate-200 overflow-hidden">
              <div className="overflow-x-auto
                [&_table]:!w-full [&_table]:!text-left
                [&_thead]:!dark:bg-slate-600 [&_thead]:!bg-slate-100
                [&_th]:!dark:bg-slate-600 [&_th]:!bg-slate-100
                [&_th]:!dark:text-white [&_th]:!text-slate-700
                [&_th]:!uppercase [&_th]:!text-xs [&_th]:!tracking-wider
                [&_th]:!px-6 [&_th]:!py-4
                [&_th]:!border-b [&_th]:!dark:border-slate-500 [&_th]:!border-slate-200
                [&_tbody]:!dark:bg-slate-700 [&_tbody]:!bg-white
                [&_tr]:!dark:bg-slate-700 [&_tr]:!bg-white
                hover:[&_tbody_tr]:!dark:bg-slate-600/50 hover:[&_tbody_tr]:!bg-slate-50
                [&_tr]:!border-b [&_tr]:!dark:border-slate-600 [&_tr]:!border-slate-100
                [&_tr:last-child]:!border-0
                [&_td]:!px-6 [&_td]:!py-[18px] [&_td]:!text-[0.95rem]
                [&_td]:!dark:text-slate-300 [&_td]:!text-slate-600
                [&_td:first-child]:!text-cyan-400 [&_td:first-child_*]:!text-cyan-400 [&_td:first-child]:!font-semibold
                [&_td:last-child_a]:!dark:bg-slate-800 [&_td:last-child_a]:!bg-slate-100
                [&_td:last-child_a]:!dark:text-white [&_td:last-child_a]:!text-slate-700
                [&_td:last-child_a]:!border [&_td:last-child_a]:!dark:border-slate-700 [&_td:last-child_a]:!border-slate-200
                hover:[&_td:last-child_a]:!dark:bg-slate-700 hover:[&_td:last-child_a]:!bg-slate-200
                [&_td:last-child_button]:!dark:bg-slate-800 [&_td:last-child_button]:!bg-slate-100
                [&_td:last-child_button]:!dark:text-white [&_td:last-child_button]:!text-slate-700
                [&_td:last-child_button]:!border [&_td:last-child_button]:!dark:border-slate-700 [&_td:last-child_button]:!border-slate-200
                hover:[&_td:last-child_button]:!dark:bg-slate-700 hover:[&_td:last-child_button]:!bg-slate-200">
                <SequencesTable
                  sequences={sequences}
                  loading={seqLoading}
                  onSequenceClick={setSelectedSequence}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center items-center">
              <div className="flex items-center gap-4 dark:text-slate-200 text-slate-600 [&_button]:dark:text-slate-200 [&_button]:text-slate-600 hover:[&_button]:dark:text-white hover:[&_button]:text-slate-900 [&_span]:text-cyan-400 [&_span]:font-bold transition-colors">
                <Pagination
                  page={seqData?.page ?? 1}
                  numPages={seqData?.num_pages ?? 1}
                  onPageChange={setSeqPage}
                />
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


function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}