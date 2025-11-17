import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import { verifySessionCookie } from '@/lib/firebase/admin'

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const cookieStore = await cookies()
  const session = cookieStore.get('mj_session')?.value

  if (!session) return redirect('/login')

  try {
    // Verify Firebase session cookie server-side.
    await verifySessionCookie(session)
  } catch {
    // If verification fails, redirect to login.
    return redirect('/login')
  }

  return <>{children}</>
}
