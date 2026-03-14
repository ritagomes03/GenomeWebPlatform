import { useQuery } from '@tanstack/react-query'
import { genomesApi } from '../api/genomes'

export const useHome = () =>
  useQuery({ queryKey: ['home'], queryFn: genomesApi.home })

export const useTaxonomy = (params) =>
  useQuery({ queryKey: ['taxonomy', params], queryFn: () => genomesApi.taxonomy(params) })

export const useAutocomplete = (q) =>
  useQuery({ queryKey: ['autocomplete', q], queryFn: () => genomesApi.autocomplete(q), enabled: q.length >= 2 })

export const useTaxonomyDetail = (id, params = {}) =>
  useQuery({
    queryKey: ['taxonomy', id, params],
    queryFn: () => genomesApi.detail(id, params),
    enabled: !!id,
  })


export const useSequences = (id, params) =>
  useQuery({ queryKey: ['sequences', id, params], queryFn: () => genomesApi.sequences(id, params), enabled: !!id })

export const useGraphs = (id) =>
  useQuery({ queryKey: ['graphs', id], queryFn: () => genomesApi.graphs(id), enabled: !!id })
