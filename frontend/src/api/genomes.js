const BASE = '/api'

export const api = {
  home: () =>
    fetch(`${BASE}/`).then(r => r.json()),

  speciesList: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${BASE}/especies/?${qs}`).then(r => r.json())
  },

  autocomplete: (q) =>
    fetch(`${BASE}/autocomplete/?q=${encodeURIComponent(q)}`).then(r => r.json()),

  speciesDetail: async (id, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    const r = await fetch(`${BASE}/${id}/?${qs}`)
    return await r.json()
  },

  downloadGlobalFasta:    () => window.location.href = `${BASE}/download-fasta-global/`,
  downloadGlobalMetadata: () => window.location.href = `${BASE}/download-metadata-global/`,
  downloadSpeciesZip:     (id) => window.location.href = `${BASE}/${id}/download-zip/`,
  downloadGraph:          (id, type) => window.location.href = `${BASE}/${id}/download/${type}/`,
  downloadCncbFasta:      (accession) => window.location.href = `${BASE}/download-fasta-cncb/${accession}/`,
}
