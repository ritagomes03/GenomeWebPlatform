import { useEffect } from 'react'
import { api } from '../api/genomes'
import '../styles/species-detail.css'

export default function SequenceModal({ sequence, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const isCncb = sequence.source_db?.toLowerCase().includes('cncb')
  const isBvBrc = sequence.source_db?.toLowerCase().includes('bv-brc')

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>{sequence.accession}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p className="info-section-title">General Information</p>
          <div className="info-grid">
            {[
              ['Organism Name', sequence.organism_name],
              ['Collection Date', sequence.collection_date],
              ['Country', sequence.country],
              ['Source DB', sequence.source_db],
              ['Genome ID', sequence.genome_id],
              ['Molecular Type', sequence.molecular_type],
              ['Completeness', sequence.completeness_flag],
            ].map(([label, val]) => (
              <div key={label} className="info-item">
                <span className="info-label">{label}</span>
                <span className="info-value">{val || '-'}</span>
              </div>
            ))}
          </div>

          <p className="info-section-title">Sequence Metrics</p>
          <div className="info-grid">
            {[
              ['Length (bp)', sequence.length],
              ['GC Content %', sequence.gc_content?.toFixed(2)],
              ['Melting Temp °C', sequence.melting_temp?.toFixed(2)],
              ['Entropy', sequence.entropy?.toFixed(4)],
            ].map(([label, val]) => (
              <div key={label} className="info-item">
                <span className="info-label">{label}</span>
                <span className="info-value">{val ?? '-'}</span>
              </div>
            ))}
          </div>

          <p className="info-section-title">Nucleotide Composition</p>
          <div className="info-grid">
            {[
              ['% Adenine (A)', sequence.pct_a?.toFixed(2)],
              ['% Cytosine (C)', sequence.pct_c?.toFixed(2)],
              ['% Guanine (G)', sequence.pct_g?.toFixed(2)],
              ['% Thymine (T)', sequence.pct_t?.toFixed(2)],
            ].map(([label, val]) => (
              <div key={label} className="info-item">
                <span className="info-label">{label}</span>
                <span className="info-value">{val ?? '-'}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            {isCncb && (
              <button onClick={() => api.downloadCncbFasta(sequence.accession)} className="btn-link">
                ↓ FASTA
              </button>
            )}
            {isBvBrc && (
              <a href={`https://www.bv-brc.org/view/Genome/${sequence.genome_id}`} target="_blank" rel="noopener noreferrer" className="btn-link">
                BV-BRC ↗
              </a>
            )}
            {!isCncb && !isBvBrc && (
              <a href={`https://www.ncbi.nlm.nih.gov/nuccore/${sequence.accession}`} target="_blank" rel="noopener noreferrer" className="btn-link">
                NCBI ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
