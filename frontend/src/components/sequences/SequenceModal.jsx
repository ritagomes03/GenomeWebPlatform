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

  const metrics = sequence?.metrics || {}

  // Nomes corretos do CSV: pct_a, pct_c, pct_g, pct_t
  const pctA = metrics?.pct_a ?? sequence?.pct_a ?? '—'
  const pctC = metrics?.pct_c ?? sequence?.pct_c ?? '—'
  const pctG = metrics?.pct_g ?? sequence?.pct_g ?? '—'
  const pctT = metrics?.pct_t ?? sequence?.pct_t ?? '—'

  const lengthValue = metrics?.length ?? sequence?.length ?? '—'
  const gcValue = metrics?.gc_content ?? sequence?.gc_content ?? sequence?.gc ?? '—'
  const meltingTempValue = metrics?.melting_temp ?? sequence?.melting_temp ?? '—'
  const entropyValue = metrics?.entropy ?? sequence?.entropy ?? '—'

  const modalTitleId = 'sequence-modal-title'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border border-slate-200 bg-white dark:border-slate-500 dark:bg-slate-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white dark:border-slate-500 dark:bg-slate-700 sticky top-0 z-10">
          <h2
            id={modalTitleId}
            className="text-2xl font-bold text-slate-900 dark:text-white font-[Space_Grotesk,system-ui,sans-serif]"
          >
            {sequence?.accession || sequence?.genome_id || 'Sequence Details'}
          </h2>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close sequence details"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-600 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 font-[Manrope,system-ui,sans-serif]">
          <section>
            <h3 className="text-cyan-600 dark:text-cyan-300 text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-500 pb-2">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Organism Name</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{sequence?.organism_name ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Collection Date</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{sequence?.collection_date ?? sequence?.date ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Country</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{sequence?.country ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Source DB</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{sequence?.source_db ?? 'NCBI'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Genome ID</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{sequence?.genome_id ?? sequence?.accession ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Molecular Type</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{sequence?.molecular_type ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Completeness</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{sequence?.completeness ?? '—'}</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-cyan-600 dark:text-cyan-300 text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-500 pb-2">
              Sequence Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Length (bp)</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{lengthValue}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">GC Content (%)</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{gcValue}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Melting Temp (°C)</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{meltingTempValue}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">Entropy</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{entropyValue}</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-cyan-600 dark:text-cyan-300 text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-500 pb-2">
              Nucleotide Composition
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">% Adenine (A)</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{pctA}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">% Cytosine (C)</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{pctC}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">% Guanine (G)</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{pctG}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1 font-semibold">% Thymine (T)</div>
                <div className="text-slate-900 dark:text-white text-[0.95rem]">{pctT}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}