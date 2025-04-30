"use client"

import Link from "next/link"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"

export default function AuthHeader() {
  const { supabase, user } = useSupabase()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="header">
      <h1>ʕ •ᴥ• ʔ Bear Feed</h1>
      <nav className="header-nav">
        <Link href="/">Home</Link>
        {user ? (
          <>
            <button onClick={handleSignOut} className="link-button">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  )
}
