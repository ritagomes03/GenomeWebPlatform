import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Database', to: '/species' },
  { label: 'Analysis', to: '/analysis' },
  { label: 'Documentation', to: '/documentation' },
]

function isActiveRoute(pathname, to) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navRef = useRef(null)

  const goTo = (to) => {
    setOpen(false)
    navigate(to)
  }

  useEffect(() => {
    if (!open) return undefined

    const onClickOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setOpen(false)
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <nav ref={navRef} className="dark:bg-[#0b1326]/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b dark:border-slate-700/20 border-slate-200/50 shadow-[0_0_40px_rgba(0,0,0,0.2)]" aria-label="Main navigation">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => goTo('/')}
            type="button"
            aria-label="Go to home page"
            className="text-2xl font-bold tracking-tight dark:text-slate-100 text-slate-900 font-[Space_Grotesk,system-ui,sans-serif] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
          >
            ViromeGenomics
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map(({ label, to }) => {
              const active = isActiveRoute(pathname, to)
              return (
                <button
                  key={to}
                  type="button"
                  onClick={() => goTo(to)}
                  aria-current={active ? 'page' : undefined}
                  className={active
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1 focus-visible:ring-2 focus-visible:ring-cyan-400'
                    : 'dark:text-slate-300 text-slate-600 dark:hover:text-slate-100 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400'}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls="mobile-main-menu"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden relative inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border dark:border-slate-600/70 border-slate-300 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors hover:border-cyan-400/60"
            >
              <span className="sr-only">Toggle navigation menu</span>
              <span className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${open ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${open ? '-rotate-45' : 'translate-y-1.5'}`} />
            </button>
          </div>
        </div>

        <div
          id="mobile-main-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-96 opacity-100 pt-3' : 'max-h-0 opacity-0'}`}
        >
          <div className="rounded-2xl border dark:border-slate-700/70 border-slate-200/90 dark:bg-slate-900/90 bg-white/95 backdrop-blur-xl p-2 ">
            {NAV_LINKS.map(({ label, to }) => {
              const active = isActiveRoute(pathname, to)
              return (
                <button
                  key={to}
                  type="button"
                  onClick={() => goTo(to)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full text-left min-h-11 px-4 py-3 rounded-xl font-medium transition-colors ${
                    active
                      ? 'bg-cyan-400/15 text-cyan-400'
                      : 'dark:text-slate-200 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
