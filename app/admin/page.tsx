'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useRequireVerifiedUser } from '@/lib/authCheck'

export default function AdminPage() {
  const checked = useRequireVerifiedUser()
  const { user, role: userRole, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const roleOptions = [
    'admin',
    'co-admin',
    'piloot',
    'leerling',
    'instructeur',
    'Sleeppiloot',
  ]

  const toggleRole = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter((r) => r !== role))
    } else {
      setRoles([...roles, role])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || roles.length === 0) {
      alert('⚠️ Vul een e-mail in en kies minstens één rol.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // ✅ Stuur e-mail + rollen naar backend
      const res = await fetch('/api/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, roles }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      const { uid } = data

      // ✅ Voeg toe aan Firestore
      await setDoc(doc(db, 'users', uid), {
        email,
        roles,
        createdAt: new Date().toISOString(),
      })

      setMessage('✅ Gebruiker toegevoegd en mail verzonden!')
      setEmail('')
      setRoles([])
    } catch (err: any) {
      console.error('❌ Fout bij toevoegen:', err)
      setMessage('❌ Fout: ' + err.message)
    } finally {
      setIsSubmitting(false)
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
            required
          />
        </div>

        {/* Rechter kolom */}
        <div className="space-y-4">
          <p className="font-medium">📌 Rollen</p>
          <div className="flex flex-wrap gap-4">
            {roleOptions.map((role) => (
              <label key={role} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            {isSubmitting ? 'Bezig...' : 'Toevoegen aan Firebase'}
          </button>
        </div>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
