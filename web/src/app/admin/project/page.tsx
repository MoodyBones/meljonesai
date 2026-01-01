'use client'

import { useState } from 'react'
import Link from 'next/link'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function ProjectInputPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [createdProject, setCreatedProject] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Parse comma-separated fields into arrays
    const technologiesRaw = formData.get('technologies') as string
    const skillsRaw = formData.get('skillsApplied') as string

    const payload = {
      projectId: formData.get('projectId') as string,
      name: formData.get('name') as string,
      focus: formData.get('focus') as string || undefined,
      keyMetric: formData.get('keyMetric') as string || undefined,
      description: formData.get('description') as string || undefined,
      technologies: technologiesRaw ? technologiesRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      skillsApplied: skillsRaw ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      organisation: formData.get('organisation') as string || undefined,
      year: formData.get('year') as string || undefined,
      status: formData.get('status') as string || 'completed',
      url: formData.get('url') as string || undefined,
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Request failed: ${response.status}`)
      }

      const data = await response.json()
      setCreatedProject(data.projectId)
      setFormState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setFormState('error')
    }
  }

  function handleReset() {
    setFormState('idle')
    setError(null)
    setCreatedProject(null)
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
            New Project
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Add a project to your portfolio evidence
          </p>
        </div>

        {/* Success State */}
        {formState === 'success' && createdProject && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="text-green-800 dark:text-green-200">
              <h2 className="font-medium text-lg">Project Created</h2>
              <p className="mt-2 text-sm">
                Project <strong>{createdProject}</strong> has been added to Sanity.
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://meljonesai.sanity.studio/structure/project"
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

            {/* Project ID */}
            <div>
              <label
                htmlFor="projectId"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Project ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="projectId"
                name="projectId"
                required
                placeholder="e.g., P-06"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g., Career Stories Platform"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Focus */}
            <div>
              <label
                htmlFor="focus"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Focus Area
              </label>
              <input
                type="text"
                id="focus"
                name="focus"
                placeholder="e.g., AI-Assisted Full-Stack Development"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Key Metric */}
            <div>
              <label
                htmlFor="keyMetric"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Key Metric / Outcome
              </label>
              <textarea
                id="keyMetric"
                name="keyMetric"
                rows={2}
                placeholder="e.g., 0→1 platform build using Claude/n8n"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Detailed project description..."
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
              />
            </div>

            {/* Two columns for smaller fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Organisation */}
              <div>
                <label
                  htmlFor="organisation"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Organisation
                </label>
                <input
                  type="text"
                  id="organisation"
                  name="organisation"
                  placeholder="e.g., Personal"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Year */}
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Year
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  placeholder="e.g., 2025"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label
                htmlFor="technologies"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Technologies <span className="text-zinc-400 text-xs">(comma-separated)</span>
              </label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                placeholder="e.g., Next.js, TypeScript, Tailwind CSS"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Skills Applied */}
            <div>
              <label
                htmlFor="skillsApplied"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Skills Applied <span className="text-zinc-400 text-xs">(comma-separated)</span>
              </label>
              <input
                type="text"
                id="skillsApplied"
                name="skillsApplied"
                placeholder="e.g., Frontend Architecture, AI Integration"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="completed"
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>

            {/* URL */}
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Project URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                placeholder="https://..."
                className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formState === 'submitting'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formState === 'submitting' ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
