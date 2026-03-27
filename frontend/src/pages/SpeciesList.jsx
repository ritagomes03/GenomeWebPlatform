import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTaxonomy } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import Autocomplete from '../components/ui/Autocomplete'
import Pagination from '../components/ui/Pagination'
import StatsBadge from '../components/ui/StatsBadge'
import PageLayout from '../components/layout/PageLayout'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'


export default function SpeciesList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQuery = searchParams.get('q') || ''
  const [search, setSearch] = useState(initialQuery)
  const [sort, setSort] = useState('frequency')
  const [page, setPage] = useState(1)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const { data, isLoading, error } = useTaxonomy({ q: search, sort, page })

  function handleSearch(s) {
    setSearch(s)
    setPage(1)
    if (s) setSearchParams({ q: s })
    else setSearchParams({})
  }

  const sortButton = (value, label) => (
    <button
      type="button"
      onClick={() => {
        setSort(value)
        setPage(1)
      }}
      aria-pressed={sort === value}
      className={`px-4 min-h-11 py-2 rounded-xl text-sm transition-all border focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        sort === value
          ? 'font-semibold text-cyan-900 bg-cyan-400 border-cyan-400 shadow-sm'
          : 'dark:text-slate-100 text-slate-600 dark:border-slate-500 border-slate-300 dark:hover:bg-slate-500 hover:bg-slate-200 dark:hover:text-white hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  )

  if (isLoading) {
    return (
      <PageLayout>
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-5">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-[420px] w-full" />
        </section>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <section className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <EmptyState
            title="Unable to load species"
            description="Please refresh the page and try again."
          />
        </section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>

        {/* HERO */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-10 md:pb-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/virus-750.jpg"
              alt="Virus background"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1100px,140vw)] h-[min(1100px,140vw)] object-cover rounded-full dark:opacity-10 opacity-5 blur-[2px] scale-110"
            />
            <div className="absolute inset-0 dark:bg-[#0b1326]/80 bg-slate-50/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,229,0.05)_0%,rgba(11,19,38,1)_85%)] dark:block hidden" />
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

            <h1 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl md:text-6xl font-bold tracking-tighter dark:text-slate-100 text-slate-900 mb-3 leading-tight">
              Species Database
            </h1>

            <p className="dark:text-slate-400 text-slate-500 text-lg mb-8 max-w-2xl">
              Browse viral species available in the repository and explore their associated genomic data.
            </p>

            {data && (
              <div className="inline-block [&>*]:!dark:bg-slate-700 [&>*]:!bg-white [&>*]:!border [&>*]:!dark:border-slate-600 [&>*]:!border-slate-200 [&_p]:!dark:text-slate-100 [&_p]:!text-slate-700 [&_span]:!text-cyan-400 [&_*]:!opacity-100 shadow-md rounded-xl">
                <StatsBadge totalSpecies={data.total_species} totalSequences={data.total_sequences} />
              </div>
            )}
          </div>
        </section>

        {/* CONTENT */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">

          {/* TOOLBAR */}
          <div className="dark:bg-slate-700/90 bg-white backdrop-blur-xl rounded-2xl border dark:border-slate-600 border-slate-200 shadow-xl p-4 sm:p-6 mb-8 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm dark:text-slate-100 text-slate-700 font-medium">Sort by:</span>
              {sortButton('frequency', 'Most Frequent')}
              {sortButton('az', 'A–Z')}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={genomesApi.downloadMetadata}
                aria-label="Download metadata CSV"
                className="inline-flex items-center gap-2 px-5 min-h-11 py-3 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 rounded-xl text-sm font-semibold border border-cyan-400/50 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <DownloadIcon /> CSV
              </button>
              <button
                onClick={genomesApi.downloadAllFasta}
                aria-label="Download all FASTA sequences"
                className="inline-flex items-center gap-2 px-5 min-h-11 py-3 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 rounded-xl text-sm font-semibold border border-emerald-400/50 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <DownloadIcon /> FASTA
              </button>

              <div className="flex flex-wrap md:flex-nowrap items-stretch">
                <div className="[&>div]:!dark:bg-slate-600/80 [&>div]:!bg-slate-100 [&_input]:!bg-transparent [&_input]:!dark:text-white [&_input]:!text-slate-900 [&_input]:!dark:placeholder:text-slate-300 [&_input]:!placeholder:text-slate-400 [&_input]:!dark:border-slate-500 [&_input]:!border-slate-300 [&_*]:!dark:border-slate-500 [&_*]:!border-slate-300">
                  <Autocomplete value={search} onChange={setSearch} onSelect={handleSearch} />
                </div>
                <button
                  onClick={() => handleSearch(search)}
                  aria-label="Search species"
                  className="px-6 min-h-11 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-900 rounded-r-xl text-sm font-bold transition-all border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          {data && (
            <>
              {data.results.length === 0 ? (
                <EmptyState
                  title="No species found"
                  description="Try a different search query or clear filters to see more results."
                />
              ) : null}

              <div className="dark:bg-slate-700 bg-white rounded-xl shadow-xl border dark:border-slate-600 border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead>
                      <tr>
                        {['Species', 'Family', 'Genus', 'Sequences'].map((h) => (
                          <th scope="col" key={h} className="dark:bg-slate-600 bg-slate-100 font-semibold dark:text-white text-slate-700 uppercase text-xs tracking-wider px-6 py-4 border-b dark:border-slate-500 border-slate-200 shadow-sm">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.results.map((s) => {
                        const slug = s.species.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        return (
                          <tr key={s.id} className="border-b dark:border-slate-600 border-slate-100 last:border-0 dark:hover:bg-slate-600/50 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-[18px]">
                              <button
                                onClick={() => navigate(`/species/${s.id}-${slug}`)}
                                aria-label={`Open species details for ${s.species}`}
                                className="italic font-bold dark:text-white text-slate-800 hover:text-cyan-400 transition-colors text-[0.95rem] bg-transparent border-none cursor-pointer p-0 underline decoration-transparent hover:decoration-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400"
                              >
                                {s.species}
                              </button>
                            </td>
                            <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{s.family ?? '—'}</td>
                            <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{s.genus ?? '—'}</td>
                            <td className="px-6 py-[18px] text-[0.95rem] font-medium dark:text-slate-300 text-slate-600">{s.sequence_count?.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Pagination page={data.page} numPages={data.num_pages} onPageChange={setPage} />
              </div>
            </>
          )}
        </section>
    </PageLayout>
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