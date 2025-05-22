'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import VliegdagForm from './VliegdagForm'  // pas pad aan indien nodig
import { getUserClubs } from '@/lib/api'   // functie om clubs uit Firestore te halen
import { auth } from '@/lib/firebase'

export default function KalenderPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [clubs, setClubs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClubs() {
      const user = auth.currentUser
      if (!user) {
        setClubs([])
        setLoading(false)
        return
      }
      try {
        const userClubs = await getUserClubs(user.uid)
        setClubs(userClubs)
      } catch (error) {
        console.error('Fout bij ophalen clubs:', error)
        setClubs([])
      } finally {
        setLoading(false)
      }
    }
    fetchClubs()
  }, [])

  if (loading) return <p>Laden...</p>

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kalender</h1>

      <Calendar
        onClickDay={(date) => setSelectedDate(date)}
        value={selectedDate || new Date()}
      />

      {selectedDate && clubs.length > 0 && (
        <div className="mt-6">
          <VliegdagForm selectedDate={selectedDate} clubs={clubs} />
        </div>
      )}

      {selectedDate && clubs.length === 0 && (
        <p className="mt-4 text-red-600">
          Je bent aan geen enkele club gekoppeld, daarom kan je geen vliegdag invoeren.
        </p>
      )}
    </div>
  )
}
