"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient, User } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  user: User | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        // First check if we have a session
        const { data: sessionData } = await supabase.auth.getSession()

        // Only try to get the user if we have a session
        if (sessionData?.session) {
          const { data: userData } = await supabase.auth.getUser()
          setUser(userData.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error in auth state:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (session) {
            // When we have a session, get the authenticated user
            const { data: userData } = await supabase.auth.getUser()
            setUser(userData.user)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error("Error in auth state change:", error)
          setUser(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    getUser()
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
