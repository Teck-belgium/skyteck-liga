import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserRole } from '@/lib/getUserRole'
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

export function useRequireVerifiedUser() {
  const router = useRouter()
  const { setUser, setRole } = useAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login')
        return
      }

      if (!firebaseUser.emailVerified) {
        await signOut(auth)
        router.push('/login')
        return
      }

      const uid = firebaseUser.uid
      if (!uid) {
        await signOut(auth)
        router.push('/login')
        return
      }

      setUser(firebaseUser)

      try {
        const role = await getUserRole(uid)
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
