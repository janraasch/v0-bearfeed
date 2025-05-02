"use client"

import { useState } from "react"
import PostList from "@/components/post-list"
import NewPostForm from "@/components/new-post-form"
import RetentionNotice from "@/components/retention-notice"
import type { User } from "@supabase/auth-helpers-nextjs"
import type { PostProps } from "@/types/post"

interface HomeClientProps {
  initialPosts: PostProps[]
  currentUser: User
}

export default function HomeClient({ initialPosts, currentUser }: HomeClientProps) {
  const [posts, setPosts] = useState<PostProps[]>(initialPosts)

  const handlePostCreated = (newPost: PostProps) => {
    // Add the new post to the beginning of the posts array
    setPosts([newPost, ...posts])
  }

  return (
    <>
      <div className="mb-8">
        <NewPostForm onPostCreated={handlePostCreated} />
      </div>

      {posts.length > 0 ? (
        <PostList posts={posts} currentUser={currentUser} />
      ) : (
        <div className="text-center py-8">
          <p>No posts yet.</p>
          <p>Be the first to post something!</p>
        </div>
      )}

      <RetentionNotice />
    </>
  )
}
