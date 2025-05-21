'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, getIdTokenResult } from 'firebase/auth'
import { auth } from '@/lib/firebase'

// Type voor de context
type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  roles: string[] // Meerdere rollen mogelijk
  setRoles: (roles: string[]) => void
  loading: boolean
}

// Context aanmaken
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  roles: [],
  setRoles: () => {},
  loading: true,
})

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const tokenResult = await getIdTokenResult(firebaseUser)
          const customRoles = tokenResult.claims.roles || []
          setRoles(Array.isArray(customRoles) ? customRoles : [customRoles])
        } catch (error) {
          console.error('❌ Fout bij ophalen van rollen (claims):', error)
          setRoles([])
        }
      } else {
        setRoles([])
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, roles, setRoles, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook om de context te gebruiken
export const useAuth = () => useContext(AuthContext)
