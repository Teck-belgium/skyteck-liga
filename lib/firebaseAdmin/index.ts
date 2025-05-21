import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { ServiceAccount } from 'firebase-admin'
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' }

const serviceAccountTyped = serviceAccount as ServiceAccount

if (!getApps().length) {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // In productie: init met env vars
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  } else {
    // Lokaal: init met serviceAccountKey.json
    initializeApp({
      credential: cert(serviceAccountTyped),
    })
  }
}

export const auth = getAuth()
