const BASE = '/api'

export async function fetchSpecies(search = '') {
  const res = await fetch(`${BASE}/especies/?search=${encodeURIComponent(search)}`)
  if (!res.ok) throw new Error('Failed to fetch species')
  return res.json()
}

export async function fetchAutocomplete(query) {
  const res = await fetch(`${BASE}/autocomplete/?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Failed to fetch autocomplete')
  return res.json()
}

export async function fetchSpeciesDetail(taxonomyId) {
  const res = await fetch(`${BASE}/${taxonomyId}/`)
  if (!res.ok) throw new Error('Failed to fetch species detail')
  return res.json()
}
