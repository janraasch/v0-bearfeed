import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import AdminHeader from "./components/admin-header"
import StatsPanel from "./components/stats-panel"
import PostsManager from "./components/posts-manager"
import ActivityLogs from "./components/activity-logs"

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()

  // Get session first
  const { data: sessionData } = await supabase.auth.getSession()

  // Only try to get the user if we have a session
  let user = null
  if (sessionData?.session) {
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user
  } else {
    redirect("/login")
  }

  // Check if user is an admin (you can customize this logic)
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  // For simplicity, let's consider the first registered user as admin
  // In a real app, you'd have a proper admin flag in your users table
  const { data: firstUser } = await supabase
    .from("users")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  const isAdmin = firstUser && firstUser.id === user.id

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <AdminHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatsPanel />
      </div>

      <div className="mb-8">
        <PostsManager />
      </div>

      <div>
        <ActivityLogs />
      </div>
    </main>
  )
}
