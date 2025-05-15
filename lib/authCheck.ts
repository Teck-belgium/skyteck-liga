// lib/authCheck.ts
import { auth } from './firebase'
import {
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  User,
} from 'firebase/auth'
import { getUserRole } from './getUserRole'

let inactivityTimer: NodeJS.Timeout | null = null

function startInactivityTimer(timeoutMs: number, router: any) {
  if (inactivityTimer) clearTimeout(inactivityTimer)

  inactivityTimer = setTimeout(async () => {
    alert('Je bent automatisch uitgelogd wegens inactiviteit.')
    await signOut(auth)
    router.push('/login')
  }, timeoutMs)
}

function resetInactivityTimer(timeoutMs: number, router: any) {
  startInactivityTimer(timeoutMs, router)
}

export function requireVerifiedUser(
  router: any,
  setUser: (user: User) => void,
  setRole: (role: string) => void,
  timeoutMs: number = 10 * 60 * 1000
) {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      router.push('/login')
      return
    }

    if (!firebaseUser.emailVerified) {
      alert('Bevestig je e-mailadres via de link in je mail.')
      await sendEmailVerification(firebaseUser)
      await signOut(auth)
      return
    }

    try {
      // ✅ Extra beveiliging
      if (!firebaseUser.uid) {
        console.error('Gebruiker heeft geen UID.')
        await signOut(auth)
        router.push('/login')
        return
      }

      setUser(firebaseUser)
      const role = await getUserRole(firebaseUser.uid!) // <-- opgelost met non-null assertion
      setRole(role)

      startInactivityTimer(timeoutMs, router)

      const events = ['mousemove', 'keydown', 'click']
      const reset = () => resetInactivityTimer(timeoutMs, router)
      events.forEach((event) => window.addEventListener(event, reset))

      return () => {
        if (inactivityTimer) clearTimeout(inactivityTimer)
        events.forEach((event) => window.removeEventListener(event, reset))
      }
    } catch (error) {
      console.error('Fout bij ophalen rol:', error)
      await signOut(auth)
      router.push('/login')
    }
  })

  return unsubscribe
}
