'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useRequireVerifiedUser } from '@/lib/authCheck'

export default function AdminPage() {
  const checked = useRequireVerifiedUser()
  const { user, role: userRole, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') // Nieuw wachtwoordveld
  const [uid, setUid] = useState('')
  const [role, setRole] = useState('piloot')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !role) {
      return alert('⚠️ Alles invullen!')
    }

    try {
      // ✅ Maak gebruiker aan in Firebase Authentication via Cloud Function of Admin SDK via backend
      const res = await fetch('/api/createUser', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Fout bij maken van gebruiker')

      const { uid } = data

      // ✅ Voeg toe aan Firestore
      await setDoc(doc(db, 'users', uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
      })

      alert('✅ Gebruiker aangemaakt!')
      setEmail('')
      setPassword('')
      setRole('piloot')
    } catch (err) {
      console.error('❌ Fout bij toevoegen:', err)
      alert('Fout bij toevoegen!')
    }
  }

  if (!checked || loading || userRole === null) {
    return <p className="p-6 text-white">🔄 Bezig met laden...</p>
  }

  if (userRole !== 'admin' && userRole !== 'co-admin') {
    return <p className="p-6 text-red-500">⛔ Alleen admins mogen deze pagina zien.</p>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">👥 Lid toevoegen</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Linker kolom */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full bg-black text-white"
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full bg-black text-white"
          />
        </div>

        {/* Rechter kolom */}
        <div className="space-y-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 w-full bg-black text-white"
          >
            <option value="admin">Admin</option>
            <option value="co-admin">Co-admin (liga)</option>
            <option value="piloot">Piloot</option>
            <option value="leerling">Leerling</option>
            <option value="instructeur">Instructeur</option>
            <option value="Sleeppiloot">Sleeppiloot</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Toevoegen aan Firebase
          </button>
        </div>
      </form>
    </div>
  )
}

