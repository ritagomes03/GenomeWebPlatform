import { useState, useEffect } from 'react'
import { useTaxonomy } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import Autocomplete from '../components/ui/Autocomplete'
import Pagination from '../components/ui/Pagination'
import StatsBadge from '../components/ui/StatsBadge'
import Spinner from '../components/ui/Spinner'

export default function SpeciesList({ navigate, initialQuery = '' }) {
  const [search, setSearch] = useState(initialQuery)
  const [sort, setSort]     = useState('frequency')
  const [page, setPage]     = useState(1)

  useEffect(() => { setPage(1) }, [search, sort])

  const { data, isLoading, error } = useTaxonomy({ q: search, sort, page })

  const sortLink = (value, label) => (
    <button
      onClick={() => setSort(value)}
      className={`px-3 py-1.5 rounded-lg text-sm transition-all border
        ${sort === value
          ? 'font-semibold text-blue-500 bg-blue-50 border-blue-200'
          : 'text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-800'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,system-ui,sans-serif] text-slate-800 py-10 px-5">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <button onClick={() => navigate('home')} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-500 font-medium text-[0.95rem] transition-colors">
              <BackIcon /> Back to Home
            </button>
          </div>
          <h1 className="text-[2.25rem] font-extrabold text-slate-900 tracking-tight mb-2">Species Database</h1>
          {data && <StatsBadge totalSpecies={data.total_species} totalSequences={data.total_sequences} />}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center flex-wrap gap-4 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Sort by:</span>
            {sortLink('frequency', 'Most Frequent')}
            {sortLink('az', 'A-Z')}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={genomesApi.downloadMetadata}
              className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-[10px] text-sm font-semibold shadow-[0_4px_6px_-1px_rgba(59,130,246,0.2)] transition-all hover:-translate-y-px"
            >
              <DownloadIcon /> CSV
            </button>
            <button
              onClick={genomesApi.downloadAllFasta}
              className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[10px] text-sm font-semibold shadow-[0_4px_6px_-1px_rgba(16,185,129,0.2)] transition-all hover:-translate-y-px"
            >
              <DownloadIcon /> FASTA
            </button>

            <div className="flex">
              <Autocomplete
                value={search}
                onChange={setSearch}
                onSelect={(s) => { setSearch(s); setPage(1) }}
              />
              <button
                onClick={() => setPage(1)}
                className="px-[18px] py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-r-[10px] text-sm font-semibold transition-all hover:-translate-y-px"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading && <Spinner />}
        {error     && <p className="text-red-500 text-center py-10">Failed to load species.</p>}
        {!isLoading && data && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    {['Species', 'Family', 'Genus', 'Sequences'].map(h => (
                      <th key={h} className="bg-slate-50 px-6 py-[18px] text-slate-500 font-semibold uppercase text-xs tracking-widest border-b border-slate-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                        <SearchIcon />
                        <br />No species found.
                      </td>
                    </tr>
                  ) : data.results.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-[18px]">
                        <button onClick={() => navigate('detail', s.id)} className="italic font-semibold text-slate-800 hover:text-blue-500 transition-colors text-[0.95rem]">
                          {s.species}
                        </button>
                      </td>
                      <td className="px-6 py-[18px] text-[0.95rem] text-slate-700">{s.family ?? '—'}</td>
                      <td className="px-6 py-[18px] text-[0.95rem] text-slate-700">{s.genus ?? '—'}</td>
                      <td className="px-6 py-[18px] text-[0.95rem] font-medium">{s.sequence_count?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={data.page} numPages={data.num_pages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}
