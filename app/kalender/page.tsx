'use client'

import { useEffect, useState } from 'react'
import { useRequireVerifiedUser } from '@/lib/authCheck'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function KalenderPage() {
  useRequireVerifiedUser()

  const [userId, setUserId] = useState<string | null>(null)
  const [clubs, setClubs] = useState<string[]>([])
  const [selectedClub, setSelectedClub] = useState<string | null>(null)

  // ✅ Ophalen van huidige gebruiker
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)

        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('__name__', '==', user.uid))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          const userClubs = data.clubs || []
          setClubs(userClubs)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  // ✅ Automatisch club selecteren als er maar 1 is
  useEffect(() => {
    if (clubs.length === 1) {
      setSelectedClub(clubs[0])
    }
  }, [clubs])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kalender</h1>

      {/* 📅 Als gebruiker 1 club heeft */}
      {clubs.length === 1 && (
        <div>
          <p>Club: <strong>{clubs[0]}</strong></p>
          <input type="hidden" value={clubs[0]} />
        </div>
      )}

      {/* 📅 Als gebruiker meerdere clubs heeft */}
      {clubs.length > 1 && (
        <div className="mb-4">
          <label className="block mb-1">Kies je club:</label>
          <select
            value={selectedClub || ''}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">-- Selecteer club --</option>
            {clubs.map((club) => (
              <option key={club} value={club}>{club}</option>
            ))}
          </select>
        </div>
      )}

      {/* 📌 Ingevulde selectie */}
      {selectedClub && (
        <div className="mt-4">
          <p>Geselecteerde club: <strong>{selectedClub}</strong></p>
          {/* Hier kun je de kalendercomponent tonen of invoervelden */}
        </div>
      )}
    </div>
  )
}

