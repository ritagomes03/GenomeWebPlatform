export default function Pagination({ page, numPages, onPageChange }) {
  if (numPages <= 1) return null

  const btn = "px-3 sm:px-4 min-h-11 py-2 bg-white border border-slate-200 text-slate-700 rounded-md font-medium text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"

  return (
    <nav className="mt-6 flex justify-center items-center gap-2 flex-wrap" aria-label="Pagination">
      {page > 1 && <>
        <button className={btn} onClick={() => onPageChange(1)} aria-label="Go to first page">« First</button>
        <button className={btn} onClick={() => onPageChange(page - 1)} aria-label={`Go to previous page ${page - 1}`}>Previous</button>
      </>}
      <span className="px-4 py-2 text-slate-500 text-sm" aria-live="polite">Page <span aria-current="page">{page}</span> of {numPages}</span>
      {page < numPages && <>
        <button className={btn} onClick={() => onPageChange(page + 1)} aria-label={`Go to next page ${page + 1}`}>Next</button>
        <button className={btn} onClick={() => onPageChange(numPages)} aria-label="Go to last page">Last »</button>
      </>}
    </nav>
  )
}
