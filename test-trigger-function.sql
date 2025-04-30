-- Step 1: Get a post to comment on
WITH selected_post AS (
  SELECT id, content, created_at, updated_at
  FROM posts
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT id, LEFT(content, 30) AS content_preview, created_at, updated_at
FROM selected_post;

-- Step 2: Add a test comment to the post
INSERT INTO comments (id, post_id, user_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(), -- Generate a new UUID for the comment
  id, -- Use the post ID from the selected post
  (SELECT id FROM users ORDER BY created_at ASC LIMIT 1), -- Get a user ID
  'This is a test comment to verify the trigger function is working.',
  NOW(),
  NOW()
FROM (
  SELECT id FROM posts ORDER BY created_at DESC LIMIT 1
) AS selected_post
RETURNING id;

-- Step 3: Wait a moment to ensure the trigger has time to execute
SELECT pg_sleep(0.5);

-- Step 4: Check if the post's updated_at field was updated
WITH selected_post AS (
  SELECT id, content, created_at, updated_at
  FROM posts
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT 
  id, 
  LEFT(content, 30) AS content_preview, 
  created_at, 
  updated_at,
  updated_at > created_at AS was_updated,
  NOW() - updated_at AS time_since_update
FROM selected_post;
