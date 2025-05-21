'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { useRequireVerifiedUser } from '@/lib/authCheck'

type UserData = {
  id: string
  email: string
  roles: string[]
}

export default function ManageUsersPage() {
  const checked = useRequireVerifiedUser()
  const { roles: userRoles, loading } = useAuth()

  const [users, setUsers] = useState<UserData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!checked || loading) return

    if (userRoles !== 'admin' && userRoles !== 'co-admin') {
      setError('⛔ Alleen admins mogen deze pagina zien.')
      return
    }

    const fetchUsers = async () => {
      setLoadingUsers(true)
      setError(null)
      try {
        const snapshot = await getDocs(collection(db, 'users'))
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          roles: doc.data().roles || [],
        }))
        setUsers(usersData)
      } catch (err: any) {
        setError('❌ Fout bij laden gebruikers: ' + err.message)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [checked, loading, userRole])

  // Rollen aanpassen (checkbox toggle)
  const toggleRole = async (userId: string, role: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    let newRoles = user.roles.includes(role)
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role]

    // Update Firestore
    try {
      await updateDoc(doc(db, 'users', userId), { roles: newRoles })
      setUsers(users.map(u => u.id === userId ? { ...u, roles: newRoles } : u))
    } catch (err) {
      alert('Fout bij updaten rollen')
      console.error(err)
    }
  }

  if (!checked || loading) return <p className="p-6 text-white">🔄 Bezig met laden...</p>
  if (error) return <p className="p-6 text-red-500">{error}</p>

  const roleOptions = [
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
      {loadingUsers ? (
        <p>🔄 Gebruikers laden...</p>
      ) : (
        <table className="w-full border border-gray-600 text-left">
          <thead>
            <tr>
              <th className="border border-gray-600 p-2">E-mail</th>
              {roleOptions.map(role => (
                <th key={role} className="border border-gray-600 p-2">{role}</th>
              ))}
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
                      disabled={user.id === 'currentUserId' /* eventueel je eigen id om te beschermen */}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
