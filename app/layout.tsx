import './globals.css'
import { Inter } from 'next/font/google'
import DashboardLink from '@/components/DashboardLink'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: 'SkyTeck Liga',
  description: 'Luchtvaartapp voor clubs en piloten',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={inter.variable}>
      <body>
        <AuthProvider>
          <div className="min-h-screen relative">
            <DashboardLink />
            <main className="pt-16 px-4">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
