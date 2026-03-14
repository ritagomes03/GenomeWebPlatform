import { useEffect } from 'react'

const fmt = (val, dec = 2) => (val != null ? Number(val).toFixed(dec) : '—')

export default function SequenceModal({ sequence, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!sequence) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90%] max-w-[650px] max-h-[90vh] rounded-[20px] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="m-0 text-[1.25rem] text-slate-900 font-mono font-bold">{sequence.accession}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <h4 className="text-base text-blue-500 font-bold m-0 mb-4 border-b-2 border-blue-50 pb-2">General Information</h4>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
            <InfoItem label="Organism Name" value={sequence.organism_name} />
            <InfoItem label="Collection Date" value={sequence.collection_date} />
            <InfoItem label="Country" value={sequence.country} />
            <InfoItem label="Source DB" value={sequence.source_db} />
            <InfoItem label="Genome ID" value={sequence.genome_id} />
            <InfoItem label="Molecular Type" value={sequence.molecular_type} />
            <InfoItem label="Completeness" value={sequence.completeness_flag} />
          </div>

          <h4 className="text-base text-blue-500 font-bold m-0 mb-4 border-b-2 border-blue-50 pb-2">Sequence Metrics</h4>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
            <InfoItem label="Length (bp)" value={sequence.metrics?.length} />
            <InfoItem label="GC Content (%)" value={fmt(sequence.metrics?.gc_content)} />
            <InfoItem label="Melting Temp (°C)" value={fmt(sequence.metrics?.melting_temp)} />
            <InfoItem label="Entropy" value={fmt(sequence.metrics?.entropy, 4)} />
          </div>

          <h4 className="text-base text-blue-500 font-bold m-0 mb-4 border-b-2 border-blue-50 pb-2">Nucleotide Composition</h4>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
            <InfoItem label="% Adenine (A)" value={fmt(sequence.metrics?.pct_a)} />
            <InfoItem label="% Cytosine (C)" value={fmt(sequence.metrics?.pct_c)} />
            <InfoItem label="% Guanine (G)" value={fmt(sequence.metrics?.pct_g)} />
            <InfoItem label="% Thymine (T)" value={fmt(sequence.metrics?.pct_t)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{label}</span>
      <span className="text-[0.95rem] text-slate-900 font-medium break-words">{value ?? '—'}</span>
    </div>
  )
}