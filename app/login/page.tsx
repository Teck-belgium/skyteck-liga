'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (!user.emailVerified) {
        await signOut(auth) // onmiddellijk uitloggen
        setErrorMessage('✉️ Je e-mailadres is nog niet geverifieerd. Controleer je inbox.')
        return
      }

      router.push('/dashboard')
    } catch (error: any) {
      setErrorMessage('Login mislukt. Controleer je gegevens.')
    }
  }

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-blue-800 text-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        {errorMessage && (
          <div className="bg-red-600 text-white p-2 mb-4 rounded text-sm">
            {errorMessage}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-2 rounded text-black"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wachtwoord"
          className="w-full p-2 mb-4 rounded text-black"
          required
        />
        <button
          type="submit"
          className="bg-white text-blue-900 font-semibold w-full p-2 rounded"
        >
          Inloggen
        </button>
      </form>
    </div>
  )
}
