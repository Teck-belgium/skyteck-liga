import { db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function getUserRole(uid: string): Promise<string | null> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    const data = snap.data()
    return data.role || null
  } else {
    return null
  }
}
