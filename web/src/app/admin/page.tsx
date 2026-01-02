'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'

type AdminUser = {
  email: string
  name: string | null
}

type ProfileBuildState = 'idle' | 'building' | 'success' | 'error'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileBuildState, setProfileBuildState] = useState<ProfileBuildState>('idle')
  const [profileBuildResult, setProfileBuildResult] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth not initialized')
      router.replace('/login')
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (!firebaseUser?.email) {
        router.replace('/login')
        setUser(null)
      } else {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName
        })
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  async function handleSignOut() {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
      if (auth) await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  async function handleRebuildProfile() {
    setProfileBuildState('building')
    setProfileBuildResult(null)

    try {
      const response = await fetch('https://n8n.goodsomeday.com/webhook/build-profile', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()
      setProfileBuildState('success')
      setProfileBuildResult(`Found ${data.capabilitiesFound} capabilities`)
    } catch (error) {
      setProfileBuildState('error')
      setProfileBuildResult(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Dashboard
            </h1>
            {user && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {user.name || user.email}
              </p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/job"
            className="block p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <div className="text-2xl mb-2">📝</div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              New Job Application
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Match a job and generate personalised application content
            </p>
          </Link>

          <Link
            href="/admin/project"
            className="block p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <div className="text-2xl mb-2">🛠️</div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              New Project
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Add a new project to your portfolio evidence
            </p>
          </Link>
        </div>

        {/* Profile Builder */}
        <div className="mt-4">
          <button
            onClick={handleRebuildProfile}
            disabled={profileBuildState === 'building'}
            className="w-full p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">🔄</div>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {profileBuildState === 'building' ? 'Analysing...' : 'Rebuild Profile'}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Re-analyse projects and update AI-derived capabilities
                </p>
              </div>
              {profileBuildState === 'success' && (
                <span className="text-green-600 dark:text-green-400 text-sm">
                  {profileBuildResult}
                </span>
              )}
              {profileBuildState === 'error' && (
                <span className="text-red-600 dark:text-red-400 text-sm">
                  {profileBuildResult}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Quick links</p>
          <div className="flex gap-4 text-sm">
            <a
              href="https://meljonesai.sanity.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sanity Studio
            </a>
            <a
              href="https://n8n.goodsomeday.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              n8n Workflows
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
