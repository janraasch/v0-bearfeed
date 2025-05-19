import { createServerSupabaseClient } from "@/lib/supabase-server"
import AuthHeader from "@/components/auth-header"
import Link from "next/link"
import HomeClient from "@/components/home-client"
import type { PostProps } from "@/types/post"

export default async function Home() {
  const supabase = createServerSupabaseClient()

  // Get user with a single call - this validates the session token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let posts: PostProps[] = []

  // Only fetch posts if user is authenticated
  if (user) {
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
      .order("updated_at", { ascending: false })

    posts = postsData
  }

  return (
    <main>
      <AuthHeader />

      {user ? (
        // Content for authenticated users - using client component to manage state
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
