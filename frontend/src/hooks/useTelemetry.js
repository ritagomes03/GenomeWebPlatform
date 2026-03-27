import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function usePageAnalytics() {
  const location = useLocation()

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: pagePath })
      return
    }

    if (typeof window.plausible === 'function') {
      window.plausible('pageview', { u: pagePath })
    }
  }, [location.pathname, location.search])
}

export function useRuntimeErrorCapture() {
  useEffect(() => {
    const onError = (event) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'exception', {
          description: event.message || 'Unhandled runtime error',
          fatal: false,
        })
      }
      console.error('Runtime error captured:', event.error || event.message)
    }

    const onUnhandledRejection = (event) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'exception', {
          description: event.reason?.message || 'Unhandled promise rejection',
          fatal: false,
        })
      }
      console.error('Unhandled rejection captured:', event.reason)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])
}
