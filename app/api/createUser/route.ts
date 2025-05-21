import { NextResponse } from 'next/server'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import serviceAccount from '../../../lib/firebaseAdmin/serviceAccountKey.json' assert { type: 'json' }

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const auth = getAuth()

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ message: 'Email en wachtwoord zijn verplicht' }, { status: 400 })
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
    })

    return NextResponse.json({ uid: userRecord.uid })
  } catch (err: any) {
    console.error('❌ Fout bij createUser:', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
