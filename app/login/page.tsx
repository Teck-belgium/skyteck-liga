'use client'

import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null)
  const [infoMessage, setInfoMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setUnverifiedUser(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (!user.emailVerified) {
        setUnverifiedUser(user)
        await signOut(auth)
        setErrorMessage('✉️ Je e-mailadres is nog niet geverifieerd. Controleer je inbox.')
        return
      }

      router.push('/dashboard')
    } catch (error: any) {
      setErrorMessage('Login mislukt. Controleer je gegevens.')
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedUser) return
    try {
      await sendEmailVerification(unverifiedUser)
      setInfoMessage('✅ Verificatie-e-mail opnieuw verzonden. Controleer je inbox.')
    } catch (error) {
      setErrorMessage('❌ Er ging iets mis bij het verzenden van de verificatiemail.')
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

        {infoMessage && (
          <div className="bg-green-600 text-white p-2 mb-4 rounded text-sm">
            {infoMessage}
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

        {unverifiedUser && (
          <button
            type="button"
            onClick={handleResendVerification}
            className="mt-4 text-sm underline text-white hover:text-blue-300"
          >
            📩 Verificatiemail opnieuw versturen
          </button>
        )}
      </form>
    </div>
  )
}
