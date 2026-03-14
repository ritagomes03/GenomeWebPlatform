export default function Pagination({ page, numPages, onPageChange }) {
  if (numPages <= 1) return null

  const btn = "px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md font-medium text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer"

  return (
    <div className="mt-6 flex justify-center items-center gap-2">
      {page > 1 && <>
        <button className={btn} onClick={() => onPageChange(1)}>« First</button>
        <button className={btn} onClick={() => onPageChange(page - 1)}>Previous</button>
      </>}
      <span className="px-4 py-2 text-slate-500 text-sm">Page {page} of {numPages}</span>
      {page < numPages && <>
        <button className={btn} onClick={() => onPageChange(page + 1)}>Next</button>
        <button className={btn} onClick={() => onPageChange(numPages)}>Last »</button>
      </>}
    </div>
  )
}
