import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function StatsPanel() {
  const supabase = createServerSupabaseClient()

  // Get counts from each table
  const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: postCount } = await supabase.from("posts").select("*", { count: "exact", head: true })

  const { count: commentCount } = await supabase.from("comments").select("*", { count: "exact", head: true })

  const { count: likeCount } = await supabase.from("likes").select("*", { count: "exact", head: true })

  // Get posts in the last 7 days
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count: recentPostCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneWeekAgo.toISOString())

  // Get most active user (most posts)
  const { data: mostActiveUsers } = await supabase
    .from("posts")
    .select("user_id, users(username, display_name), count")
    .group("user_id, users(username, display_name)")
    .order("count", { ascending: false })
    .limit(1)

  const mostActiveUser = mostActiveUsers && mostActiveUsers[0]

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium mb-4">Platform Statistics</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Users:</span>
            <span className="font-medium">{userCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Posts:</span>
            <span className="font-medium">{postCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Comments:</span>
            <span className="font-medium">{commentCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Likes:</span>
            <span className="font-medium">{likeCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium mb-4">Activity Insights</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Posts (Last 7 days):</span>
            <span className="font-medium">{recentPostCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Posts per User:</span>
            <span className="font-medium">{userCount ? (postCount / userCount).toFixed(1) : "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Comments per Post:</span>
            <span className="font-medium">{postCount ? (commentCount / postCount).toFixed(1) : "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Most Active User:</span>
            <span className="font-medium">
              {mostActiveUser ? mostActiveUser.users.display_name || mostActiveUser.users.username : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
