export default function StatCard({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <strong className="block text-slate-500 text-[0.85rem] uppercase tracking-wide font-semibold mb-2">
        {label}
      </strong>
      <span className="text-[1.2rem] font-semibold text-slate-900">{value ?? '—'}</span>
    </div>
  )
}
