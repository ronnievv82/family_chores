import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { FamilyProvider } from '@/contexts/family-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Family Chore Tracker',
  description: 'Track and manage family chores',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased transition-all duration-500 selection:bg-primary selection:text-primary-foreground`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          enableColorScheme
          storageKey='family-chore-theme'
        >
          <FamilyProvider>{children}</FamilyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
