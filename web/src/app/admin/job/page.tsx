'use client'

import { useState } from 'react'
import Link from 'next/link'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

type SuccessResult = {
  company: string
  role: string
  studioUrl: string
}

export default function JobInputPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SuccessResult | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = {
      companyName: formData.get('companyName') as string,
      roleTitle: formData.get('roleTitle') as string,
      jobDescription: formData.get('jobDescription') as string,
    }

    try {
      const response = await fetch('https://n8n.goodsomeday.com/webhook/job-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()
      setResult({
        company: data.company,
        role: data.role,
        studioUrl: data.studioUrl,
      })
      setFormState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setFormState('error')
    }
  }

  function handleReset() {
    setFormState('idle')
    setError(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-4">
            New Job Application
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Paste the job description to generate personalised application content
          </p>
        </div>

        {/* Success State */}
        {formState === 'success' && result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="text-green-800 dark:text-green-200">
              <h2 className="font-medium text-lg">Draft Created</h2>
              <p className="mt-2 text-sm">
                Application for <strong>{result.role}</strong> at <strong>{result.company}</strong>
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href={result.studioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white text-sm py-2 px-4 rounded hover:bg-green-700"
                >
                  Open in Sanity Studio
                </a>
                <button
                  onClick={handleReset}
                  className="text-sm text-green-700 dark:text-green-300 hover:underline"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {formState !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {formState === 'error' && error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                required
                placeholder="e.g., Canva"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Role Title */}
            <div>
              <label
                htmlFor="roleTitle"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Role Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleTitle"
                name="roleTitle"
                required
                placeholder="e.g., Senior Frontend Engineer"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Job URL (optional) */}
            <div>
              <label
                htmlFor="jobUrl"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Job URL <span className="text-zinc-400">(optional)</span>
              </label>
              <input
                type="url"
                id="jobUrl"
                name="jobUrl"
                placeholder="https://..."
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Job Description */}
            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={12}
                placeholder="Paste the full job description here..."
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formState === 'submitting'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formState === 'submitting' ? 'Generating...' : 'Generate Application Content'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
