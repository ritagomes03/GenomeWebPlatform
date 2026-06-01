import { useState, useEffect, useRef, useId } from 'react'
import { useAutocomplete } from '../../hooks/useGenomes'

export default function Autocomplete({ value, onChange, onSelect }) {
  const [isFocused, setIsFocused] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const ref = useRef(null)
  const listId = useId()

  const { data: suggestions = [] } = useAutocomplete(value)

  const open = isFocused && !isDismissed && value.length >= 2 && suggestions.length > 0

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) {
        setIsFocused(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const onKeyDown = (event) => {
    if (!open && event.key === 'ArrowDown' && suggestions.length) {
      setIsFocused(true)
      setIsDismissed(false)
      setActiveIndex(0)
      return
    }

    if (!open) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const selected = suggestions[activeIndex]
      onSelect(selected)
      setIsFocused(false)
      setIsDismissed(false)
      setActiveIndex(-1)
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsFocused(false)
      setIsDismissed(true)
      setActiveIndex(-1)
    }
  }

  const activeOptionId = activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined

  return (
    <div className="relative w-full sm:w-60" ref={ref}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setIsDismissed(false)
          setActiveIndex(-1)
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setIsFocused(true)
          setIsDismissed(false)
        }}
        placeholder="Search species..."
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-label="Search species"
        className="w-full px-4 py-2.5 border border-slate-200 rounded-l-[10px] text-[0.95rem] outline-none bg-slate-50 transition-colors focus:border-blue-500 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/30"
      />
      {open && (
        <div id={listId} role="listbox" className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 max-h-[70vh] overflow-y-auto">
          {suggestions.map((s, idx) => (
            <div
              key={s}
              id={`${listId}-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => {
                onSelect(s)
                setIsFocused(false)
                setIsDismissed(false)
                setActiveIndex(-1)
              }}
              className={`px-4 py-3 cursor-pointer text-sm border-b border-slate-100 last:border-0 transition-all ${
                activeIndex === idx
                  ? 'bg-blue-50 text-blue-600 pl-5'
                  : 'text-slate-800 hover:bg-blue-50 hover:text-blue-500 hover:pl-5'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        {open ? `${suggestions.length} suggestions available` : ''}
      </div>
    </div>
  )
}
