"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type Post = {
  id: string
  content: string
  created_at: string
  user_id: string
  users: {
    username: string
    display_name: string | null
  }
  comments_count: number
  likes_count: number
}

export default function PostsManager() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 5

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchPosts()
  }, [page])

  const fetchPosts = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, 
        content, 
        created_at, 
        user_id,
        users (username, display_name)
      `)
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error("Error fetching posts:", error)
      setLoading(false)
      return
    }

    // Get comment counts
    const postsWithCounts = await Promise.all(
      data.map(async (post) => {
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)

        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)

        return {
          ...post,
          comments_count: commentsCount || 0,
          likes_count: likesCount || 0,
        }
      }),
    )

    setPosts(postsWithCounts)
    setHasMore(data.length === pageSize)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)

    const { error } = await supabase.from("posts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting post:", error)
      setDeleteId(null)
      return
    }

    setPosts(posts.filter((post) => post.id !== id))
    setDeleteId(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-medium mb-4">Manage Posts</h2>

      {loading ? (
        <div className="text-center py-4">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No posts found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Content</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-center py-2 px-2">Comments</th>
                  <th className="text-center py-2 px-2">Likes</th>
                  <th className="text-right py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">{post.users.display_name || post.users.username}</td>
                    <td className="py-3 px-2">{truncateContent(post.content)}</td>
                    <td className="py-3 px-2 whitespace-nowrap">{formatDate(post.created_at)}</td>
                    <td className="py-3 px-2 text-center">{post.comments_count}</td>
                    <td className="py-3 px-2 text-center">{post.likes_count}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleteId === post.id}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        {deleteId === post.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
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
