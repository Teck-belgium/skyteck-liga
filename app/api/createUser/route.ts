import { NextResponse } from 'next/server'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { ServiceAccount } from 'firebase-admin'
import serviceAccount from '../../../lib/firebaseAdmin/serviceAccountKey.json' assert { type: 'json' }

const serviceAccountTyped = serviceAccount as ServiceAccount

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountTyped),
  })
}

const auth = getAuth()
const db = getFirestore()

// Hulpfunctie om een sterk random wachtwoord te genereren
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(req: Request) {
  const { email, roles } = await req.json()

  if (!email || !roles || !Array.isArray(roles)) {
    return NextResponse.json({ message: 'Email en rollen zijn verplicht' }, { status: 400 })
  }

  try {
    // Genereer tijdelijk wachtwoord
    const tempPassword = generateRandomPassword()

    // Maak de gebruiker aan met tijdelijk wachtwoord
    const userRecord = await auth.createUser({
      email,
      password: tempPassword,
      emailVerified: false,
    })

    // Sla rollen en andere info op in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      roles,
      createdAt: new Date(),
      mustChangePassword: true, // evt. flag om te forceren wachtwoord wijzigen
    })

    // Let op: password reset mail versturen kan niet via admin SDK, moet via client of eigen mailer

    return NextResponse.json({ message: 'Gebruiker aangemaakt. Stuur nu een wachtwoord reset mail.' })
  } catch (err: any) {
    console.error('❌ Fout bij createUser:', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
