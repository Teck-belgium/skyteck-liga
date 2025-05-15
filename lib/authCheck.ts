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

/**
 * Zorgt ervoor dat een gebruiker ingelogd en geverifieerd is.
 * Start automatisch uitlogtimer en geeft role + user terug.
 */
export function requireVerifiedUser(
  router: any,
  setUser: (user: User) => void,
  setRole: (role: string) => void,
  timeoutMs: number = 10 * 60 * 1000 // standaard 10 minuten
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
      // ✅ Gebruiker is ingelogd en geverifieerd
      setUser(firebaseUser)

      const role = await getUserRole(firebaseUser.uid)
      setRole(role)

      startInactivityTimer(timeoutMs, router)

      // 🎯 Luister naar activiteit
      const events = ['mousemove', 'keydown', 'click']
      const reset = () => resetInactivityTimer(timeoutMs, router)
      events.forEach((event) => window.addEventListener(event, reset))

      // 🔁 Cleanup functie bij unmount
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
