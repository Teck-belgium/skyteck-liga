import { useEffect, useState } from 'react'
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
  const { setUser, setRoles } = useAuth()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.emailVerified) {
        await signOut(auth)
        router.push('/login')
        return
      }

      setUser(firebaseUser)

      try {
        const roles = await getUserRole(firebaseUser.uid)
        setRoles(roles ?? [])
      } catch (error) {
        console.error('⚠️ Fout bij ophalen van rol:', error)
        await signOut(auth)
        router.push('/login')
        return
      }

      startInactivityTimer(timeoutMs, router)
      setChecked(true)
    })

    return () => unsubscribe()
  }, [router, setUser, setRoles])

  return checked
}
