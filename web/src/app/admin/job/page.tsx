'use client'

import { useState } from 'react'
import Link from 'next/link'

type FormState = 'idle' | 'submitting' | 'success' | 'rejected' | 'error'

type Gap = {
  requirement: string
  gap: string
  reframe: string
}

type MatchResult = {
  matchCategory: 'match' | 'partial'
  matchScore: number
  gaps: Gap[]
  company: string
  role: string
  studioUrl: string
}

type RejectResult = {
  matchCategory: 'reject'
  matchScore: number
  reason: string
  dealBreakersTriggered: string[]
  requirementsNotMet: string[]
  notNow: boolean
  company: string
  role: string
}

export default function JobInputPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [rejectResult, setRejectResult] = useState<RejectResult | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = {
      companyName: formData.get('companyName') as string,
      roleTitle: formData.get('roleTitle') as string,
      jobUrl: formData.get('jobUrl') as string || undefined,
      jobDescription: formData.get('jobDescription') as string,
    }

    try {
      const response = await fetch('https://n8n.goodsomeday.com/webhook/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.matchCategory === 'reject') {
        setRejectResult(data)
        setFormState('rejected')
      } else {
        setMatchResult(data)
        setFormState('success')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setFormState('error')
    }
  }

  function handleReset() {
    setFormState('idle')
    setError(null)
    setMatchResult(null)
    setRejectResult(null)
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
            Paste the job description to match against your profile
          </p>
        </div>

        {/* Success State (MATCH or PARTIAL) */}
        {formState === 'success' && matchResult && (
          <div className={`${matchResult.matchCategory === 'match' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'} border rounded-lg p-6`}>
            <div className={matchResult.matchCategory === 'match' ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}>
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">
                  {matchResult.matchCategory === 'match' ? 'Strong Match' : 'Partial Match'}
                </h2>
                <span className="text-2xl font-bold">{matchResult.matchScore}%</span>
              </div>
              <p className="mt-2 text-sm">
                <strong>{matchResult.role}</strong> at <strong>{matchResult.company}</strong>
              </p>

              {/* Gaps for partial matches */}
              {matchResult.matchCategory === 'partial' && matchResult.gaps.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-sm">Gaps to address:</p>
                  {matchResult.gaps.map((gap, i) => (
                    <div key={i} className="text-sm bg-white/50 dark:bg-black/20 rounded p-2">
                      <p><strong>{gap.requirement}</strong></p>
                      <p className="text-amber-700 dark:text-amber-300">{gap.gap}</p>
                      <p className="italic mt-1">Reframe: {gap.reframe}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <a
                  href={matchResult.studioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block ${matchResult.matchCategory === 'match' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'} text-white text-sm py-2 px-4 rounded`}
                >
                  Open in Sanity Studio
                </a>
                <button
                  onClick={handleReset}
                  className={`text-sm ${matchResult.matchCategory === 'match' ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'} hover:underline`}
                >
                  Try Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejected State */}
        {formState === 'rejected' && rejectResult && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="text-red-800 dark:text-red-200">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">Not a Match</h2>
                <span className="text-2xl font-bold">{rejectResult.matchScore}%</span>
              </div>
              <p className="mt-2 text-sm">
                <strong>{rejectResult.role}</strong> at <strong>{rejectResult.company}</strong>
              </p>
              <p className="mt-3 text-sm">{rejectResult.reason}</p>

              {rejectResult.dealBreakersTriggered.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-sm">Deal breakers:</p>
                  <ul className="list-disc list-inside text-sm">
                    {rejectResult.dealBreakersTriggered.map((db, i) => (
                      <li key={i}>{db}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rejectResult.requirementsNotMet.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-sm">Requirements not met:</p>
                  <ul className="list-disc list-inside text-sm">
                    {rejectResult.requirementsNotMet.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-3 text-sm italic">
                {rejectResult.notNow ? 'This might fit in the future.' : 'Fundamental mismatch.'}
              </p>

              <div className="mt-4">
                <button
                  onClick={handleReset}
                  className="text-sm text-red-700 dark:text-red-300 hover:underline"
                >
                  Try Another Job
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {formState !== 'success' && formState !== 'rejected' && (
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
              {formState === 'submitting' ? 'Matching...' : 'Match & Generate'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
