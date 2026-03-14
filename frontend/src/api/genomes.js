const BASE = '/api'
const get = (url) => fetch(url).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })

export const genomesApi = {
  home:           ()         => get(`${BASE}/taxonomy/top/`),
  taxonomy:       (params)   => get(`${BASE}/taxonomy/?${new URLSearchParams(params)}`),
  autocomplete:   (q)        => get(`${BASE}/taxonomy/autocomplete/?q=${encodeURIComponent(q)}`),
  detail:         (id)       => get(`${BASE}/taxonomy/${id}/`),
  sequences:      (id, p)    => get(`${BASE}/taxonomy/${id}/sequences/?${new URLSearchParams(p)}`),
  graphs:         (id)       => get(`${BASE}/taxonomy/${id}/graphs/`),

  downloadZip:      (id)  => { window.location.href = `${BASE}/taxonomy/${id}/download/zip/` },
  downloadGraph:    (id, type) => { window.location.href = `${BASE}/taxonomy/${id}/download/graph/${type}/` },
  downloadFasta:    (acc) => { window.location.href = `${BASE}/sequences/${acc}/download/fasta/` },
  downloadAllFasta: ()    => { window.location.href = `${BASE}/global/download/fasta/` },
  downloadMetadata: ()    => { window.location.href = `${BASE}/global/download/metadata/` },
}
