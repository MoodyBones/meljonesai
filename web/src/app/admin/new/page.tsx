"use client"

import React from 'react'
import Link from 'next/link'

export default function NewApplicationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create New Application</h1>
          <Link href="/admin" className="text-sm text-blue-600">Back</Link>
        </div>

        <p className="mt-4 text-sm text-gray-600">This is a placeholder page for creating a new application. Implement the form and handlers as needed.</p>

        <div className="mt-6">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input className="mt-1 block w-full border rounded px-3 py-2" placeholder="Senior Engineer" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input className="mt-1 block w-full border rounded px-3 py-2" placeholder="Example, Inc." />
            </div>

            <div className="flex gap-3">
              <button type="button" className="bg-blue-600 text-white py-2 px-4 rounded">Save draft</button>
              <button type="button" className="bg-gray-200 text-gray-800 py-2 px-4 rounded">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
