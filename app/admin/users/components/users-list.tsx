"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type User = {
  id: string
  username: string
  email: string
  display_name: string | null
  created_at: string
  post_count: number
  comment_count: number
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, display_name, created_at")
      .order("created_at", { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error("Error fetching users:", error)
      setLoading(false)
      return
    }

    // Get post and comment counts for each user
    const usersWithCounts = await Promise.all(
      data.map(async (user) => {
        const { count: postCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const { count: commentCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        return {
          ...user,
          post_count: postCount || 0,
          comment_count: commentCount || 0,
        }
      }),
    )

    setUsers(usersWithCounts)
    setHasMore(data.length === pageSize)
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-medium mb-4">Users</h2>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No users found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Username</th>
                  <th className="text-left py-2 px-2">Display Name</th>
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-center py-2 px-2">Posts</th>
                  <th className="text-center py-2 px-2">Comments</th>
                  <th className="text-right py-2 px-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{user.username}</td>
                    <td className="py-3 px-2">{user.display_name || "-"}</td>
                    <td className="py-3 px-2">{user.email}</td>
                    <td className="py-3 px-2 text-center">{user.post_count}</td>
                    <td className="py-3 px-2 text-center">{user.comment_count}</td>
                    <td className="py-3 px-2 text-right whitespace-nowrap">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-sm text-blue-600 disabled:text-gray-400"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page + 1}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="text-sm text-blue-600 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
