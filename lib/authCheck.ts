import { auth } from './firebase'
import { signOut, onAuthStateChanged, sendEmailVerification, User } from 'firebase/auth'
import { getUserRole } from './getUserRole'

/**
 * Controleert of gebruiker ingelogd en geverifieerd is.
 * Geeft terug: { user, role } of redirect + uitloggen.
 */
export async function requireVerifiedUser(
  router: any,
  setUser: (user: User) => void,
  setRole: (role: string) => void
) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
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

    setUser(firebaseUser)
    const role = await getUserRole(firebaseUser.uid)
    setRole(role)
  })
}
