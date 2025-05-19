"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  user: User | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  )
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set up the auth state listener that also fires with the initial session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)

      // Only set loading to false after we've checked the initial session
      if (event === "INITIAL_SESSION") {
        setIsLoading(false)
      }
    })

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <Context.Provider value={{ supabase, user }}>{!isLoading && children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
