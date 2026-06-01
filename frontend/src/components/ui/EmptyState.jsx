export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed dark:border-slate-600 border-slate-300 bg-white/80 dark:bg-slate-800/60 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold dark:text-slate-100 text-slate-900">{title}</h3>
      {description ? <p className="mt-2 text-sm dark:text-slate-300 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
