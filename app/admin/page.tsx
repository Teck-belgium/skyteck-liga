'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useRequireVerifiedUser } from '@/lib/authCheck'

export default function AdminPage() {
  const checked = useRequireVerifiedUser() // ✅ Wachten tot alles is geladen
  const { user, role: userRole } = useAuth()

  const [email, setEmail] = useState('')
  const [uid, setUid] = useState('')
  const [role, setRole] = useState('piloot')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !uid || !role) return alert('Alles invullen!')

    try {
      await setDoc(doc(db, 'users', uid), {
        email,
        role,
      })
      alert('✅ Gebruiker succesvol toegevoegd!')
      setEmail('')
      setUid('')
      setRole('piloot')
    } catch (err) {
      console.error('❌ Fout bij opslaan:', err)
      alert('Fout bij opslaan!')
    }
  }

  // ⏳ Nog aan het laden?
  if (!checked) {
    return <p className="p-6 text-white">🔄 Laden...</p>
  }

  // 🚫 Geen toegang?
  if (userRole !== 'admin' && userRole !== 'co-admin') {
    return <p className="p-6 text-red-500">⛔ Alleen admins mogen deze pagina zien.</p>
  }

  // ✅ Toegang verleend
  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">👤 Gebruiker toevoegen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Firebase UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="border p-2 w-full bg-black text-white"
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full bg-black text-white"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 w-full bg-black text-white">
          <option value="admin">Admin</option>
          <option value="co-admin">Co-admin (liga)</option>
          <option value="piloot">Piloot</option>
          <option value="leerling">Leerling</option>
          <option value="instructeur">Instructeur</option>
          <option value="Sleeppiloot">Sleeppiloot</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Toevoegen aan Firestore
        </button>
      </form>
    </div>
  )
}
