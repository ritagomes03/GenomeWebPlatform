import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { genomesApi } from '../api/genomes'

export const useHome = () =>
  useQuery({ queryKey: ['home'], queryFn: genomesApi.home })

export const useTaxonomy = (params) =>
  useQuery({
    queryKey: ['taxonomy', params],
    queryFn: () => genomesApi.taxonomy(params),
    placeholderData: keepPreviousData,
  })

export const useAutocomplete = (q) =>
  useQuery({ queryKey: ['autocomplete', q], queryFn: () => genomesApi.autocomplete(q), enabled: q.length >= 2 })

export const useTaxonomyDetail = (id, params = {}) =>
  useQuery({
    queryKey: ['taxonomy', id, params],
    queryFn: () => genomesApi.detail(id, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
  })

export const useAnalysisFields = () =>
  useQuery({
    queryKey: ['analysis-fields'],
    queryFn: genomesApi.analysisFields,
  })
