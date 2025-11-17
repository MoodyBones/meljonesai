'use client'

import React, {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {auth} from '@/lib/firebase/config'
import {onAuthStateChanged, signOut as firebaseSignOut, type User} from 'firebase/auth'

type AdminUser = {email?: string | null; name?: string | null}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      if (!u) {
        // Not signed in — redirect to login
        router.replace('/login')
        setUser(null)
        return
      }
      setUser({email: u.email, name: u.displayName})
    })

    return () => unsub()
  }, [router])

  async function handleSignOut() {
    try {
  // Clear server-side session cookie
  await fetch('/api/auth/session', { method: 'DELETE' })
  await firebaseSignOut(auth)
  // Clear session cookie in client (best-effort) and any legacy leftovers
  document.cookie = 'mj_session=; path=/; max-age=0; SameSite=Strict'
      router.push('/login')
    } catch (err) {
      console.error('Sign out error', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div>
            <button onClick={handleSignOut} className="text-sm text-red-600">
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-6">
          {user ? (
            <div>
              <p className="text-sm text-gray-700">Signed in as</p>
              <p className="font-medium">{user.name ?? user.email}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="mt-6">
          <Link href="/admin/new" className="inline-block bg-blue-600 text-white py-2 px-4 rounded">
            New Application
          </Link>
        </div>
      </div>
    </div>
  )
}
