// lib/api.ts
import { db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function getUserClubs(userId: string): Promise<string[]> {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const data = userSnap.data()
    return data.clubs || [] // Verwacht dat clubs een array is
  } else {
    return []
  }
}


export {}
