import Spinner from '../ui/Spinner'

const fmt = (val, dec = 2) => (val != null ? Number(val).toFixed(dec) : '—')

function SourceLink({ sourceDb, genomeId, accession }) {
  const db = sourceDb?.toLowerCase() ?? ''
  const cls = "inline-flex items-center gap-1 bg-slate-50 text-blue-600 border border-slate-200 px-3 py-2 rounded-md text-[0.85rem] font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all no-underline focus-visible:ring-2 focus-visible:ring-cyan-400"

  if (db.includes('bv-brc') || db.includes('bvbrc'))
    return <a href={`https://www.bv-brc.org/view/Genome/${genomeId}`} target="_blank" rel="noreferrer" className={cls} aria-label={`Open ${accession} on BV-BRC in a new tab`}>BV-BRC ↗</a>
  if (db.includes('ncbi'))
    return <a href={`https://www.ncbi.nlm.nih.gov/nuccore/${accession}`} target="_blank" rel="noreferrer" className={cls} aria-label={`Open ${accession} on NCBI in a new tab`}>NCBI ↗</a>
  return <span className="text-slate-400 text-[0.85rem]">—</span>
}

export default function SequencesTable({ sequences, loading, availableYears, year, onYearChange, onSequenceClick }) {
  const th = "dark:bg-slate-600 bg-slate-100 font-semibold dark:text-white text-slate-700 uppercase text-xs tracking-wider px-6 py-4 border-b dark:border-slate-500 border-slate-200 shadow-sm"

  return (
    <div className="dark:bg-slate-700 bg-white rounded-xl shadow-xl border dark:border-slate-600 border-slate-200 overflow-hidden">
      <div className="overflow-x-auto" aria-label="Individual sequences table wrapper">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">Individual sequences with metrics and source links</caption>
          <thead>
            <tr>
              <th scope="col" className={th}>Accession</th>
              <th scope="col" className={th}>Country</th>
              <th scope="col" className={th}>
                <div className="flex items-center gap-2">
                  Date
                  {availableYears?.length > 0 && (
                    <select
                      value={year}
                      onChange={e => onYearChange(e.target.value)}
                      aria-label="Filter sequences by collection year"
                      className="px-2 py-1 rounded border dark:border-slate-500 border-slate-200 text-xs font-medium dark:text-slate-100 text-slate-700 dark:bg-slate-600 bg-white cursor-pointer outline-none normal-case tracking-normal focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <option value="">All Years</option>
                      {availableYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  )}
                </div>
              </th>
              {['Length', 'Entropy', '% GC', 'Melting Temp', 'Link'].map(h => (
                <th key={h} scope="col" className={th}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center"><Spinner /></td>
              </tr>
            ) : !sequences?.length ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center dark:text-slate-400 text-slate-400">No sequences found.</td>
              </tr>
            ) : sequences.map(s => (
              <tr key={s.accession} className="border-b dark:border-slate-600 border-slate-100 last:border-0 dark:hover:bg-slate-600/50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-[18px]">
                  <button
                    onClick={() => onSequenceClick(s)}
                    aria-label={`Open details for sequence ${s.accession}`}
                    className="font-mono dark:text-cyan-400 text-cyan-600 font-semibold text-[0.95rem] bg-transparent border-none cursor-pointer p-0 underline decoration-transparent dark:hover:decoration-cyan-400 hover:decoration-cyan-600 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    {s.accession}
                  </button>
                </td>
                <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{s.country ?? '—'}</td>
                <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600 whitespace-nowrap">{s.collection_date ?? '—'}</td>
                <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{s.metrics?.length ?? '—'}</td>
                <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{fmt(s.metrics?.entropy)}</td>
                <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{fmt(s.metrics?.gc_content)}</td>
                <td className="px-6 py-[18px] text-[0.95rem] dark:text-slate-300 text-slate-600">{fmt(s.metrics?.melting_temp)}</td>
                <td className="px-6 py-[18px]">
                  <SourceLink sourceDb={s.source_db} genomeId={s.genome_id} accession={s.accession} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
