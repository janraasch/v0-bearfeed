import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Check for secret token to prevent unauthorized access
    const { searchParams } = new URL(request.url)
    const secretToken = searchParams.get("token")

    // This should be a secure, randomly generated token stored as an environment variable
    // For demo purposes, we're using a simple check
    if (secretToken !== process.env.CLEANUP_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get unprocessed files (limit to 100 at a time to avoid timeouts)
    const { data: filesToDelete, error: fetchError } = await supabase
      .from("storage_cleanup")
      .select("id, storage_path")
      .eq("processed", false)
      .limit(100)

    if (fetchError) {
      console.error("Error fetching files to delete:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!filesToDelete || filesToDelete.length === 0) {
      return NextResponse.json({ message: "No files to delete" })
    }

    // Process each file
    const results = await Promise.all(
      filesToDelete.map(async (file) => {
        try {
          // Extract bucket name and file path from storage_path
          // Assuming format is: [bucket-name]/[file-path]
          const pathParts = file.storage_path.split("/")
          const bucketName = "post-images" // This should match your actual bucket name
          const filePath = file.storage_path

          // Delete the file from storage
          const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath])

          if (deleteError) {
            console.error(`Error deleting file ${file.storage_path}:`, deleteError)
            return { id: file.id, success: false, error: deleteError.message }
          }

          // Mark as processed
          const { error: updateError } = await supabase
            .from("storage_cleanup")
            .update({ processed: true })
            .eq("id", file.id)

          if (updateError) {
            console.error(`Error updating file status ${file.id}:`, updateError)
            return { id: file.id, success: false, error: updateError.message }
          }

          return { id: file.id, success: true }
        } catch (error) {
          console.error(`Error processing file ${file.id}:`, error)
          return { id: file.id, success: false, error: String(error) }
        }
      }),
    )

    // Log the cleanup operation
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    await supabase.from("cron_logs").insert({
      operation: "storage_cleanup",
      details: `Processed ${results.length} files: ${successCount} deleted successfully, ${failureCount} failed`,
    })

    return NextResponse.json({
      message: `Processed ${results.length} files`,
      results,
    })
  } catch (error) {
    console.error("Unexpected error in storage cleanup:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
