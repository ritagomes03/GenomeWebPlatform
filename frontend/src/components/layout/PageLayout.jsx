import Navbar from './Navbar'

export default function PageLayout({ children, mainClassName = 'relative overflow-hidden' }) {
  return (
    <div className="min-h-screen dark:bg-[#0b1326] bg-slate-50 dark:text-slate-100 text-slate-900 font-[Manrope,system-ui,sans-serif] selection:bg-cyan-400/30 selection:text-cyan-300">
      <Navbar />
      <main className={mainClassName}>{children}</main>
    </div>
  )
}
