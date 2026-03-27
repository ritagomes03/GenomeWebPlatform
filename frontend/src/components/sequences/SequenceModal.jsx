import { useEffect, useRef } from 'react'

export default function SequenceModal({ sequence, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!sequence) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [sequence, onClose])

  if (!sequence) return null

  const modalTitleId = 'sequence-modal-title'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="bg-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-500 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        onClick={(event) => event.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-500 bg-slate-700 sticky top-0 z-10">
          <h2 id={modalTitleId} className="text-2xl font-bold text-white font-[Space_Grotesk,system-ui,sans-serif]">
            {sequence.accession || sequence.genome_id || 'Sequence Details'}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close sequence details"
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-600 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 font-[Manrope,system-ui,sans-serif]">
          
          {/* General Information */}
          <section>
            <h3 className="text-cyan-300 text-lg font-bold mb-4 border-b border-slate-500 pb-2">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Organism Name</div>
                <div className="text-white text-[0.95rem]">{sequence.organism_name ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Collection Date</div>
                <div className="text-white text-[0.95rem]">{sequence.collection_date ?? sequence.date ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Country</div>
                <div className="text-white text-[0.95rem]">{sequence.country ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Source DB</div>
                <div className="text-white text-[0.95rem]">{sequence.source_db ?? 'NCBI'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Genome ID</div>
                <div className="text-white text-[0.95rem]">{sequence.genome_id ?? sequence.accession ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Molecular Type</div>
                <div className="text-white text-[0.95rem]">{sequence.molecular_type ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Completeness</div>
                <div className="text-white text-[0.95rem]">{sequence.completeness ?? '—'}</div>
              </div>
            </div>
          </section>

          {/* Sequence Metrics */}
          <section>
            <h3 className="text-cyan-300 text-lg font-bold mb-4 border-b border-slate-500 pb-2">
              Sequence Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Length (bp)</div>
                <div className="text-white text-[0.95rem]">{sequence.length ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">GC Content (%)</div>
                <div className="text-white text-[0.95rem]">{sequence.gc_content ?? sequence.gc ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Melting Temp (°C)</div>
                <div className="text-white text-[0.95rem]">{sequence.melting_temp ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">Entropy</div>
                <div className="text-white text-[0.95rem]">{sequence.entropy ?? '—'}</div>
              </div>
            </div>
          </section>

          {/* Nucleotide Composition */}
          <section>
            <h3 className="text-cyan-300 text-lg font-bold mb-4 border-b border-slate-500 pb-2">
              Nucleotide Composition
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">% Adenine (A)</div>
                <div className="text-white text-[0.95rem]">{sequence.perc_a ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">% Cytosine (C)</div>
                <div className="text-white text-[0.95rem]">{sequence.perc_c ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">% Guanine (G)</div>
                <div className="text-white text-[0.95rem]">{sequence.perc_g ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 mb-1 font-semibold">% Thymine (T)</div>
                <div className="text-white text-[0.95rem]">{sequence.perc_t ?? '—'}</div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}