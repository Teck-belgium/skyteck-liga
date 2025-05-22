'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

interface VliegdagFormProps {
  selectedDate: Date | null
  clubs: string[]
}

export default function VliegdagForm({ selectedDate, clubs }: VliegdagFormProps) {
  const [selectedClub, setSelectedClub] = useState<string>(clubs[0] || '')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) {
      setMessage('Selecteer eerst een datum.')
      return
    }
    if (!startTime || !endTime) {
      setMessage('Vul start- en eindtijd in.')
      return
    }
    setLoading(true)
    setMessage('')

    try {
      const user = auth.currentUser
      if (!user) {
        setMessage('Je bent niet ingelogd.')
        setLoading(false)
        return
      }
      await addDoc(collection(db, 'vliegdagen'), {
        userId: user.uid,
        date: selectedDate.toISOString().substring(0, 10), // yyyy-mm-dd
        club: selectedClub,
        startTime,
        endTime,
        createdAt: new Date().toISOString(),
      })
      setMessage('Je vliegdag is succesvol opgeslagen!')
      setStartTime('')
      setEndTime('')
    } catch (error) {
      setMessage('Er is iets misgegaan: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded max-w-md mt-4">
      <h2 className="text-lg font-semibold mb-2">Vliegdag invoeren</h2>
      <p>Datum: {selectedDate ? selectedDate.toLocaleDateString() : 'Geen datum geselecteerd'}</p>

      <label className="block mt-2">
        Club:
        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          className="block mt-1 p-1 border rounded w-full"
        >
          {clubs.map((club) => (
            <option key={club} value={club}>
              {club}
            </option>
          ))}
        </select>
      </label>

      <label className="block mt-2">
        Beginuur:
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="block mt-1 p-1 border rounded w-full"
          required
        />
      </label>

      <label className="block mt-2">
        Einduur:
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="block mt-1 p-1 border rounded w-full"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Opslaan...' : 'Opslaan'}
      </button>

      {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
    </form>
  )
}
