"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function StorageCleanupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const runCleanup = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // In a real app, you'd store this token securely
      // For demo purposes, we're using a simple hardcoded value
      const secretToken = "your-secret-token-here"

      const response = await fetch(`/api/storage-cleanup?token=${secretToken}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run cleanup")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Storage Cleanup</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <p className="mb-4">
          This tool deletes orphaned image files from Supabase Storage that were marked for deletion when their
          associated posts were removed.
        </p>

        <button onClick={runCleanup} disabled={isLoading} className="button button-primary">
          {isLoading ? "Running Cleanup..." : "Run Cleanup Now"}
        </button>

        <div className="mt-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded mb-4">{error}</div>}

          {result && (
            <div className="p-3 bg-green-50 text-green-700 rounded mb-4">
              <p className="font-medium">{result.message}</p>
              {result.results && (
                <p className="mt-2">
                  Successfully deleted: {result.results.filter((r: any) => r.success).length} files
                  <br />
                  Failed: {result.results.filter((r: any) => !r.success).length} files
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => router.push("/admin")} className="text-blue-600 hover:underline">
          Back to Admin Dashboard
        </button>
      </div>
    </div>
  )
}
