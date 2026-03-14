import { useState, useEffect, useRef } from 'react'
import { useAutocomplete } from '../../hooks/useGenomes'

export default function Autocomplete({ value, onChange, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const { data: suggestions = [] } = useAutocomplete(value)

  useEffect(() => {
    setOpen(value.length >= 2 && suggestions.length > 0)
  }, [value, suggestions])

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search species..."
        autoComplete="off"
        className="w-60 px-4 py-2.5 border border-slate-200 rounded-l-[10px] text-[0.95rem] outline-none bg-slate-50 transition-colors focus:border-blue-500 focus:bg-white"
      />
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 max-h-60 overflow-y-auto">
          {suggestions.map(s => (
            <div
              key={s}
              onClick={() => { onSelect(s); setOpen(false) }}
              className="px-4 py-3 cursor-pointer text-sm text-slate-800 border-b border-slate-100 last:border-0 transition-all hover:bg-blue-50 hover:text-blue-500 hover:pl-5"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
