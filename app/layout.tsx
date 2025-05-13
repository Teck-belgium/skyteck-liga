// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import DashboardLink from '@/components/DashboardLink'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="nl">
      <body className={inter.className}>
        <div className="min-h-screen relative">
          {/* Dashboard-link rechtsboven (alleen zichtbaar als ingelogd en NIET op dashboard) */}
          <DashboardLink />

          {/* Pagina-inhoud */}
          <main className="pt-16 px-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

