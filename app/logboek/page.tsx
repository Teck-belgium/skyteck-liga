'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

interface Flight {
  id: string
  date: string
  startType: string
  instructor?: string
  remarks?: string
  startTime?: string
  landingTime?: string
  duration?: number // minuten
}

export default function LogboekPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/login')

      const flightsRef = collection(db, 'flights')
      const q = query(flightsRef, where('userId', '==', user.uid), orderBy('date', 'desc'))
      const snapshot = await getDocs(q)

      const fetchedFlights = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Flight, 'id'>),
      }))

      setFlights(fetchedFlights)
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mijn logboek</h1>
      {flights.length === 0 ? (
        <p>Je hebt nog geen vluchten geregistreerd.</p>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
