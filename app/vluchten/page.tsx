'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { requireVerifiedUser } from '@/lib/authCheck'

export default function VluchtenPage() {
  const [userId, setUserId] = useState('')
  const [date, setDate] = useState('')
  const [startType, setStartType] = useState('lier')
  const [instructor, setInstructor] = useState('')
  const [remarks, setRemarks] = useState('')
  const [startTime, setStartTime] = useState('')
  const [landingTime, setLandingTime] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return router.push('/login')
      setUserId(user.uid)
    })
    return () => unsubscribe()
  }, [router])

  function calculateDuration(start: string, end: string): number {
    const [startHours, startMinutes] = start.split(':').map(Number)
    const [endHours, endMinutes] = end.split(':').map(Number)
    const startTotal = startHours * 60 + startMinutes
    const endTotal = endHours * 60 + endMinutes
    return Math.max(endTotal - startTotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const duration = calculateDuration(startTime, landingTime)

      await addDoc(collection(db, 'flights'), {
        date,
        startType,
        instructor,
        remarks,
        startTime,
        landingTime,
        duration,
        userId,
        createdAt: serverTimestamp()
      })

      router.push('/dashboard')

    } catch (error) {
      alert('Fout bij opslaan')
      console.error(error)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vlucht toevoegen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border"
          required
        />
        <select value={startType} onChange={(e) => setStartType(e.target.value)} className="w-full p-2 border">
          <option value="lier">Lier</option>
          <option value="sleep">Sleep</option>
          <option value="zelfstart">Zelfstart</option>
        </select>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border"
          required
        />
        <input
          type="time"
          value={landingTime}
          onChange={(e) => setLandingTime(e.target.value)}
          className="w-full p-2 border"
          required
        />
        <input
          type="text"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          placeholder="Instructeur (optioneel)"
          className="w-full p-2 border"
        />
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Opmerkingen"
          className="w-full p-2 border"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Vlucht opslaan
        </button>
      </form>
    </div>
  )
}
