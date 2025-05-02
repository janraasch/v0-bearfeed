import { createServerSupabaseClient } from "@/lib/supabase-server"
import AuthHeader from "@/components/auth-header"
import Link from "next/link"
import PostList from "@/components/post-list"
import NewPostForm from "@/components/new-post-form"
import RetentionNotice from "@/components/retention-notice"

export default async function Home() {
  const supabase = createServerSupabaseClient()

  // Get session first (this won't throw an error if no session exists)
  const { data: sessionData } = await supabase.auth.getSession()

  // Only try to get the user if we have a session
  let user = null
  let posts = []

  if (sessionData?.session) {
    // Get authenticated user
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user

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
        .order("created_at", { ascending: false })

      posts = postsData
    }
  }

  return (
    <main>
      <AuthHeader />

      {user ? (
        // Content for authenticated users
        <>
          <div className="mb-8">
            <NewPostForm />
          </div>

          {posts.length > 0 ? (
            <PostList posts={posts} currentUser={user} />
          ) : (
            <div className="text-center py-8">
              <p>No posts yet.</p>
              <p>Be the first to post something!</p>
            </div>
          )}

          <RetentionNotice />
        </>
      ) : (
        // Content for unauthenticated users
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Welcome to ʕ •ᴥ• ʔ Bear Feed</h2>
          <p className="mb-6">A minimalist social feed inspired by Bear Blog.</p>
          <p className="mb-8">
            <Link href="/login" className="button button-primary mr-4">
              Login
            </Link>
            <Link href="/register" className="button">
              Register
            </Link>
          </p>
          <div className="max-w-md mx-auto text-sm text-gray-600">
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
