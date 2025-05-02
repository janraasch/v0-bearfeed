export type PostImage = {
  id: string
  storage_path: string
  file_name: string
  content_type: string
  display_order: number
  signedUrl?: string
}

export type Like = {
  id: string
  user_id: string
  users: {
    id: string
    username: string
    display_name: string | null
  }
}

export type Comment = {
  id: string
  content: string
  created_at: string
  users: {
    id: string
    username: string
    display_name: string | null
  }
}

export type PostProps = {
  id: string
  content: string
  created_at: string
  updated_at: string
  users: {
    id: string
    username: string
    display_name: string | null
  }
  comments: Comment[]
  likes: Like[]
  post_images?: PostImage[]
}
