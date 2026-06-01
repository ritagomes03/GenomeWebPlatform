export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/70 ${className}`} />
}
