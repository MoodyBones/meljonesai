'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface LandingContentProps {
  inviteStatus: {
    hasInvite: boolean
    valid: boolean
    code: string | null
    error: string | null
  }
  isLoggedIn: boolean
}

export default function LandingContent({ inviteStatus, isLoggedIn }: LandingContentProps) {
  const router = useRouter()

  // Set cookie when invite is valid
  useEffect(() => {
    if (inviteStatus.valid && inviteStatus.code) {
      const encodedCode = encodeURIComponent(inviteStatus.code)
      const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `validInvite=${encodedCode}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`
    }
  }, [inviteStatus])

  function handleGetStarted() {
    if (isLoggedIn) {
      router.push('/admin')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Steep
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            AI-powered job applications that showcase your real experience.
            Build your profile from projects and let AI match you to opportunities.
          </p>
        </div>

        {/* Invite Status Card */}
        <div className="max-w-md mx-auto mb-12">
          {inviteStatus.hasInvite ? (
            inviteStatus.valid ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✓</span>
                  <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Valid Invite Code
                  </h2>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                  You have access to the beta. Click below to get started.
                </p>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
                </button>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✗</span>
                  <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Invalid Invite Code
                  </h2>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {inviteStatus.error || 'The invite code you provided is not valid.'}
                </p>
              </div>
            )
          ) : (
            <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔒</span>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  Private Beta
                </h2>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                Steep is currently in private beta. You need an invite code to join.
              </p>
              {isLoggedIn && (
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Project Portfolio
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Add your real projects as evidence. AI analyzes them to understand your capabilities.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              AI Profile Builder
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your profile is generated from your work, not written from scratch.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Smart Job Matching
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Paste a job description and get personalized application content.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>Built with care for people who do real work.</p>
        </div>
      </div>
    </div>
  )
}
