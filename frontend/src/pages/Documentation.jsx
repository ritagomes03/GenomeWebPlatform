import PageLayout from '../components/layout/PageLayout'

export default function Documentation() {
  return (
    <PageLayout>
      <section className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border dark:border-slate-700/60 border-slate-200 bg-white/90 dark:bg-slate-800/85 backdrop-blur-xl p-8 sm:p-10 shadow-xl">
          <p className="inline-flex items-center rounded-full bg-cyan-400/15 text-cyan-400 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Coming Soon
          </p>
          <h1 className="mt-5 font-[Space_Grotesk,system-ui,sans-serif] text-3xl sm:text-4xl font-bold tracking-tight dark:text-slate-100 text-slate-900">
            Documentation Hub
          </h1>
          <p className="mt-4 text-base sm:text-lg dark:text-slate-300 text-slate-600 max-w-2xl leading-relaxed">
            We are preparing detailed platform docs including API usage, analysis workflows,
            dataset curation pipeline, and downloadable examples.
          </p>
        </div>
      </section>
    </PageLayout>
  )
}
