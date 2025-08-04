import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KairosAI | Intelligent Strategic Document Platform',
  description: 'Harness the perfect moment for strategic insights with KairosAI. Transform enterprise documents into actionable intelligence using advanced AI, seamless document processing, and automated strategy generation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          {children}
        </div>
      </body>
    </html>
  )
}