import PageLayout from '../components/layout/PageLayout'

const visualizations = [
  {
    title: 'Length Distribution',
    description:
      'This visualization presents the distribution of sequence lengths within a given species. It allows the user to assess whether the sequences are relatively homogeneous in size or whether substantial variation is present. It is also useful for identifying unusually short or long sequences that may differ from the overall pattern of the dataset.',
  },
  {
    title: 'GC Content',
    description:
      'This visualization illustrates the distribution of GC content across the sequences of a species. It provides an overview of the consistency of nucleotide composition within the dataset and helps identify sequences whose GC content deviates from the predominant pattern.',
  },
  {
    title: 'Entropy',
    description:
      'This visualization represents the temporal variation of entropy-related values for a given species. It supports the analysis of changes in sequence complexity over time and may help identify periods of greater stability or increased variability in the genomic structure of the sequences.',
  },
  {
    title: 'Melting Temp',
    description:
      'This visualization shows the temporal behaviour of melting temperature values for the sequences of a species. It provides a longitudinal perspective on sequence thermal stability and may reveal consistent trends or shifts across different collection years.',
  },
  {
    title: 'Bases Over Time',
    description:
      'This visualization displays the relative proportions of adenine (A), cytosine (C), guanine (G), and thymine (T) across collection years. It is particularly useful for examining the temporal stability of nucleotide composition and for identifying possible compositional trends over time.',
  },
]

const analysisMetrics = [
  {
    title: 'Header Standardization',
    description:
      'Metadata fields must be selected according to the order in which they appear in the uploaded FASTA header. Fields not explicitly covered by the available options should be assigned to "Other". If the file has no header, no metadata fields should be selected, and the accession will be generated automatically from the sequence hash.',
  },
  {
    title: 'Sequence Length',
    description:
      'The total size of the sequence, measured by the number of nucleotides it contains.',
  },
  {
    title: 'Base Composition',
    description:
      'The relative proportion of adenine (A), thymine (T), cytosine (C), and guanine (G) in the sequence, providing a direct description of nucleotide composition.',
  },
  {
    title: 'GC Content',
    description:
      'The proportion of guanine (G) and cytosine (C) in the sequence, used as a summary measure of nucleotide composition.',
  },
  {
    title: 'Melting Temperature',
    description:
      'An estimated value related to sequence thermal stability, calculated automatically for each processed sequence.',
  },
]

const references = [
  {
    title: 'AltaiR: a C toolkit for alignment-free and temporal analysis of multi-FASTA data',
    authors: 'Jorge M Silva, Armando J Pinho, Diogo Pratas',
    journal: 'GigaScience, Volume 13, 2024',
    link: 'https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giae086/7908817',
  },
  {
    title: 'A hybrid pipeline for reconstruction and analysis of viral genomes at multi-organ level',
    authors: 'Diogo Pratas, Mari Toppinen, Lari Pyöriä, Klaus Hedman, Antti Sajantila, Maria F Perdomo',
    journal: 'GigaScience, Volume 9, Issue 8, 2020',
    link: 'https://academic.oup.com/gigascience/article/9/8/giaa086/5894824',
  },
]

const dissertation = {
  title: 'Human Virus Genomics and Distribution',
  author: 'Ana Rita Gomes',
  supervisor: 'Dr. Diogo Pratas',
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-8">
      <p className="inline-flex items-center rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-[Space_Grotesk,system-ui,sans-serif] text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}

function InfoCard({ title, description }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/40 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]">
        {description}
      </p>
    </article>
  )
}

function ReferenceCard({ title, authors, journal, link }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/40 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {authors}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {journal}
      </p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex text-sm font-medium text-cyan-500 transition-colors hover:text-cyan-400"
      >
        View publication
      </a>
    </article>
  )
}

function DissertationCard({ title, author, supervisor }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/40 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <span className="font-medium text-slate-800 dark:text-slate-200">Author:</span> {author}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <span className="font-medium text-slate-800 dark:text-slate-200">Supervisor:</span> {supervisor}
      </p>
    </article>
  )
}

export default function Documentation() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_30%)]" />

        <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/85 sm:p-10 lg:p-12">
            <p className="inline-flex items-center rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
              Documentation
            </p>

            <h1 className="mt-5 font-[Space_Grotesk,system-ui,sans-serif] text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
              Documentation
            </h1>

            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              This page provides a brief description of the visualizations available in the{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                Database
              </span>{' '}
              section and of the processing steps carried out in the{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                Analysis
              </span>{' '}
              section. It also includes relevant publications from the research group and
              the associated dissertation.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700/60 dark:bg-slate-900/50">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Content
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Visualizations and Analysis
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Brief descriptions of the graphical outputs available in the platform and of
                  the analysis workflow.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700/60 dark:bg-slate-900/50">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Additional Material
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Research Outputs
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Relevant publications from the research group and the dissertation associated
                  with this work.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-12 sm:mt-12">
            <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-7 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/80 sm:p-8 lg:p-10">
              <SectionTitle
                eyebrow="Visualizations"
                title="Graph Descriptions"
                description="These visualizations help interpret the distribution, composition, and temporal behaviour of the sequences available for each species."
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visualizations.map((item) => (
                  <InfoCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-7 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/80 sm:p-8 lg:p-10">
              <SectionTitle
                eyebrow="Analysis"
                title="Sequence-Based Output"
                description="The Analysis section allows users to upload FASTA files, define the metadata order found in the original file, and obtain standardized outputs together with automatically computed sequence metrics."
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {analysisMetrics.map((item) => (
                  <InfoCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-7 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/80 sm:p-8 lg:p-10">
              <SectionTitle
                eyebrow="References"
                title="Related Publications"
                description="Relevant publications related to the methods and research context of this platform."
              />

              <div className="grid gap-5 md:grid-cols-2">
                {references.map((item) => (
                  <ReferenceCard
                    key={item.link}
                    title={item.title}
                    authors={item.authors}
                    journal={item.journal}
                    link={item.link}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-7 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/80 sm:p-8 lg:p-10">
              <SectionTitle
                eyebrow="Dissertation"
                title="Associated Dissertation"
                description="Dissertation associated with the development and scientific context of this platform."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <DissertationCard
                  title={dissertation.title}
                  author={dissertation.author}
                  supervisor={dissertation.supervisor}
                />
              </div>
            </section>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}