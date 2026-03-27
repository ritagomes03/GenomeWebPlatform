const GRAPHS = [
  { key: 'length',       label: 'Length Distribution' },
  { key: 'gc',           label: 'GC Content' },
  { key: 'entropy',      label: 'Entropy' },
  { key: 'melting_temp', label: 'Melting Temp' },
  { key: 'bases_tempo',  label: 'Bases Over Time' },
]

export default function GraphButtons({ taxonomyId, graphsExist, openKeys, onToggle }) {
  const available = GRAPHS.filter(g => graphsExist?.[g.key])
  if (!available.length) return null

  return (
    <div className="flex flex-wrap gap-3">
      {available.map(g => {
        const isOpen = openKeys.includes(g.key)
        return (
          <div
            key={g.key}
            className={`inline-flex items-center bg-white border rounded-lg overflow-hidden shadow-sm transition-colors
              ${isOpen ? 'border-blue-500' : 'border-slate-200 hover:border-blue-500'}`}
          >
            {/* Toggle preview */}
            <button
              onClick={() => onToggle(g.key, g.label)}
              aria-label={`${isOpen ? 'Hide' : 'Preview'} ${g.label} graph`}
              className="flex items-center gap-2 min-h-11 px-4 py-2.5 text-[0.95rem] font-medium text-slate-700 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span aria-hidden="true">📄</span> {g.label}
            </button>

            {/* Direct PDF download */}
            <a
              href={`/api/taxonomy/${taxonomyId}/graph/?type=${g.key}&download=true`}
              className="flex items-center min-h-11 px-3 py-2.5 border-l border-slate-200 bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white transition-all no-underline focus-visible:ring-2 focus-visible:ring-cyan-400"
              title={`Download ${g.label} PDF`}
              aria-label={`Download ${g.label} PDF`}
            >
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        )
      })}
    </div>
  )
}
