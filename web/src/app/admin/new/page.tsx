'use client'

import React, {useState} from 'react'
import Link from 'next/link'

type DraftPayload = {
  title: string
  company?: string
  content: string
  tags?: string
}

export default function NewApplicationPage() {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const validate = (p: DraftPayload) => {
    if (!p.title || p.title.trim().length < 3) return 'Title must be at least 3 characters.'
    if (!p.content || p.content.trim().length < 10) return 'Content must be at least 10 characters.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const payload: DraftPayload = {
      title: title.trim(),
      company: company.trim(),
      content: content.trim(),
      tags: tags.trim(),
    }
    const v = validate(payload)
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Request failed: ${res.status}`)
      }

      await res.json()
      setSuccess('Draft saved successfully')
      setTitle('')
      setCompany('')
      setContent('')
      setTags('')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as {message?: string}).message
          : String(err)
      setError(message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create New Draft</h1>
          <Link href="/admin" className="text-sm text-blue-600">
            Back
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Create a draft to save work in progress. Required: title + content.
        </p>

        <div className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                placeholder="Enter title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company (optional)</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                placeholder="Example, Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 h-40"
                placeholder="Write application details or notes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tags (comma separated)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                placeholder="frontend,react"
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save draft'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('')
                  setCompany('')
                  setContent('')
                  setTags('')
                  setError(null)
                  setSuccess(null)
                }}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
