'use client'

import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default function KalenderPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [clubs, setClubs] = useState<string[]>([])
  const [selectedClub, setSelectedClub] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)

        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const data = userSnap.data()
          if (data.clubs) {
            setClubs(data.clubs)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedDate || !selectedClub || !startTime || !endTime || !userId) {
      setMessage('Vul alle velden in.')
      return
    }

    try {
      await addDoc(collection(db, 'aanwezigheden'), {
        userId,
        date: selectedDate.toISOString(),
        club: selectedClub,
        start: startTime,
        end: endTime,
      })
      setMessage('Inschrijving opgeslagen ✅')
      setSelectedClub('')
      setStartTime('')
      setEndTime('')
    } catch (err) {
      console.error(err)
      setMessage('Fout bij opslaan 😥')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kalender</h1>

      <Calendar onClickDay={setSelectedDate} />

      {selectedDate && (
        <div className="mt-6">
          <p>Geselecteerde dag: <strong>{selectedDate.toDateString()}</strong></p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {clubs.length > 1 && (
              <div>
                <label>Kies club:</label>
                <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)} required>
                  <option value="">-- Selecteer --</option>
                  {clubs.map(club => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
              </div>
            )}

            {clubs.length === 1 && (
              <div>
                <p>Club: <strong>{clubs[0]}</strong></p>
                <input type="hidden" value={clubs[0]} />
                {setSelectedClub(clubs[0])}
              </div>
            )}

            <div>
              <label>Startuur:</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>

            <div>
              <label>Einduur:</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Opslaan</button>

            {message && <p className="mt-2">{message}</p>}
          </form>
        </div>
      )}
    </div>
  )
}
