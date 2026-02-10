'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, googleProvider } from '@/lib/firebase/config'
import { signInWithPopup } from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasInvite, setHasInvite] = useState(false)

  // Check if user has a valid invite cookie
  useEffect(() => {
    const cookies = document.cookie.split(';')
    const inviteCookie = cookies.find((c) => c.trim().startsWith('validInvite='))
    setHasInvite(!!inviteCookie && inviteCookie.split('=')[1]?.length > 0)
  }, [])

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    if (!auth || !googleProvider) {
      setError('Firebase not initialized')
      setLoading(false)
      return
    }
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      const token = await credential.user.getIdToken()

      // Exchange ID token for a secure httpOnly session cookie on the server
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to create session')
      }

      // Attempt beta registration (will succeed silently if already registered or no invite needed)
      const betaRes = await fetch('/api/auth/register-beta', {
        method: 'POST',
      })

      if (!betaRes.ok) {
        const betaPayload = await betaRes.json().catch(() => ({}))
        // If beta is full or other registration error, show it but still allow access
        // (existing users who are already registered will get 200)
        if (betaPayload?.error) {
          console.warn('Beta registration note:', betaPayload.error)
          // For "beta full" error, show to user
          if (betaPayload.error.includes('full')) {
            setError(betaPayload.error)
            setLoading(false)
            return
          }
          // For "no invite code" on new users, this is expected if they don't have one
          // They might be an existing user being checked, so continue
        }
      }

      router.push('/admin')
    } catch (err: unknown) {
      console.error('Login error', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in with Google to access your dashboard.
        </p>
        {!hasInvite && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              No invite code detected. If you&apos;re new, you&apos;ll need an invite link to join the beta.
            </p>
          </div>
        )}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
