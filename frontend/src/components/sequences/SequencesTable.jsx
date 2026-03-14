import Spinner from '../ui/Spinner'
import { genomesApi } from '../../api/genomes'

const fmt = (val, dec = 2) => (val != null ? Number(val).toFixed(dec) : '—')

function SourceLink({ sourceDb, genomeId, accession }) {
  const db = sourceDb?.toLowerCase() ?? ''
  const cls = "inline-flex items-center gap-1 bg-slate-50 text-blue-600 border border-slate-200 px-3 py-1.5 rounded-md text-[0.85rem] font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all no-underline"

  if (db.includes('bv-brc') || db.includes('bvbrc'))
    return <a href={`https://www.bv-brc.org/view/Genome/${genomeId}`} target="_blank" rel="noreferrer" className={cls}>BV-BRC ↗</a>
  if (db.includes('ncbi'))
    return <a href={`https://www.ncbi.nlm.nih.gov/nuccore/${accession}`} target="_blank" rel="noreferrer" className={cls}>NCBI ↗</a>
  return <span className="text-slate-400 text-[0.85rem]">—</span>
}

export default function SequencesTable({ sequences, loading, availableYears, year, onYearChange }) {
  const th = "bg-slate-50 font-semibold text-slate-500 uppercase text-xs tracking-wide px-6 py-4 border-b border-slate-200"

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className={th}>Accession</th>
              <th className={th}>Country</th>

              {/* Date + year filter inline */}
              <th className={th}>
                <div className="flex items-center gap-2">
                  Date
                  {availableYears?.length > 0 && (
                    <select
                      value={year}
                      onChange={e => onYearChange(e.target.value)}
                      className="px-2 py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 bg-white cursor-pointer outline-none normal-case tracking-normal"
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
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center">
                  <Spinner />
                </td>
              </tr>
            ) : !sequences?.length ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                  No sequences found.
                </td>
              </tr>
            ) : sequences.map(s => (
              <tr key={s.accession} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-600 font-semibold text-[0.95rem]">{s.accession}</td>
                <td className="px-6 py-4 text-[0.95rem]">{s.country ?? '—'}</td>
                <td className="px-6 py-4 text-[0.95rem] whitespace-nowrap">{s.collection_date ?? '—'}</td>
                <td className="px-6 py-4 text-[0.95rem]">{s.metrics?.length ?? '—'}</td>
                <td className="px-6 py-4 text-[0.95rem]">{fmt(s.metrics?.entropy)}</td>
                <td className="px-6 py-4 text-[0.95rem]">{fmt(s.metrics?.gc_content)}</td>
                <td className="px-6 py-4 text-[0.95rem]">{fmt(s.metrics?.melting_temp)}</td>
                <td className="px-6 py-4">
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
