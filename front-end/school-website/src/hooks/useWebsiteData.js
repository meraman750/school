import { useQuery, useMutation } from '@tanstack/react-query'
import { websiteApi } from '../services/api'
import {
  FALLBACK_SCHOOL_INFO,
  FALLBACK_BLOG,
  FALLBACK_EVENTS,
  FALLBACK_GALLERY,
  FALLBACK_JOBS,
  FALLBACK_DOWNLOADS,
  FALLBACK_FAQS,
} from '../utils/constants'

const extractResults = (data) => {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  if (data?.data) return data.data
  return data
}

const withFallback = (data, fallback) => {
  const results = extractResults(data)
  if (!results || (Array.isArray(results) && results.length === 0)) {
    return fallback
  }
  return results
}

export function useSchoolInfo() {
  return useQuery({
    queryKey: ['school-info'],
    queryFn: async () => {
      try {
        const { data } = await websiteApi.getSchoolInfo()
        return data && Object.keys(data).length > 0 ? data : FALLBACK_SCHOOL_INFO
      } catch {
        return FALLBACK_SCHOOL_INFO
      }
    },
    placeholderData: FALLBACK_SCHOOL_INFO,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBlog() {
  return useQuery({
    queryKey: ['blog'],
    queryFn: async () => {
      try {
        const { data } = await websiteApi.getBlog()
        return withFallback(data, FALLBACK_BLOG)
      } catch {
        return FALLBACK_BLOG
      }
    },
    placeholderData: FALLBACK_BLOG,
    staleTime: 5 * 60 * 1000,
  })
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const { data } = await websiteApi.getEvents()
        return withFallback(data, FALLBACK_EVENTS)
      } catch {
        return FALLBACK_EVENTS
      }
    },
    placeholderData: FALLBACK_EVENTS,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      try {
        const { data } = await websiteApi.getGallery()
        return withFallback(data, FALLBACK_GALLERY)
      } catch {
        return FALLBACK_GALLERY
      }
    },
    placeholderData: FALLBACK_GALLERY,
    staleTime: 5 * 60 * 1000,
  })
}

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const { data } = await websiteApi.getJobs()
        return withFallback(data, FALLBACK_JOBS)
      } catch {
        return FALLBACK_JOBS
      }
    },
    placeholderData: FALLBACK_JOBS,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDownloads() {
  return useQuery({
    queryKey: ['downloads'],
    queryFn: async () => {
      try {
        const { data } = await websiteApi.getDownloads()
        return withFallback(data, FALLBACK_DOWNLOADS)
      } catch {
        return FALLBACK_DOWNLOADS
      }
    },
    placeholderData: FALLBACK_DOWNLOADS,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      try {
        const { data } = await websiteApi.getFaqs()
        return withFallback(data, FALLBACK_FAQS)
      } catch {
        return FALLBACK_FAQS
      }
    },
    placeholderData: FALLBACK_FAQS,
    staleTime: 5 * 60 * 1000,
  })
}

export function useContactMutation() {
  return useMutation({
    mutationFn: (data) => websiteApi.submitContact(data),
  })
}

export function useNewsletterMutation() {
  return useMutation({
    mutationFn: (data) => websiteApi.subscribeNewsletter(data),
  })
}
