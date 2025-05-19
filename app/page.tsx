"use client"

import { useState, useEffect } from "react"
import AuthHeader from "@/components/auth-header"
import Link from "next/link"
import { useSupabase } from "@/lib/supabase-provider"
import type { PostProps } from "@/types/post"
import HomeClient from "@/components/home-client"

export default function Home() {
  const { supabase, user } = useSupabase()
  const [posts, setPosts] = useState<PostProps[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch posts when user is authenticated
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data: postsData = [] } = await supabase
          .from("posts")
          .select(`
            *,
            users (id, username, display_name),
            comments (
              id,
              content,
              created_at,
              users (id, username, display_name)
            ),
            likes (
              id,
              user_id,
              users (id, username, display_name)
            ),
            post_images (
              id,
              storage_path,
              file_name,
              content_type,
              display_order
            )
          `)
          .order("created_at", { ascending: false })

        setPosts(postsData)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [supabase, user])

  // Show loading state
  if (isLoading) {
    return (
      <main>
        <AuthHeader />
        <div className="text-center py-8">Loading...</div>
      </main>
    )
  }

  return (
    <main>
      <AuthHeader />

      {user ? (
        // Content for authenticated users
        <HomeClient initialPosts={posts} currentUser={user} />
      ) : (
        // Content for unauthenticated users
        <div>
          <h2 className="text-2xl font-medium mb-4">Welcome to ʕ •ᴥ• ʔ Bear Feed</h2>
          <p className="mb-6">A minimalist social feed inspired by Bear Blog.</p>
          <div className="mb-8">
            <Link href="/login" className="button button-primary mr-4 px-8">
              Login
            </Link>
            <Link href="/register" className="button px-8">
              Register
            </Link>
          </div>
          <div className="max-w-md text-sm text-gray-600">
            <p>
              Bear Feed is a simple, content-focused social platform where you can share thoughts and connect with
              friends.
            </p>
            <p className="mt-2">Sign in to see posts from your network and join the conversation.</p>
          </div>
        </div>
      )}
    </main>
  )
}
