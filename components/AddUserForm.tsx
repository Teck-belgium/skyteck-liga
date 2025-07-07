'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase' // dit is jouw client-side firestore config

const rolesList = ['lid', 'admin', 'instructeur', 'hoofd-admin']

export default function AddUserForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [selectedClubs, setSelectedClubs] = useState<string[]>([])
  const [clubs, setClubs] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchClubs(){
      try {
        const snapshot = await getDocs(collection(db, 'clubs'))
        const names = snapshot.docs.map(doc => doc.data().name as string)
        setClubs(names)
      } catch (error) {
        console.error('Fout bij het ophalen clubs:', error)
        setMessage('Fout bij ophalen van clubs.')
      }
    }

    fetchClubs()
  }, [])
  
  function toggleRole(role: string) {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  function toggleClub(club: string) {
    setSelectedClubs(prev =>
      prev.includes(club) ? prev.filter(c => c !== club) : [...prev, club]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!name.trim()) {
      setMessage('Naam is verplicht.')
      setLoading(false)
      return
    }
    
    if (!email) {
      setMessage('Email is verplicht.')
      setLoading(false)
      return
    }

    if (roles.length === 0) {
      setMessage('Selecteer minstens één rol.')
      setLoading(false)
      return
    }

    if (selectedClubs.length === 0) {
      setMessage('Selecteer minstens één club.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, roles, clubs: selectedClubs }),
      })

      if (res.ok) {
        setMessage('Gebruiker succesvol toegevoegd. Er is een mail verstuurd.')
        
        setName('')
        setEmail('')
        setRoles([])
        setSelectedClubs([])
      } else {
        const data = await res.json()
        setMessage('Fout: ' + (data.message || 'Onbekende fout'))
      }
    } catch (err) {
      setMessage('Fout bij verbinden met server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Naam:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Rollen:</label>
        {rolesList.map(role => (
          <label key={role} style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              checked={roles.includes(role)}
              onChange={() => toggleRole(role)}
            />
            {role}
          </label>
        ))}
      </div>

      <div>
        <label>Clubs:</label>
        {clubs.map(club => (
          <label key={club} style={{ display: 'block' }}>
            <input
              type="checkbox"
              value={club}
              checked={selectedClubs.includes(club)}
              onChange={() => toggleClub(club)}
            />
            {club}
          </label>
        ))}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Verzenden...' : 'Toevoegen'}
      </button>

      {message && <p>{message}</p>}
    </form>
  )
}
