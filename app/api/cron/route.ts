import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Check for secret token to prevent unauthorized access
    const { searchParams } = new URL(request.url)
    const secretToken = searchParams.get("token")
    const task = searchParams.get("task")

    // This should be a secure, randomly generated token stored as an environment variable
    if (secretToken !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (task === "storage-cleanup") {
      // Call the storage cleanup endpoint
      const cleanupResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/storage-cleanup?token=${process.env.CLEANUP_SECRET_TOKEN}`,
        { method: "GET" },
      )

      const cleanupResult = await cleanupResponse.json()

      return NextResponse.json({
        task,
        result: cleanupResult,
      })
    }

    return NextResponse.json({ error: "Invalid task" }, { status: 400 })
  } catch (error) {
    console.error("Error in cron task:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
