'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookText, UserPlus, PencilLine } from 'lucide-react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { useRequireVerifiedUser } from '@/lib/authCheck'

export default function DashboardPage() {
  useRequireVerifiedUser()
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<string>('') // geen nul meer nodig
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
          setRoles((data.roles?.join(', ') || null)// alle rollen tonen
          setClubs(data.clubs || [])
        }
      } else {
        setUser(null)
        setRoles(null)
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

  // 🔓 Uitloggen
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welkom op je Dashboard</h1>
      {user && <p>Ingelogd als: <strong>{user.email}</strong></p>}
      {roles && <p>Rol: <strong>{roles}</strong></p>}
      {roles && <p>Starts dit jaar: <strong>{startsThisYear}</strong></p>}
      {clubs.length > 0 && (
      <p>Clubs: <strong>{clubs.join(', ')}</strong></p>
      )}


      <div className="flex gap-4 mt-6 flex-wrap">
        {/* Logboek (voor iedereen) */}
        <button
          onClick={() => router.push('/logboek')}
          className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
        >
          <BookText className="h-6 w-6 mb-1 text-blue-600" />
          <span className="text-sm">Logboek</span>
        </button>

        {/* Vluchten ingeven (admin + co-admin + hoofd-admin) */}
        {['admin', 'co-admin', 'hoofd-admin'].includes(roles || '') && (
          <button
            onClick={() => router.push('/vluchten')}
            className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
          >
            <PencilLine className="h-6 w-6 mb-1 text-green-600" />
            <span className="text-sm text-center">Vluchten ingeven</span>
          </button>
        )}

        {/* Lid toevoegen (alleen voor admins) */}
        {['admin', 'co-admin', 'hoofd-admin'].includes(roles || '') && (
          <button
            onClick={() => router.push('/admin/manageUsers')}
            className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
          >
            <UserPlus className="h-6 w-6 mb-1 text-blue-600" />
            <span className="text-sm">Leden</span>
          </button>
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
