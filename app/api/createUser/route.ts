import { NextResponse } from 'next/server'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// 🔐 Je service account JSON vanuit Firebase
const serviceAccount = {
  projectId: 'jouw-project-id',
  clientEmail: '...',
  privateKey: '...',
}

// Initialiseer Admin SDK (alleen 1x)
try {
  initializeApp({
    credential: cert(serviceAccount),
  })
} catch (_) {
  // App bestaat al
}

export async function POST(req: Request) {
  const { email, password, role } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ message: 'Email en wachtwoord zijn verplicht' }, { status: 400 })
  }

  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
    })

    return NextResponse.json({ uid: userRecord.uid })
  } catch (err: any) {
    console.error('❌ Fout bij createUser:', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
