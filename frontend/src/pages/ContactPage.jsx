import { useState } from 'react'
import PageLayout from '../components/layout/PageLayout'

const INITIAL_FORM = {
  name: '',
  email: '',
  category: '',
  subject: '',
  message: '',
}

const CATEGORIES = [
  { value: 'database_usage', label: 'Database usage' },
  { value: 'sequence_analysis', label: 'Sequence analysis' },
  { value: 'data_download', label: 'Data download' },
  { value: 'genomic_metrics', label: 'Genomic metrics' },
  { value: 'api_access', label: 'API access' },
  { value: 'technical_issue', label: 'Technical issue' },
  { value: 'scientific_question', label: 'Scientific question' },
  { value: 'other', label: 'Other' },
]

function getErrorMessage(errors, field) {
  const error = errors[field]

  if (!error) return null
  if (Array.isArray(error)) return error[0]

  return String(error)
}

function FieldError({ message }) {
  if (!message) return null

  return (
    <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
  )
}

export default function ContactPage() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submissionStatus, setSubmissionStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
    }))

    setSubmissionStatus('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setErrors({})
    setSubmissionStatus('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      let responseData = {}

      try {
        responseData = await response.json()
      } catch {
        responseData = {}
      }

      if (!response.ok) {
        setErrors(responseData)
        setSubmissionStatus('error')
        return
      }

      setFormData(INITIAL_FORM)
      setSubmissionStatus('success')
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmissionStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout>
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.10),transparent_30%)]" />

        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <header className="mb-10">
            <p className="inline-flex items-center rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500 dark:text-cyan-300">
              Contact
            </p>

            <h1 className="mt-5 font-[Space_Grotesk,system-ui,sans-serif] text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
              Contact the HVGD Team
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              Submit your question or report a technical issue using the form
              below. Your message will not be displayed publicly.
            </p>
          </header>

          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-800/85 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    autoComplete="name"
                    maxLength={120}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />

                  <FieldError
                    message={getErrorMessage(errors, 'name')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />

                  <FieldError
                    message={getErrorMessage(errors, 'email')}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
                >
                  <option value="">Select a category</option>

                  {CATEGORIES.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>

                <FieldError
                  message={getErrorMessage(errors, 'category')}
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Briefly describe your question"
                  maxLength={200}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                <FieldError
                  message={getErrorMessage(errors, 'subject')}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your question in detail..."
                  rows={7}
                  required
                  className="mt-2 min-h-44 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                <FieldError
                  message={getErrorMessage(errors, 'message')}
                />
              </div>

              {submissionStatus === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <p className="font-semibold">
                    Message submitted successfully.
                  </p>

                  <p className="mt-1">
                    Thank you for contacting the HVGD team. Your message has
                    been saved and will be reviewed.
                  </p>
                </div>
              )}

              {submissionStatus === 'error' && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-6 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                  The message could not be submitted. Please check the fields
                  and try again.
                </div>
              )}

              <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your contact information will remain private.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </PageLayout>
  )
}