'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { useRequireVerifiedUser } from '@/lib/authCheck'
import { useRouter } from 'next/navigation'

type UserData = {
  id: string
  email: string
  roles: string[]
  clubs: string[]
}

type ClubData = {
  id: string
  name: string
}

export default function ManageUsersPage() {
  const checked = useRequireVerifiedUser()
  const { roles: userRoles, loading } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [clubs, setClubs] = useState<ClubData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingClubs, setLoadingClubs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Direct log bij elke render
  console.log('🧪 render ManageUsersPage - checked, loading, userRoles:', checked, loading, userRoles)

  useEffect(() => {
    console.log('🧪 useEffect triggered - checked, loading, userRoles:', checked, loading, userRoles)

    if (!checked || loading) return

    if (!userRoles.includes('admin') && !userRoles.includes('co-admin') && !userRoles.includes('hoofd-admin')) {
      setError('⛔ Alleen admins mogen deze pagina zien.1')
      return
    }

    // Clubs ophalen
    const fetchClubs = async () => {
      setLoadingClubs(true)
      try {
        console.log('🧪 fetchClubs starten...')
        const snapshot = await getDocs(collection(db, 'clubs'))
        const clubList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name as string,
        }))
        console.log('🧪 fetchClubs resultaten:', clubList)
        setClubs(clubList)
      } catch (err: any) {
        console.error('❌ Fout bij laden clubs:', err)
        setError('❌ Fout bij laden clubs: ' + err.message)
      } finally {
        setLoadingClubs(false)
      }
    }
    
    // Users ophalen
    const fetchUsers = async () => {
      setLoadingUsers(true)
      setError(null)
      try {
        console.log('🧪 fetchUsers starten...')
        const snapshot = await getDocs(collection(db, 'users'))
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          roles: doc.data().roles || [],
          clubs: doc.data().clubs || [],
        }))
        console.log('🧪 fetchUsers resultaten:', usersData)
        setUsers(usersData)
      } catch (err: any) {
        console.error('❌ Fout bij laden gebruikers:', err)
        setError('❌ Fout bij laden gebruikers: ' + err.message)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchClubs()
    fetchUsers()
  }, [checked, loading, userRoles])

  // Rollen aanpassen (checkbox toggle)
  const toggleRole = async (userId: string, role: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    let newRoles = user.roles.includes(role)
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role]

    try {
      console.log(`🧪 update roles voor gebruiker ${userId}:`, newRoles)
      await updateDoc(doc(db, 'users', userId), { roles: newRoles })
      setUsers(users.map(u => u.id === userId ? { ...u, roles: newRoles } : u))
    } catch (err) {
      alert('Fout bij updaten rollen')
      console.error(err)
    }
  }
  
  // Clubs toggle
  const toggleClub = async (userId: string, clubId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const newClubs = user.clubs.includes(clubId)
      ? user.clubs.filter(c => c !== clubId)
      : [...user.clubs, clubId]

    try {
      console.log(`🧪 update clubs voor gebruiker ${userId}:`, newClubs)
      await updateDoc(doc(db, 'users', userId), { clubs: newClubs })
      setUsers(users.map(u => u.id === userId ? { ...u, clubs: newClubs } : u))
    } catch (err) {
      alert('Fout bij updaten clubs')
      console.error(err)
    }
  }

  if (!checked || loading) return <p className="p-6 text-white">🔄 Bezig met laden...</p>
  if (error) return <p className="p-6 text-red-500">{error}</p>

  const roleOptions = [
    'hoofd-admin',
    'admin',
    'co-admin',
    'piloot',
    'leerling',
    'instructeur',
    'Sleeppiloot',
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">👥 Beheer leden</h1>
      <button
        onClick={() => router.push('/admin')}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Lid toevoegen
      </button>
      {(loadingUsers || loadingClubs) ? (
        <p>🔄 Gegevens laden...</p>
      ) : (
        <table className="w-full border border-gray-600 text-left">
          <thead>
            <tr>
              <th className="border border-gray-600 p-2">E-mail</th>
              {roleOptions.map(role => (
                <th key={role} className="border border-gray-600 p-2">{role}</th>
              ))}
              <th className="border border-gray-600 p-2">Clubs</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-800">
                <td className="border border-gray-600 p-2">{user.email}</td>
                {roleOptions.map(role => (
                  <td key={role} className="border border-gray-600 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={user.roles.includes(role)}
                      onChange={() => toggleRole(user.id, role)}
                      disabled={user.id === 'currentUserId'}
                    />
                  </td>
                ))}
                <td className="border border-gray-600 p-2">
                  {clubs.length === 0 ? (
                    <p>Geen clubs gevonden</p>
                  ) : (
                    clubs.map(club => (
                      <label key={club.id} className="mr-3 inline-block">
                        <input
                          type="checkbox"
                          checked={user.clubs.includes(club.id)}
                          onChange={() => toggleClub(user.id, club.id)}
                        />
                        <span className="ml-1">{club.name}</span>
                      </label>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
