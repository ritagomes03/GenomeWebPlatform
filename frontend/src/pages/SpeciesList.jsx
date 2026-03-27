import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTaxonomy } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import Autocomplete from '../components/ui/Autocomplete'
import Pagination from '../components/ui/Pagination'
import StatsBadge from '../components/ui/StatsBadge'
import Spinner from '../components/ui/Spinner'
import { ThemeToggle } from '../components/ui/ThemeToggle'


export default function SpeciesList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQuery = searchParams.get('q') || ''
  const [search, setSearch] = useState(initialQuery)
  const [sort, setSort] = useState('frequency')
  const [page, setPage] = useState(1)

  useEffect(() => { window.scrollTo(0, 0) }, [])
  useEffect(() => { setSearch(searchParams.get('q') || '') }, [searchParams])
  useEffect(() => { setPage(1) }, [search, sort])

  const { data, isLoading, error } = useTaxonomy({ q: search, sort, page })

  function handleSearch(s) {
    setSearch(s)
    setPage(1)
    if (s) setSearchParams({ q: s })
    else setSearchParams({})
  }

  const sortButton = (value, label) => (
    <button
      onClick={() => setSort(value)}
      className={`px-4 py-2 rounded-xl text-sm transition-all border ${
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
      <div className="min-h-screen dark:bg-[#0b1326] bg-slate-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen dark:bg-[#0b1326] bg-slate-50 flex items-center justify-center text-red-400">
        Failed to load species.
      </div>
    )
  }

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
          <div className="absolute inset-0 pointer-events-none">
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
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
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
        <section className="max-w-screen-2xl mx-auto px-8 pb-20 relative z-10">

          {/* TOOLBAR */}
          <div className="dark:bg-slate-700/90 bg-white backdrop-blur-xl rounded-2xl border dark:border-slate-600 border-slate-200 shadow-xl p-6 mb-8 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm dark:text-slate-100 text-slate-700 font-medium">Sort by:</span>
              {sortButton('frequency', 'Most Frequent')}
              {sortButton('az', 'A–Z')}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={genomesApi.downloadMetadata}
                className="inline-flex items-center gap-2 px-5 py-3 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 rounded-xl text-sm font-semibold border border-cyan-400/50 transition-all"
              >
                <DownloadIcon /> CSV
              </button>
              <button
                onClick={genomesApi.downloadAllFasta}
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 rounded-xl text-sm font-semibold border border-emerald-400/50 transition-all"
              >
                <DownloadIcon /> FASTA
              </button>

              <div className="flex flex-wrap md:flex-nowrap items-stretch">
                <div className="[&>div]:!dark:bg-slate-600/80 [&>div]:!bg-slate-100 [&_input]:!bg-transparent [&_input]:!dark:text-white [&_input]:!text-slate-900 [&_input]:!dark:placeholder:text-slate-300 [&_input]:!placeholder:text-slate-400 [&_input]:!dark:border-slate-500 [&_input]:!border-slate-300 [&_*]:!dark:border-slate-500 [&_*]:!border-slate-300">
                  <Autocomplete value={search} onChange={setSearch} onSelect={handleSearch} />
                </div>
                <button
                  onClick={() => handleSearch(search)}
                  className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-900 rounded-r-xl text-sm font-bold transition-all border-none cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          {data && (
            <>
              <div className="dark:bg-slate-700 bg-white rounded-xl shadow-xl border dark:border-slate-600 border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr>
                        {['Species', 'Family', 'Genus', 'Sequences'].map((h) => (
                          <th key={h} className="dark:bg-slate-600 bg-slate-100 font-semibold dark:text-white text-slate-700 uppercase text-xs tracking-wider px-6 py-4 border-b dark:border-slate-500 border-slate-200 shadow-sm">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.results.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center dark:text-slate-300 text-slate-500">
                            <SearchIcon /><br />No species found.
                          </td>
                        </tr>
                      ) : (
                        data.results.map((s) => {
                          const slug = s.species.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                          return (
                            <tr key={s.id} className="border-b dark:border-slate-600 border-slate-100 last:border-0 dark:hover:bg-slate-600/50 hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-[18px]">
                                <button
                                  onClick={() => navigate(`/species/${s.id}-${slug}`)}
                                  className="italic font-bold dark:text-white text-slate-800 hover:text-cyan-400 transition-colors text-[0.95rem] bg-transparent border-none cursor-pointer p-0 underline decoration-transparent hover:decoration-cyan-400"
                                >
                                  {s.species}
                                </button>
                              </td>
                              <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{s.family ?? '—'}</td>
                              <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{s.genus ?? '—'}</td>
                              <td className="px-6 py-[18px] text-[0.95rem] font-medium dark:text-slate-300 text-slate-600">{s.sequence_count?.toLocaleString()}</td>
                            </tr>
                          )
                        })
                      )}
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
      </main>
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