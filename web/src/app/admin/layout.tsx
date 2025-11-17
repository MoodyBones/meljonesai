import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {verifyIdToken} from '@/lib/firebase/admin'

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('mj_token')?.value

  if (!token) return redirect('/login')

  try {
    // Verify token using server-side Firebase Admin SDK.
    await verifyIdToken(token)
  } catch {
    // If verification fails, redirect to login.
    return redirect('/login')
  }

  return <>{children}</>
}
