import {initializeApp, getApps, getApp} from 'firebase/app'
import {getAuth, GoogleAuthProvider} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Only initialize Firebase in the browser. This avoids server-side initialization
// during Next.js builds where window is undefined and env vars may not be set.
let app: ReturnType<typeof initializeApp> | undefined
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }
}

export const auth: ReturnType<typeof getAuth> | null = app ? getAuth(app) : null
export const googleProvider = new GoogleAuthProvider()

export default app
