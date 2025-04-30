"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { formatDistanceToNow } from "date-fns"
import type { User } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import ImageGallery from "./image-gallery"
import { formatTextWithLinks } from "@/lib/format-text"

type PostImage = {
  id: string
  storage_path: string
  file_name: string
  content_type: string
  display_order: number
  signedUrl?: string
}

type PostProps = {
  id: string
  content: string
  created_at: string
  users: {
    id: string
    username: string
    display_name: string | null
  }
  comments: Array<{
    id: string
    content: string
    created_at: string
    users: {
      id: string
      username: string
      display_name: string | null
    }
  }>
  likes: Array<{ count: number }>
  post_images?: PostImage[]
}

// Add a new type for the like information
type LikeInfo = {
  postId: string
  users: Array<{
    username: string
    display_name: string | null
  }>
}

// Update the component to include state for like info
export default function PostList({
  posts,
  currentUser,
}: {
  posts: PostProps[]
  currentUser: User | null
}) {
  const { supabase } = useSupabase()
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [selectedPostImages, setSelectedPostImages] = useState<PostImage[]>([])
  const [postsWithSignedUrls, setPostsWithSignedUrls] = useState<PostProps[]>([])
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})
  const [likeInfo, setLikeInfo] = useState<Record<string, LikeInfo["users"]>>({})
  const [showLikeTooltip, setShowLikeTooltip] = useState<string | null>(null)

  useEffect(() => {
    // Generate signed URLs for all images
    const generateSignedUrls = async () => {
      const postsWithUrls = await Promise.all(
        posts.map(async (post) => {
          if (!post.post_images || post.post_images.length === 0) {
            return post
          }

          const imagesWithUrls = await Promise.all(
            post.post_images.map(async (image) => {
              const { data } = await supabase.storage.from("post-images").createSignedUrl(image.storage_path, 3600) // 1 hour expiry

              return {
                ...image,
                signedUrl: data?.signedUrl,
              }
            }),
          )

          return {
            ...post,
            post_images: imagesWithUrls,
          }
        }),
      )

      setPostsWithSignedUrls(postsWithUrls)
    }

    generateSignedUrls()
  }, [posts, supabase])

  // Check which posts the current user has liked
  useEffect(() => {
    const checkUserLikes = async () => {
      if (!currentUser) return

      const likes: Record<string, boolean> = {}

      // Check each post to see if the user has liked it
      await Promise.all(
        posts.map(async (post) => {
          const { data } = await supabase
            .from("likes")
            .select("*")
            .eq("post_id", post.id)
            .eq("user_id", currentUser.id)
            .maybeSingle() // Changed from .single() to .maybeSingle()

          likes[post.id] = !!data
        }),
      )

      setUserLikes(likes)
    }

    checkUserLikes()
  }, [posts, currentUser, supabase])

  // Add a new useEffect to fetch the users who liked each post
  useEffect(() => {
    const fetchLikeInfo = async () => {
      const likeData: Record<string, LikeInfo["users"]> = {}

      await Promise.all(
        posts.map(async (post) => {
          const { data } = await supabase
            .from("likes")
            .select(`
            user_id,
            users (
              username,
              display_name
            )
          `)
            .eq("post_id", post.id)

          if (data && data.length > 0) {
            likeData[post.id] = data.map((like) => like.users)
          } else {
            likeData[post.id] = []
          }
        }),
      )

      setLikeInfo(likeData)
    }

    if (posts.length > 0) {
      fetchLikeInfo()
    }
  }, [posts, supabase])

  const handleLike = async (postId: string) => {
    if (!currentUser) return

    // Check if user already liked the post
    const hasLiked = userLikes[postId]

    if (hasLiked) {
      // Unlike
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentUser.id)
      // Update local state
      setUserLikes({ ...userLikes, [postId]: false })
    } else {
      // Like
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: currentUser.id,
      })
      // Update local state
      setUserLikes({ ...userLikes, [postId]: true })
    }

    window.location.reload()
  }

  const handleCommentSubmit = async (postId: string) => {
    if (!currentUser || !newComment[postId]) return

    await supabase.from("comments").insert({
      post_id: postId,
      user_id: currentUser.id,
      content: newComment[postId]
    })

    setNewComment({ ...newComment, [postId]: "" })
    window.location.reload()
  }

  // Helper function to get like count
  const getLikeCount = (post: PostProps): number => {
    // Check if likes is an array and has at least one element
    if (Array.isArray(post.likes) && post.likes.length > 0 && typeof post.likes[0].count === "number") {
      return post.likes[0].count
    }
    return 0
  }

  const openImageGallery = (post: PostProps, index: number) => {
    if (post.post_images && post.post_images.length > 0) {
      setSelectedPostImages(post.post_images)
      setSelectedImageIndex(index)
    }
  }

  const closeImageGallery = () => {
    setSelectedImageIndex(null)
  }

  // If we're still loading signed URLs, show a loading state
  if (posts.length > 0 && postsWithSignedUrls.length === 0) {
    return <div className="text-center py-4">Loading posts...</div>
  }

  return (
    <div>
      {postsWithSignedUrls.map((post) => (
        <article key={post.id} className="post">
          <div className="mb-2">
            <span className="font-medium">{post.users.display_name || post.users.username}</span>
            <span className="text-gray-500 text-sm ml-2">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          <div className="mb-4 whitespace-pre-wrap">{formatTextWithLinks(post.content)}</div>

          {post.post_images && post.post_images.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.post_images
                .sort((a, b) => a.display_order - b.display_order)
                .map((image, index) => (
                  <div
                    key={image.id}
                    className="cursor-pointer border border-gray-200 rounded overflow-hidden"
                    onClick={() => openImageGallery(post, index)}
                  >
                    <div className="relative w-24 h-24">
                      {image.signedUrl ? (
                        <Image
                          src={image.signedUrl || "/placeholder.svg"}
                          alt={image.file_name}
                          placeholder="blur"
                          fill
                          width="96"
                          height="96"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg=="
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="flex gap-4 text-sm mb-4">
            <div className="relative">
              <span
                className="text-gray-500"
                onMouseEnter={() => getLikeCount(post) > 0 && setShowLikeTooltip(post.id)}
                onMouseLeave={() => setShowLikeTooltip(null)}
              >
                {getLikeCount(post) === 1 ? "1 like" : `${getLikeCount(post)} likes`}
              </span>

              {showLikeTooltip === post.id && likeInfo[post.id] && likeInfo[post.id].length > 0 && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded p-2 shadow-sm z-10 w-48">
                  <p className="text-xs font-medium mb-1">Liked by:</p>
                  <ul className="text-xs">
                    {likeInfo[post.id].map((user, index) => (
                      <li key={index} className="truncate">
                        {user.display_name || user.username}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <span className="text-gray-500">
              {post.comments.length === 1 ? "1 comment" : `${post.comments.length} comments`}
            </span>
          </div>

          {post.comments.length > 0 && (
            <div className="mb-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div>
                    <span className="font-medium">{comment.users.display_name || comment.users.username}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div>{formatTextWithLinks(comment.content)}</div>
                </div>
              ))}
            </div>
          )}

          {currentUser && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment[post.id] || ""}
                onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                placeholder="Write a comment..."
                className="form-input"
              />
              <button onClick={() => handleCommentSubmit(post.id)} className="button" disabled={!newComment[post.id]}>
                Comment
              </button>
              <button onClick={() => handleLike(post.id)} className="button">
                {userLikes[post.id] ? "Unlike" : "Like"}
              </button>
            </div>
          )}
        </article>
      ))}

      {selectedImageIndex !== null && (
        <ImageGallery images={selectedPostImages} initialIndex={selectedImageIndex} onClose={closeImageGallery} />
      )}
    </div>
  )
}
