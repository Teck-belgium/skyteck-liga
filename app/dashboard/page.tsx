'use client'

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BookText, UserPlus, PencilLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { getUserRole } from '@/lib/getUserRole'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [startsThisYear, setStartsThisYear] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const role = await getUserRole(firebaseUser.uid)
        setRole(role)

        // ✅ Vluchten ophalen & tellen
        const currentYear = new Date().getFullYear()
        const flightsRef = collection(db, 'flights')
        const snapshot = await getDocs(query(flightsRef, where('userId', '==', firebaseUser.uid)))

        const flightsThisYear = snapshot.docs.filter(doc => {
          const flight = doc.data()
          const flightYear = new Date(flight.date).getFullYear()
          return flightYear === currentYear
        })

        setStartsThisYear(flightsThisYear.length)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welkom op je Dashboard</h1>
      {user && <p>Ingelogd als: <strong>{user.email}</strong></p>}
      {role && <p>Rol: <strong>{role}</strong></p>}
      {role && <p>Starts dit jaar: <strong>{startsThisYear}</strong></p>}

      <div className="flex gap-4 mt-6 flex-wrap">
        {/* Logboek (voor iedereen) */}
        <button
          onClick={() => router.push('/logboek')}
          className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
        >
          <BookText className="h-6 w-6 mb-1 text-blue-600" />
          <span className="text-sm">Logboek</span>
        </button>

        {/* Lid toevoegen (alleen voor admins) */}
        {role === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
          >
            <UserPlus className="h-6 w-6 mb-1 text-blue-600" />
            <span className="text-sm">Lid toevoegen</span>
          </button>
        )}

        {/* Vluchten ingeven (admin + co-admin) */}
        {['admin', 'co-admin'].includes(role || '') && (
          <button
            onClick={() => router.push('/vluchten')}
            className="p-4 border rounded flex flex-col items-center justify-center hover:bg-gray-100 transition w-32"
          >
            <PencilLine className="h-6 w-6 mb-1 text-green-600" />
            <span className="text-sm text-center">Vluchten ingeven</span>
          </button>
        )}
      </div>

      <button onClick={handleLogout} className="mt-6 bg-red-500 text-white px-4 py-2 rounded">
        Uitloggen
      </button>
    </div>
  )
}
