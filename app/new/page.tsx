import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import NewPostForm from "@/components/new-post-form"

export default async function NewPostPage() {
  const supabase = createServerSupabaseClient()

  // Get session first (this won't throw an error if no session exists)
  const { data: sessionData } = await supabase.auth.getSession()

  // Redirect if no session
  if (!sessionData?.session) {
    redirect("/login")
  }

  // Get authenticated user data if we have a session
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  // Double-check we have a user
  if (!user) {
    redirect("/login")
  }

  return (
    <main>
      <AuthHeader />
      <div className="max-w-2xl mx-auto">
        <h2>Create a New Post</h2>
        <NewPostForm />
      </div>
    </main>
  )
}
