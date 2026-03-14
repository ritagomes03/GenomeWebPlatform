import { useHome } from '../hooks/useGenomes'
import { useAutocomplete } from '../hooks/useGenomes'
import { genomesApi } from '../api/genomes'
import { useState, useEffect, useRef } from 'react'
import Spinner from '../components/ui/Spinner'

function SearchBar({ navigate }) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref = useRef(null)

  const { data: suggestions = [] } = useAutocomplete(query)

  useEffect(() => {
    setOpen(query.length >= 1 && suggestions.length > 0)
  }, [query, suggestions])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  function submit(value) {
    if (!value.trim()) return
    navigate('list', null, value.trim())
  }

  return (
    <div className="relative max-w-[550px] mx-auto" ref={ref}>
      <div className="flex bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] p-2 transition-colors focus-within:border-blue-500">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit(query)}
          placeholder="Search for virus or strain..."
          autoComplete="off"
          className="flex-1 px-5 py-3 text-base outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        <button
          onClick={() => submit(query)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-7 py-3 rounded-[10px] font-semibold transition-colors"
        >
          Search
        </button>
      </div>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-50 max-h-72 overflow-y-auto text-left">
          {suggestions.map(s => (
            <div
              key={s}
              onClick={() => { setQuery(s); setOpen(false); submit(s) }}
              className="px-5 py-3.5 cursor-pointer border-b border-slate-100 last:border-0 text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-500 hover:pl-6"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home({ navigate }) {
  const { data, isLoading, error } = useHome()

  if (isLoading) return <div className="min-h-screen bg-slate-50"><Spinner /></div>
  if (error)     return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">Failed to load data.</div>

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,system-ui,sans-serif] text-slate-900">

      {/* Hero */}
      <header className="relative px-5 py-[100px] pb-[120px] bg-gradient-to-br from-slate-50 to-sky-100 border-b border-slate-200 text-center overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative z-10 max-w-[1000px] mx-auto">
          <h1 className="text-[3.5rem] font-extrabold tracking-tight text-slate-900 m-0">
            GenomeWebPlatform
          </h1>
          <p className="text-slate-500 text-[1.2rem] mt-3 mb-10 max-w-[600px] mx-auto">
            Advanced exploration of genomic architectures and large-scale viral sequencing analytics.
          </p>
          <SearchBar navigate={navigate} />
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-5">

        {/* Stats — overlap hero */}
        <div className="grid grid-cols-2 gap-6 -mt-[50px] relative z-10">
          <div className="bg-white rounded-[20px] border border-slate-200 shadow p-[30px] text-center">
            <h3 className="text-[2.5rem] font-extrabold text-blue-500 m-0 leading-none">
              {data?.total_species?.toLocaleString()}
            </h3>
            <p className="mt-1 mb-0 text-slate-500 text-xs font-semibold uppercase tracking-widest">Taxonomies</p>
          </div>
          <div className="bg-white rounded-[20px] border border-slate-200 shadow p-[30px] text-center">
            <h3 className="text-[2.5rem] font-extrabold text-blue-500 m-0 leading-none">
              {data?.total_sequences?.toLocaleString()}
            </h3>
            <p className="mt-1 mb-0 text-slate-500 text-xs font-semibold uppercase tracking-widest">Active Sequences</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-3 my-[60px]">
          <button
            onClick={() => navigate('list')}
            className="px-6 py-3 rounded-[10px] border border-slate-200 bg-white text-slate-900 font-semibold transition-all hover:border-blue-500 hover:text-blue-500"
          >
            Explore Repository
          </button>
          <button
            onClick={genomesApi.downloadAllFasta}
            className="px-6 py-3 rounded-[10px] border border-emerald-500 bg-white text-emerald-500 font-semibold transition-all hover:bg-emerald-50"
          >
            Export FASTA
          </button>
        </div>

        {/* Top species */}
        <h2 className="text-[1.75rem] font-bold text-center mb-8">Most Sequenced Species</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-20">
          {data?.top_species?.length === 0 && (
            <p className="col-span-full text-center text-slate-400">Waiting for sequencing data...</p>
          )}
          {data?.top_species?.map(s => (
            <div
              key={s.id}
              onClick={() => navigate('detail', s.id)}
              className="bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-1"
            >
              <span className="text-slate-900 font-bold text-[1.1rem] italic block">{s.species}</span>
              <small className="text-slate-500 text-[0.85rem] mt-1 block">
                {s.sequence_count?.toLocaleString()} documented samples
              </small>
            </div>
          ))}
        </div>

        {/* Data Sources */}
        <h2 className="text-[1.75rem] font-bold text-center mb-8 mt-10">Data Sources</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 pb-20 text-center">
          {[
            { name: 'NCBI',   desc: 'National Center for Biotechnology Information',    url: 'https://www.ncbi.nlm.nih.gov/' },
            { name: 'BV-BRC', desc: 'Bacterial and Viral Bioinformatics Resource Center', url: 'https://www.bv-brc.org/' },
            { name: 'CNCB',   desc: 'China National Center for Bioinformation',          url: 'https://ngdc.cncb.ac.cn/' },
          ].map(src => (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-2xl border border-slate-200 block transition-all duration-300 hover:border-blue-500 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-1 no-underline"
            >
              <h4 className="m-0 mb-2 text-blue-500 text-[1.25rem] font-extrabold">{src.name}</h4>
              <p className="m-0 text-slate-500 text-[0.9rem]">{src.desc}</p>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
