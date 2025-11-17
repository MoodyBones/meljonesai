'use client'

import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {auth, googleProvider} from '@/lib/firebase/config'
import {signInWithPopup} from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If token cookie exists, redirect to /admin
    const hasToken = document.cookie.split(';').some((c) => c.trim().startsWith('mj_token='))
    if (hasToken) router.replace('/admin')
  }, [router])

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      const token = await credential.user.getIdToken()

      // Set cookie (1 week)
      document.cookie = `mj_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; Secure; SameSite=Strict`

      router.push('/admin')
    } catch (err: any) {
      console.error('Login error', err)
      setError(err?.message || 'Sign-in failed')
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
