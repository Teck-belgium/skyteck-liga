'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Type voor de context
type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  role: string | null
  setRole: (role: string | null) => void
  loading: boolean
}

// Context aanmaken
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  role: null,
  setRole: () => {},
  loading: true,
})

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            setRole(data.role || null)
          } else {
            setRole(null)
          }
        } catch (error) {
          console.error('❌ Fout bij ophalen van rol:', error)
          setRole(null)
        }
      } else {
        setRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, role, setRole, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook om de context te gebruiken
export const useAuth = () => useContext(AuthContext)
