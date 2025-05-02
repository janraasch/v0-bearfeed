"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { formatDistanceToNow } from "date-fns"
import type { User } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import ImageGallery from "./image-gallery"
import { formatTextWithLinks } from "@/lib/format-text"
import type { PostProps, PostImage } from "@/types/post"

export default function PostList({
  posts,
  currentUser,
}: {
  posts: PostProps[]
  currentUser: User
}) {
  const { supabase } = useSupabase()
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({})
  const [isProcessingLike, setIsProcessingLike] = useState<Record<string, boolean>>({})
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [selectedPostImages, setSelectedPostImages] = useState<PostImage[]>([])
  const [postsWithSignedUrls, setPostsWithSignedUrls] = useState<PostProps[]>([])
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})
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
    // Process likes data from the posts to determine which ones the current user has liked
    const likes: Record<string, boolean> = {}

    posts.forEach((post) => {
      // Check if any of the likes belong to the current user
      const userLiked = post.likes.some((like) => like.user_id === currentUser.id)
      likes[post.id] = userLiked
    })

    setUserLikes(likes)
  }, [posts, currentUser])

  const handleLike = async (postId: string) => {
    // Set processing state for this post
    setIsProcessingLike({ ...isProcessingLike, [postId]: true })

    try {
      // Check if user already liked the post
      const hasLiked = userLikes[postId]

      if (hasLiked) {
        // Unlike - delete the like
        await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentUser.id)

        // Update the posts state by removing the user's like
        setPostsWithSignedUrls((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.likes.filter((like) => like.user_id !== currentUser.id),
              }
            }
            return post
          }),
        )

        // Update local likes state
        setUserLikes({ ...userLikes, [postId]: false })
      } else {
        // Like - insert a new like
        const { data: newLike, error } = await supabase
          .from("likes")
          .insert({
            post_id: postId,
            user_id: currentUser.id,
          })
          .select(`
            id,
            user_id,
            users (id, username, display_name)
          `)
          .single()

        if (error) throw error

        // Update the posts state by adding the new like
        setPostsWithSignedUrls((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: [...post.likes, newLike],
              }
            }
            return post
          }),
        )

        // Update local likes state
        setUserLikes({ ...userLikes, [postId]: true })
      }
    } catch (error) {
      console.error("Error processing like:", error)
      alert("Failed to process like. Please try again.")
    } finally {
      // Clear the processing state
      setIsProcessingLike({ ...isProcessingLike, [postId]: false })
    }
  }

  const handleCommentSubmit = async (postId: string) => {
    if (!newComment[postId]) return

    // Set the submitting state for this specific post
    setIsSubmittingComment({ ...isSubmittingComment, [postId]: true })

    try {
      // Insert the comment
      const { data: newCommentData, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: newComment[postId],
        })
        .select(`
          id,
          content,
          created_at,
          users (id, username, display_name)
        `)
        .single()

      if (error) throw error

      // Clear the comment input
      setNewComment({ ...newComment, [postId]: "" })

      // Update the posts state with the new comment
      setPostsWithSignedUrls((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, newCommentData],
            }
          }
          return post
        }),
      )
    } catch (error) {
      console.error("Error submitting comment:", error)
      alert("Failed to submit comment. Please try again.")
    } finally {
      // Clear the submitting state
      setIsSubmittingComment({ ...isSubmittingComment, [postId]: false })
    }
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
        <article
          key={post.id}
          className={`post ${post.content.includes("Nur Bear Feed") ? "border-b-2 border-rose-200" : ""}`}
        >
          <div className="mb-2 flex items-center flex-wrap gap-x-2">
            <span className="font-medium">{post.users.display_name || post.users.username}</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
            {post.content.includes("Nur Bear Feed") && (
              <span className="bg-rose-100 text-rose-700 text-xs font-medium px-2 py-0.5 rounded-full ml-1">
                ʕ •ᴥ~ʔ ♥ Honey of a Post
              </span>
            )}
          </div>

          <div className="mb-4 whitespace-pre-wrap break-words">{formatTextWithLinks(post.content)}</div>

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
                onMouseEnter={() => post.likes.length > 0 && setShowLikeTooltip(post.id)}
                onMouseLeave={() => setShowLikeTooltip(null)}
              >
                {post.likes.length === 1 ? "1 like" : `${post.likes.length} likes`}
              </span>

              {showLikeTooltip === post.id && post.likes.length > 0 && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded p-2 shadow-sm z-10 w-48">
                  <p className="text-xs font-medium mb-1">Liked by:</p>
                  <ul className="text-xs">
                    {post.likes.map((like) => (
                      <li key={like.id} className="truncate">
                        {like.users.display_name || like.users.username}
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
                  <div className="break-words">{formatTextWithLinks(comment.content)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment[post.id] || ""}
              onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
              placeholder="Write a comment..."
              className="form-input"
              disabled={isSubmittingComment[post.id]}
            />
            <button
              onClick={() => handleCommentSubmit(post.id)}
              className="button w-24"
              disabled={!newComment[post.id] || isSubmittingComment[post.id]}
            >
              {isSubmittingComment[post.id] ? "•••" : "Comment"}
            </button>
            <button onClick={() => handleLike(post.id)} className="button w-24" disabled={isProcessingLike[post.id]}>
              {isProcessingLike[post.id] ? "•••" : userLikes[post.id] ? "Unlike" : "Like"}
            </button>
          </div>
        </article>
      ))}

      {selectedImageIndex !== null && (
        <ImageGallery images={selectedPostImages} initialIndex={selectedImageIndex} onClose={closeImageGallery} />
      )}
    </div>
  )
}
