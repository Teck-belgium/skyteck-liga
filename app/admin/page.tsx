'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { doc, setDoc } from 'firebase/firestore'
import { getUserRole } from '@/lib/getUserRole'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [uid, setUid] = useState('')
  const [role, setRole] = useState('piloot')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/login')
      const role = await getUserRole(user.uid)
      setIsAdmin(role === 'admin')
    })
    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !uid || !role) return alert('Alles invullen!')

    try {
      await setDoc(doc(db, 'users', uid), {
        email,
        role,
      })
      alert('Gebruiker toegevoegd!')
      setEmail('')
      setUid('')
      setRole('piloot')
    } catch (err) {
      alert('Fout bij opslaan!')
      console.error(err)
    }
  }

  if (!isAdmin) return <p className="p-6 text-red-500">Alleen admins mogen deze pagina zien.</p>

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gebruiker toevoegen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Firebase UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 w-full">
          <option value="admin">Admin</option>
          <option value="piloot">Piloot</option>
          <option value="leerling">Leerling</option>
          <option value="instructeur">Instructeur</option>
          <option value="co-admin">Co-admin (liga)</option>
          <option value="Sleeppiloot">Sleeppiloot</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Toevoegen aan Firestore
        </button>
      </form>
    </div>
  )
}
