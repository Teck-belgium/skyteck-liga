import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { getUserRole } from '@/lib/user'
import { useAuth } from '@/context/AuthContext'

const timeoutMs = 15 * 60 * 1000 // 15 minuten
let inactivityTimer: NodeJS.Timeout

function resetInactivityTimer(callback: () => void) {
  clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(callback, timeoutMs)
}

function startInactivityTimer(timeoutMs: number, router: any) {
  const logout = async () => {
    console.log('⏳ Automatisch uitgelogd wegens inactiviteit')
    await signOut(auth)
    router.push('/login')
  }

  resetInactivityTimer(logout)

  window.addEventListener('mousemove', () => resetInactivityTimer(logout))
  window.addEventListener('keydown', () => resetInactivityTimer(logout))
}

export function requireVerifiedUser() {
  const router = useRouter()
  const { setUser, setRole } = useAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        console.warn('❌ Geen ingelogde gebruiker')
        router.push('/login')
        return
      }

      const isVerified = firebaseUser.emailVerified
      if (!isVerified) {
        console.warn('📧 E-mailadres is niet geverifieerd')
        await signOut(auth)
        router.push('/login')
        return
      }

      const uid = firebaseUser.uid

      // ✅ Controleer expliciet of uid bestaat
      if (!uid) {
        console.error('❌ Geen UID beschikbaar')
        await signOut(auth)
        router.push('/login')
        return
      }

      setUser(firebaseUser)

      try {
        const role = await getUserRole(uid) // ✅ uid is nu gegarandeerd string
        setRole(role)
      } catch (error) {
        console.error('⚠️ Fout bij ophalen van rol:', error)
        await signOut(auth)
        router.push('/login')
        return
      }

      startInactivityTimer(timeoutMs, router)
    })

    return () => unsubscribe()
  }, [router, setUser, setRole])
}
