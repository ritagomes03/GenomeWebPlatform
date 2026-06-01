export default function StatsBadge({ totalSpecies, totalSequences }) {
  return (
    <div className="inline-flex gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm shadow-sm">
      <span>Total Species: <strong className="text-blue-500 font-bold">{totalSpecies?.toLocaleString()}</strong></span>
      <span>Total Sequences: <strong className="text-blue-500 font-bold">{totalSequences?.toLocaleString()}</strong></span>
    </div>
  )
}
