"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // First, check if username is available
    const { data: existingUser } = await supabase.from("users").select("username").eq("username", username).single()

    if (existingUser) {
      setError("Username is already taken")
      setIsLoading(false)
      return
    }

    // Register the user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    if (data.user) {
      // Insert user data into our users table
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        username,
        email,
        password_hash: "managed-by-supabase-auth", // We don't store the actual password
        display_name: displayName || null,
      })

      if (insertError) {
        setError(insertError.message)
        setIsLoading(false)
        return
      }

      router.push("/")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="displayName" className="form-label">
          Display Name (optional)
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="form-input"
        />
      </div>

      <div>
        <button type="submit" className="button button-primary px-8" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </div>

      <p className="text-sm">
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </form>
  )
}
