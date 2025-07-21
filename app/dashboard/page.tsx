'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookText, UserPlus, PencilLine, Calendar } from 'lucide-react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { useRequireVerifiedUser } from '@/lib/authCheck'

export default function DashboardPage() {
  useRequireVerifiedUser()
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [clubs, setClubs] = useState<string[]>([])
  const [startsThisYear, setStartsThisYear] = useState<number>(0)
  const router = useRouter()

  // 🔐 Haal ingelogde gebruiker en rol op
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        const docRef = doc(db, 'users', currentUser.uid)
        const userDoc = await getDoc(docRef)

        if (userDoc.exists()) {
          const data = userDoc.data()
          const rolesData = data.roles

          const safeRoles = Array.isArray(rolesData)
            ? rolesData
            : typeof rolesData === 'string'
              ? rolesData.split(',').map(r => r.trim())
              : []

          setRoles(safeRoles)
          setClubs(Array.isArray(data.clubs) ? data.clubs : [])
          console.log('✅ Gebruikersrollen:', safeRoles)
        }
      } else {
        setUser(null)
        setRoles([])
        setClubs([])
      }
    })

    return () => unsubscribe()
  }, [])

  // 📅 Tel starts dit jaar
  useEffect(() => {
    const fetchStarts = async () => {
      if (!user) return

      const currentYear = new Date().getFullYear()
      const flightsRef = collection(db, 'flights')
      const snapshot = await getDocs(query(flightsRef, where('userId', '==', user.uid)))

      const flightsThisYear = snapshot.docs.filter(doc => {
        const flight = doc.data()
        const flightYear = new Date(flight.date).getFullYear()
        return flightYear === currentYear
      })

      setStartsThisYear(flightsThisYear.length)
    }

    fetchStarts()
  }, [user])

  // Bepaal toegang op basis van rollen
  const hasAccess = roles.some(role =>
    ['admin', 'hoofd-admin', 'co-admin'].includes(role)
  )

  // 🔓 Uitloggen
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welkom op je Dashboard</h1>
      {user && <p>Ingelogd als: <strong>{user.email}</strong></p>}
      <p>Rol: <strong>{roles.length > 0 ? roles.join(', ') : 'Geen rollen gevonden'}</strong></p>
      <p>Starts dit jaar: <strong>{startsThisYear}</strong></p>
      {clubs.length > 0 && <p>Clubs: <strong>{clubs.join(', ')}</strong></p>}

      <div className="flex gap-4 mt-6 flex-wrap">
        <button
          onClick={() => router.push('/kalender')}
          className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
        >
          <Calendar className="w-5 h-5" />
          Kalender
        </button>

        <button
          onClick={() => router.push('/logboek')}
          className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
        >
          <BookText className="h-6 w-6 mb-1 text-blue-600" />
          <span className="text-sm">Logboek</span>
        </button>

        {hasAccess && (
          <>
            <button
              onClick={() => router.push('/vluchten')}
              className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
            >
              <PencilLine className="h-6 w-6 mb-1 text-green-600" />
              <span className="text-sm text-center">Vluchten ingeven</span>
            </button>

            <button
              onClick={() => router.push('/admin/manageUsers')}
              className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
            >
              <UserPlus className="h-6 w-6 mb-1 text-blue-600" />
              <span className="text-sm">Leden</span>
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Uitloggen
      </button>
    </div>
  )
}
