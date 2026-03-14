const BASE = '/api'

const get = (url) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(r.statusText)
    return r.json()
  })

const download = (url) => {
  window.location.href = url
}

export const genomesApi = {
  // Stats for the home page
  home: () =>
    get(`${BASE}/global/stats/`),

  // Species list with optional sort, search and pagination
  taxonomy: (params) =>
    get(`${BASE}/taxonomy/?${new URLSearchParams(params)}`),

  // Species name autocomplete
  autocomplete: (q) =>
    get(`${BASE}/taxonomy/autocomplete/?q=${encodeURIComponent(q)}`),

  // Full species detail — includes sequences, graphs_exist, available_years
  detail: (id, params = {}) =>
    get(`${BASE}/taxonomy/${id}/?${new URLSearchParams(params)}`),

  // Downloads
  downloadZip:      (id)        => download(`${BASE}/taxonomy/${id}/download/`),
  downloadGraph:    (id, type)  => download(`${BASE}/taxonomy/${id}/graph/?type=${type}`),
  downloadFasta:    (accession) => download(`${BASE}/sequences/${accession}/fasta/`),
  downloadAllFasta: ()          => download(`${BASE}/global/fasta/`),
  downloadMetadata: ()          => download(`${BASE}/global/metadata/`),
}
