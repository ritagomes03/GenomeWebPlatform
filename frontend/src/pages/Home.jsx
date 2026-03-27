import { useHome, useAutocomplete } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'


export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const { data: suggestions = [] } = useAutocomplete(query)
  const open = isFocused && !isDismissed && query.trim().length >= 1 && suggestions.length > 0

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function submit(value) {
    const clean = value.trim()
    if (!clean) return
    navigate(`/species?q=${encodeURIComponent(clean)}`)
    setIsFocused(false)
    setIsDismissed(false)
  }

  return (
    <div className="relative max-w-4xl mx-auto w-full" ref={containerRef}>
      <div
        className={`dark:bg-slate-800/90 bg-white/90 backdrop-blur-xl p-2 rounded-xl border flex items-center transition-all duration-300 ${
          open
            ? 'border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
            : 'dark:border-slate-700/50 border-slate-300/50 shadow-lg dark:hover:border-slate-500 hover:border-slate-400'
        }`}
      >
        <span className="px-4 text-cyan-400 text-xl">🧬</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsDismissed(false)
          }}
          onFocus={() => {
            setIsFocused(true)
            setIsDismissed(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit(query)
            if (e.key === 'Escape') {
              setIsFocused(false)
              setIsDismissed(true)
            }
          }}
          placeholder="Enter viral name, specie, or family..."
          autoComplete="off"
          aria-label="Search species by viral name, species, or family"
          className="bg-transparent border-none outline-none flex-1 dark:text-slate-100 text-slate-900 dark:placeholder:text-slate-500 placeholder:text-slate-400 py-3 text-base w-full pr-4"
        />
      </div>

      {open && (
        <div className="absolute top-[calc(100%+10px)] left-0 right-0 dark:bg-slate-800/95 bg-white/95 backdrop-blur-xl rounded-xl border border-cyan-400/50 shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-50 max-h-[70vh] overflow-y-auto py-2 text-left" role="listbox" aria-label="Search suggestions">
          {suggestions.map((s, index) => (
            <button
              key={index}
              onClick={() => { setQuery(s); submit(s) }}
              role="option"
              className="w-full text-left px-6 py-3.5 dark:text-slate-300 text-slate-700 transition-colors dark:hover:bg-slate-700/60 hover:bg-slate-100 hover:text-cyan-400 flex items-center gap-3 dark:border-b dark:border-slate-700/30 border-b border-slate-200/50 last:border-0 focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span className="dark:text-slate-500 text-slate-400 text-sm">🔍</span>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


function SpeciesCard({ species, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={`Open details for ${species.species}`}
      className="group dark:bg-slate-800 bg-white p-6 rounded-xl border dark:border-slate-700/30 border-slate-200 hover:-translate-y-2 hover:border-cyan-400/40 transition-all duration-300 cursor-pointer shadow-sm text-left w-full focus-visible:ring-2 focus-visible:ring-cyan-400"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="w-12 h-12 bg-cyan-400/10 text-cyan-400 rounded-full flex items-center justify-center text-xl">
          🦠
        </div>
        <span className="dark:bg-slate-700/60 bg-slate-100 px-2 py-1 rounded text-[10px] dark:text-slate-400 text-slate-500 font-semibold uppercase tracking-wider">
          Species
        </span>
      </div>

      <h5 className="text-lg font-bold dark:text-slate-100 text-slate-900 mb-1 italic">
        {species.species}
      </h5>

      <p className="text-xs dark:text-slate-400 text-slate-500 mb-6">
      {species.family ?? '—'}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold dark:text-slate-100 text-slate-900">
          {species.sequence_count?.toLocaleString()}
        </span>
        <span className="text-[10px] uppercase font-semibold dark:text-slate-500 text-slate-400 tracking-wider">
          Samples
        </span>
      </div>

      <div className="mt-4 h-1 dark:bg-slate-700 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-400 w-[70%]" />
      </div>
    </button>
  )
}


export default function Home() {
  const { data, isLoading, error } = useHome()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <PageLayout>
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
          <Skeleton className="h-14 max-w-4xl mx-auto" />
          <Skeleton className="h-14 max-w-3xl mx-auto" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </section>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <section className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <EmptyState
            title="Unable to load the home dashboard"
            description="Please refresh the page and try again."
          />
        </section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>

        {/* HERO */}
        <section className="relative min-h-screen md:min-h-[870px] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img src="/virus-750.jpg" alt="Virus background" className="absolute inset-0 w-full h-full object-cover dark:opacity-30 opacity-20" />
            <div className="absolute inset-0 dark:bg-[#0b1326]/32 bg-white/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,229,0.08)_0%,rgba(11,19,38,0.62)_78%)] dark:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07101d]/20 via-transparent to-[#0b1326]/35 dark:block hidden" />
          </div>

          <div className="relative z-30 max-w-5xl w-full text-center">
            <h1 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl md:text-6xl font-bold tracking-tighter dark:text-slate-100 text-slate-900 mb-8 leading-[1.1]">
              Curated, standardized and analysis-ready human viral genome database
            </h1>
            <div className="mt-12 mb-16"><SearchBar /></div>
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark:bg-slate-800 bg-white p-8 rounded-xl border-l-4 border-cyan-400 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] dark:text-slate-400 text-slate-500 mb-2 font-semibold">Human Viral Species</p>
              <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-5xl font-bold dark:text-slate-100 text-slate-900">{data?.total_species?.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm"><span>↗</span><span>Species catalogued in the database</span></div>
            </div>
            <div className="dark:bg-slate-800 bg-white p-8 rounded-xl border-l-4 border-emerald-400 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] dark:text-slate-400 text-slate-500 mb-2 font-semibold">Genomic Sequences</p>
              <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-5xl font-bold dark:text-slate-100 text-slate-900">{data?.total_sequences?.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm"><span>↗</span><span>Sequences stored in the database</span></div>
            </div>
          </div>
        </section>

        {/* ACTION HUB */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <h3 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold mb-12 tracking-tight flex items-center gap-3 dark:text-slate-100 text-slate-900">
            <span className="w-8 h-1 bg-cyan-400 rounded-full"></span>Primary Action Hub
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <button onClick={() => navigate('/species')} type="button" aria-label="Open repository explorer" className="group relative dark:bg-slate-800 bg-white rounded-xl p-8 overflow-hidden dark:hover:bg-slate-700/80 hover:bg-slate-50 transition-all duration-500 cursor-pointer border dark:border-slate-700/20 border-slate-200 shadow-sm text-left focus-visible:ring-2 focus-visible:ring-cyan-400">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">🔍</div>
                <h4 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold dark:text-slate-100 text-slate-900 mb-3">Repository Explorer</h4>
                <p className="dark:text-slate-400 text-slate-500 text-sm leading-relaxed mb-8">Navigate the deep architecture of viral genomes with our advanced search and visualization suite.</p>
                <span className="text-cyan-400 font-bold text-sm flex items-center gap-2">Explore Database <span>→</span></span>
              </div>
            </button>
            <button onClick={genomesApi.downloadAllFasta} type="button" aria-label="Download complete FASTA dataset" className="group relative dark:bg-slate-800 bg-white rounded-xl p-8 overflow-hidden dark:hover:bg-slate-700/80 hover:bg-slate-50 transition-all duration-500 cursor-pointer border dark:border-slate-700/20 border-slate-200 shadow-sm text-left focus-visible:ring-2 focus-visible:ring-cyan-400">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">⬇</div>
                <h4 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold dark:text-slate-100 text-slate-900 mb-3">Export FASTA</h4>
                <p className="dark:text-slate-400 text-slate-500 text-sm leading-relaxed mb-8">Download the complete curated viral genome collection for downstream research workflows.</p>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">Export Dataset <span>↓</span></span>
              </div>
            </button>
            <button onClick={() => navigate('/analysis')} type="button" aria-label="Open FASTA analysis tool" className="group relative dark:bg-slate-800 bg-white rounded-xl p-8 overflow-hidden dark:hover:bg-slate-700/80 hover:bg-slate-50 transition-all duration-500 cursor-pointer border dark:border-slate-700/20 border-slate-200 shadow-sm text-left focus-visible:ring-2 focus-visible:ring-cyan-400">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-purple-400/10 flex items-center justify-center text-purple-300 mb-6 group-hover:scale-110 transition-transform">📊</div>
                <h4 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold dark:text-slate-100 text-slate-900 mb-3">Analyze FASTA</h4>
                <p className="dark:text-slate-400 text-slate-500 text-sm leading-relaxed mb-8">Upload your sequencing data for immediate taxonomic identification and comparative analysis.</p>
                <span className="text-purple-300 font-bold text-sm flex items-center gap-2">Begin Analysis <span>↑</span></span>
              </div>
            </button>
          </div>
        </section>

        {/* SPECIES SHOWCASE */}
        <section className="dark:bg-slate-950/40 bg-slate-100/40 py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="max-w-xl">
                <h3 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl font-bold dark:text-slate-100 text-slate-900 mb-4">Species Showcase</h3>
                <p className="dark:text-slate-400 text-slate-500 text-lg">Species with the highest number of genomic sequences currently recorded in the database.</p>
              </div>
              <button onClick={() => navigate('/species')} className="text-cyan-400 text-sm uppercase tracking-widest border-b border-cyan-400 pb-1 hover:text-cyan-300 hover:border-cyan-300 transition-all">View all taxa</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.top_species?.map((s) => (
                <SpeciesCard key={s.id} species={s} onClick={() => navigate(`/species/${s.id}-${s.species.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)} />
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 border-t dark:border-slate-700/20 border-slate-200/50">
          <div className="max-w-screen-2xl mx-auto flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.3em] dark:text-slate-500 text-slate-400 mb-12 font-semibold">Official Data Pipeline Integration</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {[
                { name: 'NCBI', url: 'https://www.ncbi.nlm.nih.gov/', desc: 'National Center for Biotechnology Information' },
                { name: 'BV-BRC', url: 'https://www.bv-brc.org/', desc: 'Bacterial and Viral Bioinformatics Resource Center' },
                { name: 'CNCB', url: 'https://ngdc.cncb.ac.cn/', desc: 'China National Center for Bioinformation' }
              ].map((src) => (
                <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer" className="dark:bg-slate-800 bg-white p-6 rounded-xl border dark:border-slate-700/30 border-slate-200 block transition-all hover:border-cyan-400/40 hover:-translate-y-1 shadow-sm">
                  <h4 className="m-0 mb-2 text-cyan-400 text-[1.25rem] font-extrabold text-center">{src.name}</h4>
                  <p className="m-0 dark:text-slate-400 text-slate-500 text-[0.9rem] text-center">{src.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      

      {/* FOOTER */}
      <footer className="dark:bg-slate-700/90 bg-slate-200/90 w-full border-t dark:border-slate-600 border-slate-300">
        <div className="max-w-screen-2xl mx-auto px-12">
          <div className="py-8 flex flex-wrap items-center justify-center gap-16 md:gap-24">
            <img src="/uh.png" alt="University of Helsinki" className="object-contain h-32 opacity-100 transition-all hover:scale-105" />
            <img src="/ua.png" alt="University of Aveiro" className="object-contain h-32 opacity-100 transition-all hover:scale-105" />
          </div>
        </div>
      </footer>
    </PageLayout>
  )
}