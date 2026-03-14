export default function GraphPreviewCard({ taxonomyId, graphKey, label, onClose }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
        <span className="font-semibold text-slate-900 text-sm">{label} — Preview</span>
        <button
          onClick={onClose}
          className="text-2xl leading-none text-slate-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* PDF iframe */}
      <iframe
        src={`/api/taxonomy/${taxonomyId}/graph/?type=${graphKey}`}
        className="w-full h-[450px] border-none block flex-1 bg-white"
        title={label}
      />
    </div>
  )
}
