import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PH Profile Compare — Know Your Candidates',
  description: 'Compare Philippine politicians side-by-side using verified, sourced data. Every score derived from official benchmarks, not opinions.',
  openGraph: {
    title: 'PH Profile Compare',
    description: 'Verified politician profiles for Philippine voters.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
