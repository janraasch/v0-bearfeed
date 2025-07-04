"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Navigate to home page - auth state will be handled by the provider
    router.push("/")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

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

      <div>
        <button type="submit" className="button button-primary px-8" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>

      <p className="text-sm">
        Don't have an account? <Link href="/register">Register</Link>
      </p>
    </form>
  )
}
