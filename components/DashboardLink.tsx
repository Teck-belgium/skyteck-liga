'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftSquare } from 'lucide-react'

export default function DashboardLink() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsubscribe()
  }, [])

  // Niet tonen op de dashboardpagina zelf
  if (!isLoggedIn || pathname === '/dashboard') return null

  return (
    <Link href="/dashboard">
      <div className="absolute top-4 right-4 flex items-center gap-2 p-2 border rounded hover:bg-gray-100 transition">
        <ArrowLeftSquare className="w-5 h-5 text-blue-600" />
        <span className="text-sm">Dashboard</span>
      </div>
    </Link>
  )
}
