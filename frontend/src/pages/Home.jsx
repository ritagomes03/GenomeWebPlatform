import { useHome, useAutocomplete } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'

function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const { data: suggestions = [] } = useAutocomplete(query)

  useEffect(() => {
    setOpen(query.trim().length >= 1 && suggestions.length > 0)
  }, [query, suggestions])

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }

    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  function submit(value) {
    const clean = value.trim()
    if (!clean) return
    navigate(`/species?q=${encodeURIComponent(clean)}`)
    setOpen(false)
  }

  return (
    <div className="relative max-w-4xl mx-auto" ref={ref}>
      <div className="bg-slate-800/70 backdrop-blur-xl p-2 rounded-xl border border-slate-700/40 shadow-2xl flex items-center transition-all hover:border-cyan-400/30 focus-within:border-cyan-400/40">
        <span className="px-4 text-cyan-400 text-xl">🧬</span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(query)}
          placeholder="Enter viral name, taxonomy ID, or sequence fragment..."
          autoComplete="off"
          className="bg-transparent border-none outline-none focus:ring-0 flex-1 text-slate-100 placeholder:text-slate-400 py-4 text-base"
        />

        <kbd className="hidden md:flex items-center gap-1 px-3 py-1 bg-slate-700/70 rounded-lg text-[10px] text-slate-400 mr-2 font-semibold">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </div>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.35)] z-50 max-h-72 overflow-y-auto text-left">
          {suggestions.map((s) => (
            <div
              key={s}
              onClick={() => {
                setQuery(s)
                submit(s)
              }}
              className="px-5 py-3.5 cursor-pointer border-b border-slate-800 last:border-0 text-slate-300 transition-all hover:bg-slate-800 hover:text-cyan-400 hover:pl-6"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SpeciesCard({ species, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-slate-800 p-6 rounded-xl border border-slate-700/30 hover:-translate-y-2 hover:border-cyan-400/40 transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="w-12 h-12 bg-cyan-400/10 text-cyan-400 rounded-full flex items-center justify-center text-xl">
          🦠
        </div>

        <span className="bg-slate-700/60 px-2 py-1 rounded text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          Species
        </span>
      </div>

      <h5 className="text-lg font-bold text-slate-100 mb-1 italic">
        {species.species}
      </h5>

      <p className="text-xs text-slate-400 mb-6">
        Documented viral genome entries
      </p>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-slate-100">
          {species.sequence_count?.toLocaleString()}
        </span>
        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          Samples
        </span>
      </div>

      <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-400 w-[70%]" />
      </div>
    </div>
  )
}

export default function Home() {
  const { data, isLoading, error } = useHome()
  const navigate = useNavigate()

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
        Failed to load data.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-100 font-[Manrope,system-ui,sans-serif] selection:bg-cyan-400/30 selection:text-cyan-300">
      <nav className="bg-[#0b1326]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-700/20 shadow-[0_0_40px_rgba(218,226,253,0.06)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold tracking-tight text-slate-100 font-[Space_Grotesk,system-ui,sans-serif]">
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
        </div>
      </nav>

      <main className="relative overflow-hidden">
        <section className="relative min-h-[870px] flex flex-col items-center justify-center px-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src="/virus-750.jpg"
              alt="Virus background"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] object-cover rounded-full opacity-60 blur-[0.5px] scale-110"
            />

            <div className="absolute inset-0 bg-[#0b1326]/32" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,229,0.08)_0%,rgba(11,19,38,0.62)_78%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07101d]/20 via-transparent to-[#0b1326]/35" />
          </div>

          <div className="relative z-10 max-w-5xl w-full text-center">
            <h1 className="font-[Space_Grotesk,system-ui,sans-serif] text-5xl md:text-8xl font-bold tracking-tighter text-slate-100 mb-8 leading-[1.1]">
              Exploration of Human
              <br />
              Viral Architectures
            </h1>

            <div className="mt-12 mb-16">
              <SearchBar />
            </div>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-8 -mt-24 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-8 rounded-xl border-l-4 border-cyan-400 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2 font-semibold">
                Taxonomies Documented
              </p>

              <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-5xl font-bold text-slate-100">
                {data?.total_species?.toLocaleString()}
              </h2>

              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
                <span>↗</span>
                <span>Indexed species repository</span>
              </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-xl border-l-4 border-emerald-400 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2 font-semibold">
                Sequences Indexed
              </p>

              <h2 className="font-[Space_Grotesk,system-ui,sans-serif] text-5xl font-bold text-slate-100">
                {data?.total_sequences?.toLocaleString()}
              </h2>

              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
                <span>🗃️</span>
                <span>Verified sequence repository</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-8 py-24">
          <h3 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold mb-12 tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-cyan-400 rounded-full"></span>
            Primary Action Hub
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/species')}
              className="group relative bg-slate-800 rounded-xl p-8 overflow-hidden hover:bg-slate-700/80 transition-all duration-500 cursor-pointer border border-slate-700/20"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  🔍
                </div>

                <h4 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold text-slate-100 mb-3">
                  Repository Explorer
                </h4>

                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Navigate the deep architecture of viral genomes with our advanced search and visualization suite.
                </p>

                <span className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                  Launch Discovery <span>→</span>
                </span>
              </div>
            </div>

            <div
              onClick={genomesApi.downloadAllFasta}
              className="group relative bg-slate-800 rounded-xl p-8 overflow-hidden hover:bg-slate-700/80 transition-all duration-500 cursor-pointer border border-slate-700/20"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  ⬇
                </div>

                <h4 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold text-slate-100 mb-3">
                  Export FASTA
                </h4>

                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Download the complete curated viral genome collection for downstream research workflows.
                </p>

                <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  Export Dataset <span>↓</span>
                </span>
              </div>
            </div>

            <div
              onClick={() => navigate('/analysis')}
              className="group relative bg-slate-800 rounded-xl p-8 overflow-hidden hover:bg-slate-700/80 transition-all duration-500 cursor-pointer border border-slate-700/20"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-purple-400/10 flex items-center justify-center text-purple-300 mb-6 group-hover:scale-110 transition-transform">
                  📊
                </div>

                <h4 className="font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold text-slate-100 mb-3">
                  Analyze FASTA
                </h4>

                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Upload your sequencing data for immediate taxonomic identification and comparative analysis.
                </p>

                <span className="text-purple-300 font-bold text-sm flex items-center gap-2">
                  Begin Analysis <span>↑</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-950/40 py-24 px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="max-w-xl">
                <h3 className="font-[Space_Grotesk,system-ui,sans-serif] text-4xl font-bold text-slate-100 mb-4">
                  Species Showcase
                </h3>

                <p className="text-slate-400 text-lg">
                  Species with the largest number of genomic sequences currently indexed in the repository.
                </p>
              </div>

              <button
                onClick={() => navigate('/species')}
                className="text-cyan-400 text-sm uppercase tracking-widest border-b border-cyan-400 pb-1 hover:text-slate-100 hover:border-slate-100 transition-all"
              >
                View all taxa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.top_species?.length === 0 && (
                <p className="col-span-full text-center text-slate-500">
                  Waiting for sequencing data...
                </p>
              )}

              {data?.top_species?.map((s) => {
                const slug = s.species.toLowerCase().replace(/[^a-z0-9]+/g, '-')

                return (
                  <SpeciesCard
                    key={s.id}
                    species={s}
                    onClick={() => navigate(`/species/${s.id}-${slug}`)}
                  />
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-24 px-8 border-t border-slate-700/20">
          <div className="max-w-screen-2xl mx-auto flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-12 font-semibold">
              Official Data Pipeline Integration
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {[
                {
                  name: 'NCBI',
                  desc: 'National Center for Biotechnology Information',
                  url: 'https://www.ncbi.nlm.nih.gov/',
                },
                {
                  name: 'BV-BRC',
                  desc: 'Bacterial and Viral Bioinformatics Resource Center',
                  url: 'https://www.bv-brc.org/',
                },
                {
                  name: 'CNCB',
                  desc: 'China National Center for Bioinformation',
                  url: 'https://ngdc.cncb.ac.cn/',
                },
              ].map((src) => (
                <a
                  key={src.name}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 p-6 rounded-xl border border-slate-700/30 block transition-all duration-300 hover:border-cyan-400/40 hover:-translate-y-1 no-underline"
                >
                  <h4 className="m-0 mb-2 text-cyan-400 text-[1.25rem] font-extrabold text-center">
                    {src.name}
                  </h4>

                  <p className="m-0 text-slate-400 text-[0.9rem] text-center">
                    {src.desc}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#131b2e] w-full py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-screen-2xl mx-auto border-t border-slate-700/20 pt-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-[Space_Grotesk,system-ui,sans-serif] font-bold text-slate-100">
              ViromeGenomics
            </div>

            <p className="text-xs tracking-wide uppercase text-slate-400 text-center md:text-left">
              © 2026 ViromeGenomics Observatory. Data powered by NCBI, BV-BRC, and CNCB.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <button className="text-xs tracking-wide uppercase text-slate-400 hover:text-cyan-400 transition-colors">
              Privacy Policy
            </button>
            <button className="text-xs tracking-wide uppercase text-slate-400 hover:text-cyan-400 transition-colors">
              Terms of Service
            </button>
            <button className="text-xs tracking-wide uppercase text-slate-400 hover:text-cyan-400 transition-colors">
              API Documentation
            </button>
            <button className="text-xs tracking-wide uppercase text-slate-400 hover:text-cyan-400 transition-colors">
              Contact Research Team
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}