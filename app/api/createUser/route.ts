import { NextResponse } from 'next/server'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { ServiceAccount } from 'firebase-admin'
import serviceAccount from '../../../lib/firebaseAdmin/serviceAccountKey.json' assert { type: 'json' }

const serviceAccountTyped = serviceAccount as ServiceAccount

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountTyped),
  })
}

const auth = getAuth()

export async function POST(req: Request) {
  const { email, roles } = await req.json()

  if (!email) {
    return NextResponse.json({ message: 'Email is verplicht' }, { status: 400 })
  }

  try {
    // Maak de gebruiker aan zonder wachtwoord
    const userRecord = await auth.createUser({
      email,
      emailVerified: false,
      disabled: false,
    })

    // Stel aangepaste claims in voor rollen
    if (roles && Array.isArray(roles)) {
      await auth.setCustomUserClaims(userRecord.uid, { roles })
    }

    // Genereer een wachtwoord-reset link en stuur die mee
    const resetLink = await auth.generatePasswordResetLink(email)

    // TODO: verstuur de resetLink per mail naar de gebruiker (via een mailservice)

    return NextResponse.json({ uid: userRecord.uid, resetLink })
  } catch (err: any) {
    console.error('❌ Fout bij createUser:', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
