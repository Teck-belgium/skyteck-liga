'use client'

import { useState } from 'react'
import { CLUBS } from '@/lib/clubs'

const rolesList = ['lid', 'admin', 'instructeur'] // pas aan naar jouw rollen

export default function AddUserForm() {
  const [email, setEmail] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleRole(role: string) {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

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

    try {
      const res = await fetch('/api/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, roles }),
      })

      if (res.ok) {
        setMessage('Gebruiker succesvol toegevoegd. Er is een mail verstuurd.')
        setEmail('')
        setRoles([])
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
      {CLUBS.map((Club) => (
      <label key={Club}>
      <input 
        type="checkbox"
        value={Club}
        checked={selectedClubs.includes(club)}
      onChange={handleCheckboxChange}
        />
        {Club}
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
