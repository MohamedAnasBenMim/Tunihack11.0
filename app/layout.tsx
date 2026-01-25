import type { Metadata } from 'next'
import './globals.css'
import { StripeProvider } from './components/stripe-provider'

export const metadata: Metadata = {
  title: 'AI Checkout Demo - E-commerce Store',
  description: 'Agentic checkout powered by Groq AI with Stripe payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 min-h-screen">
        <StripeProvider>
          {children}
        </StripeProvider>
      </body>
    </html>
  )
}
