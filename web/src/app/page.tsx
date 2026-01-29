import { cookies } from 'next/headers'
import LandingContent from './LandingContent'
import { validateInviteCode } from '@/lib/firebase/invites'

interface PageProps {
  searchParams: Promise<{ invite?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const cookieStore = await cookies()
  const session = cookieStore.get('mj_session')
  const isLoggedIn = !!session

  // Check for invite code in URL params
  const params = await searchParams
  const inviteCode = params.invite || null

  // Build invite status
  let hasInvite = false
  let valid = false
  let error: string | null = null

  if (inviteCode) {
    hasInvite = true
    const validation = await validateInviteCode(inviteCode)
    valid = validation.valid
    error = validation.error || null
  }

  const inviteStatus = {
    hasInvite,
    valid,
    code: inviteCode,
    error,
  }

  return <LandingContent inviteStatus={inviteStatus} isLoggedIn={isLoggedIn} />
}
