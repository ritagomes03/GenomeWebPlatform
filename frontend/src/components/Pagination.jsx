export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      {page > 1 && (
        <>
          <button onClick={() => onPage(1)} className="pagination-btn">« First</button>
          <button onClick={() => onPage(page - 1)} className="pagination-btn">Previous</button>
        </>
      )}
      <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {totalPages}</span>
      {page < totalPages && (
        <>
          <button onClick={() => onPage(page + 1)} className="pagination-btn">Next</button>
          <button onClick={() => onPage(totalPages)} className="pagination-btn">Last »</button>
        </>
      )}
    </div>
  )
}
