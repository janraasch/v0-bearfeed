import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import AdminHeader from "../components/admin-header"
import UsersList from "./components/users-list"

export default async function UsersPage() {
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
  // For simplicity, let's consider the first registered user as admin
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

      <div className="mb-8">
        <UsersList />
      </div>
    </main>
  )
}
