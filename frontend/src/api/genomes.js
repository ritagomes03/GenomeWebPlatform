const BASE = '/api'

const MAX_FILE_BYTES    = 50 * 1024 * 1024 
const MAX_FILE_SIZE_STR = '50MB'
const ALLOWED_EXTENSIONS = new Set(['.fasta', '.fa', '.fna', '.ffn', '.faa', '.frn'])

const parseError = async (response) => {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => ({}))
    return payload.error || payload.detail || payload.message || response.statusText || 'Request failed'
  }

  const text = await response.text().catch(() => '')
  return text.trim() || response.statusText || 'Request failed'
}

const get = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(await parseError(response))
  return response.json()
}

const download = (url) => {
  window.location.href = url
}

const post = async (url, formData) => {
  const response = await fetch(url, { method: 'POST', body: formData })
  if (!response.ok) throw new Error(await parseError(response))
  return response.json()
}

const validateFile = (file) => {
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext))
    throw new Error(`Invalid file type: ${ext}. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`)
  if (file.size > MAX_FILE_BYTES)
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE_STR}.`)
}

const buildForm = async (file, metaOrder = '') => {
  validateFile(file)
  const buffer   = await file.arrayBuffer()
  const snapshot = new File([buffer], file.name, { type: file.type })
  const formData = new FormData()
  formData.append('fasta_file', snapshot)
  if (metaOrder) formData.append('meta_order', metaOrder)
  return formData
}

export const genomesApi = {
  home:             ()              => get(`${BASE}/global/stats/`),
  taxonomy:         (params)        => get(`${BASE}/taxonomy/?${new URLSearchParams(params)}`),
  autocomplete:     (q)             => get(`${BASE}/taxonomy/autocomplete/?q=${encodeURIComponent(q)}`),
  detail:           (id, params={}) => get(`${BASE}/taxonomy/${id}/?${new URLSearchParams(params)}`),

  downloadZip:      (id)            => download(`${BASE}/taxonomy/${id}/download/`),
  downloadGraph:    (id, type)      => download(`${BASE}/taxonomy/${id}/graph/?type=${type}`),
  downloadFasta:    (accession)     => download(`${BASE}/sequences/${accession}/fasta/`),
  downloadAllFasta: ()              => download(`${BASE}/global/fasta/`),
  downloadMetadata: ()              => download(`${BASE}/global/metadata/`),

  analyzeFasta: async (file, metaOrder) => post(`${BASE}/analysis/fasta/`,     await buildForm(file, metaOrder)),
  uniformize:   async (file, metaOrder) => post(`${BASE}/analysis/uniformize/`, await buildForm(file, metaOrder)),
  analysisFields: () => get(`${BASE}/analysis/fields/`),
}