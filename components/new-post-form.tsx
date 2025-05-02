"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import ImageUpload from "./image-upload"
import { v4 as uuidv4 } from "uuid"

interface NewPostFormProps {
  onPostCreated?: (newPost: any) => void
}

export default function NewPostForm({ onPostCreated }: NewPostFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [resetImageKey, setResetImageKey] = useState(0) // Add a key to reset the image upload component
  const { supabase, user } = useSupabase()

  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !content.trim()) return

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // 1. Insert the post first to get the post ID
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          users (id, username, display_name)
        `)
        .single()

      if (postError) throw postError

      // Initialize the post with empty arrays for comments and likes
      const newPost = {
        ...post,
        comments: [],
        likes: [],
        post_images: [],
      }

      // 2. Upload images if any are selected
      if (selectedFiles.length > 0) {
        const postId = post.id
        const totalFiles = selectedFiles.length
        let uploadedCount = 0
        const uploadedImages = []

        // Create an array to hold all upload promises
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          const fileExt = file.name.split(".").pop()
          const fileName = `${uuidv4()}.${fileExt}`
          const filePath = `${user.id}/${postId}/${fileName}`

          // Upload the file to Supabase Storage
          const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, file)

          if (uploadError) throw uploadError

          // Get the public URL
          const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(filePath)

          // Insert the image record
          const { data: imageData, error: imageError } = await supabase
            .from("post_images")
            .insert({
              post_id: postId,
              storage_path: filePath,
              file_name: file.name,
              content_type: file.type,
              display_order: i,
            })
            .select()
            .single()

          if (imageError) throw imageError

          uploadedImages.push({
            ...imageData,
            signedUrl: publicUrlData.publicUrl,
          })

          // Update progress
          uploadedCount++
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
        }

        // Add the uploaded images to the new post
        newPost.post_images = uploadedImages
      }

      // Reset form
      setContent("")
      setSelectedFiles([])
      setUploadProgress(0)
      setResetImageKey((prev) => prev + 1) // Increment the reset key to trigger the image component reset

      // Notify parent component about the new post
      if (onPostCreated) {
        onPostCreated(newPost)
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="form-group">
        <label htmlFor="content" className="form-label">
          What's on your mind?
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="form-textarea"
          placeholder="Share something with your friends..."
          required
          disabled={isSubmitting}
        />
      </div>

      <ImageUpload onImagesSelected={handleImagesSelected} disabled={isSubmitting} resetKey={resetImageKey} />

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading images: {uploadProgress}%</p>
        </div>
      )}

      <button type="submit" className="button button-primary mt-4 w-32" disabled={isSubmitting || !content.trim()}>
        {isSubmitting ? "•••" : "Post"}
      </button>
    </form>
  )
}
