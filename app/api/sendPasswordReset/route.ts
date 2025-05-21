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
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ message: 'Email is verplicht' }, { status: 400 })
  }

  try {
    // Haal user op via email
    const user = await auth.getUserByEmail(email)
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: 'https://jouwdomein.be/login', // Pas aan naar jouw front-end login pagina
      // eventueel extra instellingen
    })

    // Stuur resetLink via mailservice of gebruik je eigen email provider
    // Hier demo, log naar console:
    console.log(`Stuur wachtwoord reset link naar ${email}: ${resetLink}`)

    // TODO: hier echt mail versturen via SendGrid, nodemailer etc.

    return NextResponse.json({ message: 'Reset link verstuurd' })
  } catch (err: any) {
    console.error('❌ Fout bij wachtwoord reset:', err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
