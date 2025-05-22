import { NextResponse } from 'next/server'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from firebase-admin/firestore'
import type { ServiceAccount } from 'firebase-admin'
import serviceAccount from '../../../lib/firebaseAdmin/serviceAccountKey.json' assert { type: 'json' }
import { sendPasswordResetMail } from '../../../lib/sendMail'

const serviceAccountTyped = serviceAccount as ServiceAccount

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountTyped),
  })
}

const auth = getAuth()
const db = getFirestore()

export async function POST(req: Request) {
  const { email, roles, clubs } = await req.json()

  if (!email) {
    return NextResponse.json({ message: 'Email is verplicht' }, { status: 400 })
  }

  if (!roles) {
    return NextResponse.json({ message: 'Minstens één rol is vereist'}, {status: 400})
  }

  if (!clubs) {
    return NextResponse.jsnon({ message: 'Minstens één club is vereist'}, {status: 400})
  }

  try {
    // 1. gebruiker aanmaken
    const userRecord = await auth.createUser({
      email,
      emailVerified: false,
      disabled: false,
    })

    //  2. rollen instellen via custom claims
    await auth.setCustomUsersClaims(userRecord.uid, { roles })

   // 3. clubs + extra info opslaan in firestore
  await db.collection('users').doc(userRecord.uid).set({
    email,
    roles,
    clubs,
    createAt: new Date(),
  })

  //4. verzend reset-link via mail
  const resetLink = await auth.generatePasswordResetLink(email)
  await sendPasswordResetMail(email, resetLink)

  return NextResponse.json({ uid: userRecord.uid, resetLink })
} catch (err:any) {
    console.error('❌ Fout bij createUser:', err)
    return NextResponse.json({ message: err.message, {status: 500 }
  }
}
