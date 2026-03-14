import { useState } from 'react'
import { useTaxonomyDetail } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import StatCard from '../components/species/StatCard'
import GraphButtons from '../components/species/GraphButtons'
import GraphPreviewCard from '../components/species/GraphPreviewCard'
import SequencesTable from '../components/sequences/SequencesTable'
import Pagination from '../components/ui/Pagination'
import Spinner from '../components/ui/Spinner'

function range(min, max, decimals = 0) {
  if (min == null || max == null) return null
  const fmt = v => (decimals ? Number(v).toFixed(decimals) : v)
  return fmt(min) === fmt(max) ? `${fmt(min)}` : `${fmt(min)} – ${fmt(max)}`
}

export default function SpeciesDetail({ id, navigate }) {
  const [year, setYear]         = useState('')
  const [seqPage, setSeqPage]   = useState(1)
  const [previews, setPreviews] = useState([])  // [{ key, label }]

  const { data: detail, isLoading, error }           = useTaxonomyDetail(id)
  const { data: seqData, isLoading: seqLoading }     = useTaxonomyDetail(id, { year, page: seqPage })

  function handleYearChange(value) {
    setYear(value)
    setSeqPage(1)
  }

  function togglePreview(key, label) {
    setPreviews(prev =>
      prev.find(p => p.key === key)
        ? prev.filter(p => p.key !== key)
        : [...prev, { key, label }]
    )
  }

  if (isLoading) return <div className="min-h-screen bg-slate-50"><Spinner /></div>
  if (error)     return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">Species not found.</div>

  const tax      = detail?.taxonomy ?? detail
  const hasGraphs = detail?.graphs_exist && Object.values(detail.graphs_exist).some(Boolean)
  const sequences = seqData?.sequences ?? detail?.sequences ?? []

  return (
    <div className="min-h-screen bg-slate-50 font-[system-ui,-apple-system,sans-serif] text-slate-700 py-10 px-5">
      <div className="max-w-[1100px] mx-auto">

        {/* Back */}
        <div className="mb-6">
          <button
            onClick={() => navigate('list')}
            className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium bg-transparent border-none cursor-pointer p-0"
          >
            ← Back to Species List
          </button>
        </div>

        {/* Header */}
        <h1 className="text-[2.2rem] font-bold text-slate-900 m-0 mb-2 italic">{tax?.species}</h1>
        <p className="text-slate-500 text-[1.05rem] mb-8">
          Family: <strong>{tax?.family ?? '—'}</strong> &bull; Genus: <strong>{tax?.genus ?? '—'}</strong>
        </p>

        {/* Stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
          <StatCard label="Length (bp)"       value={range(tax?.min_length, tax?.max_length)} />
          <StatCard label="GC Content (%)"    value={range(tax?.min_gc, tax?.max_gc, 2)} />
          <StatCard label="Melting Temp (°C)" value={range(tax?.min_mt, tax?.max_mt, 2)} />
          <StatCard label="Entropy"           value={range(tax?.min_ent, tax?.max_ent, 2)} />
          <StatCard
            label="Collection Dates"
            value={
              tax?.first_collection
                ? tax.first_collection === tax.last_collection
                  ? tax.first_collection
                  : `${tax.first_collection} to ${tax.last_collection}`
                : null
            }
          />
        </div>

        {/* Visualizations */}
        <h3 className="text-[1.5rem] font-bold text-slate-900 mb-4">Analysis Visualizations</h3>
        {hasGraphs ? (
          <>
            <GraphButtons
              taxonomyId={id}
              graphsExist={detail.graphs_exist}
              openKeys={previews.map(p => p.key)}
              onToggle={togglePreview}
            />
            {previews.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(450px,1fr))] gap-5 mt-6">
                {previews.map(({ key, label }) => (
                  <GraphPreviewCard
                    key={key}
                    taxonomyId={id}
                    graphKey={key}
                    label={label}
                    onClose={() => togglePreview(key, label)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500 mb-8">
            <p className="font-medium mb-2">No visualizations available for this species.</p>
            <p className="m-0 text-[0.95rem]">
              <em>Visualizations are only generated for species with 4 or more sequences (currently has {tax?.sequence_count}).</em>
            </p>
          </div>
        )}

        {/* Sequences header */}
        <div className="flex justify-between items-center flex-wrap gap-4 mt-10 mb-4">
          <h3 className="text-[1.5rem] font-bold text-slate-900 m-0">
            Individual Sequences ({tax?.sequence_count?.toLocaleString()})
          </h3>
          <button
            onClick={() => genomesApi.downloadZip(id)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-[18px] py-2.5 rounded-lg font-medium text-[0.95rem] transition-colors border-none cursor-pointer"
          >
            ↓ Download Sequences (ZIP)
          </button>
        </div>

        <SequencesTable
          sequences={sequences}
          loading={seqLoading}
          availableYears={detail?.available_years}
          year={year}
          onYearChange={handleYearChange}
        />

        <Pagination
          page={seqData?.page ?? 1}
          numPages={seqData?.num_pages ?? 1}
          onPageChange={setSeqPage}
        />

      </div>
    </div>
  )
}
