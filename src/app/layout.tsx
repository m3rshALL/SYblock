import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart You - Обучающая игра по Solidity',
  description: 'Изучите программирование смарт-контрактов через интерактивные миссии',
  keywords: ['Solidity', 'блокчейн', 'смарт-контракты', 'обучение', 'игра'],
  authors: [{ name: 'Smart You Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Тихий запуск сида достижений (один раз, best-effort)
  if (typeof window !== 'undefined') {
    fetch('/api/seed').catch(() => {})
  }
  return (
    <html lang="ru">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 