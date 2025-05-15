'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserRole } from '@/lib/getUserRole'
import { useRequireVerifiedUser } from '@/lib/authCheck''

interface Flight {
  id: string
  userId: string
  date: string
  startType: string
  instructor?: string
  remarks?: string
  startTime?: string
  landingTime?: string
  duration?: number // in minuten
}

export default function LogboekPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [userId, setUserId] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/login')

      setUserId(user.uid)

      const fetchedRole = await getUserRole(user.uid)
      setRole(fetchedRole)

      const flightsRef = collection(db, 'flights')
      const q = query(flightsRef, orderBy('date', 'desc'))
      const snapshot = await getDocs(q)

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Flight, 'id'>),
      }))

      // Leden zien alleen eigen vluchten, admin alles
      const filtered = fetchedRole === 'admin'
        ? data
        : data.filter(f => f.userId === user.uid)

      setFlights(filtered)
    })

    return () => unsubscribe()
  }, [router])

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Weet je zeker dat je deze vlucht wilt verwijderen?')
    if (!confirm) return
    try {
      await deleteDoc(doc(db, 'flights', id))
      setFlights(prev => prev.filter(f => f.id !== id))
    } catch (error) {
      console.error('Verwijderen mislukt:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mijn logboek</h1>
      {flights.length === 0 ? (
        <p>Geen vluchten gevonden.</p>
      ) : (
        <ul className="space-y-4">
          {flights.map((flight) => (
            <li key={flight.id} className="border rounded p-4">
              <p><strong>Datum:</strong> {flight.date}</p>
              <p><strong>Starttype:</strong> {flight.startType}</p>
              {flight.instructor && <p><strong>Instructeur:</strong> {flight.instructor}</p>}
              {flight.startTime && <p><strong>Starttijd:</strong> {flight.startTime}</p>}
              {flight.landingTime && <p><strong>Landtijd:</strong> {flight.landingTime}</p>}
              {flight.duration !== undefined && (
                <p><strong>Duur:</strong> {Math.floor(flight.duration / 60)}u {flight.duration % 60}min</p>
              )}
              {flight.remarks && <p><strong>Opmerkingen:</strong> {flight.remarks}</p>}

              <div className="flex gap-2 mt-2">
                {/* Alleen leden mogen hun eigen opmerking aanpassen */}
                {role !== 'admin' && flight.userId === userId && (
                  <Link
                    href={`/vluchten/${flight.id}/edit-remark`}
                    className="text-sm text-blue-600 underline"
                  >
                    ✏️ Opmerking aanpassen
                  </Link>
                )}

                {/* Alleen admins zien bewerk + verwijder knoppen */}
                {role === 'admin' && (
                  <>
                    <Link
                      href={`/vluchten/${flight.id}/edit`}
                      className="text-sm text-blue-600 underline"
                    >
                      ✏️ Bewerken
                    </Link>
                    <button
                      onClick={() => handleDelete(flight.id)}
                      className="text-sm text-red-600 underline"
                    >
                      🗑️ Verwijderen
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

