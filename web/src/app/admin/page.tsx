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

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      document.cookie = 'mj_session=; path=/; max-age=0; SameSite=Strict'
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      // TODO: Show error toast to user
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <button 
            onClick={handleSignOut} 
            className="text-sm text-red-600 hover:text-red-800"
          >
            Sign Out
          </button>
        </div>

        {user && (
          <div className="mt-6">
            <p className="text-sm text-gray-700">Signed in as</p>
            <p className="font-medium">{user.name || user.email}</p>
          </div>
        )}

        <div className="mt-6">
          <Link 
            href="/admin/new" 
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            New Application
          </Link>
        </div>
      </div>
    </div>
  )
}