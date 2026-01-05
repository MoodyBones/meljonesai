'use client'

import React, {useState} from 'react'
import {useRouter} from 'next/navigation'
import {auth, googleProvider} from '@/lib/firebase/config'
import {signInWithPopup} from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    if (!auth || !googleProvider) {
      setError('Firebase not initialized');
      setLoading(false);
      return;
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
        <h1 className="text-2xl font-semibold mb-4">Admin Sign In</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in with Google to manage AI-generated applications.
        </p>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}
