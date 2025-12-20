import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/lib/supabase-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { SnowfallEffect } from "@/components/snowfall-effect"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bear Feed",
  description: "A minimalist feed for friends",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SnowfallEffect />
          <SupabaseProvider>
            <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
