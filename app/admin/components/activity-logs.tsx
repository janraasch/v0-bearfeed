"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

type CronLog = {
  id: number
  operation: string
  details: string
  created_at: string
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<CronLog[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      // Check if the cron_logs table exists
      const { data: tableExists } = await supabase.from("cron_logs").select("id").limit(1).single()

      if (tableExists) {
        const { data, error } = await supabase
          .from("cron_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) throw error
        setLogs(data || [])
      } else {
        // Table doesn't exist or is empty
        setLogs([])
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-medium mb-4">System Activity Logs</h2>

      {loading ? (
        <div className="text-center py-4">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No activity logs found. Logs will appear here after scheduled tasks run.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="border-b pb-3">
              <div className="flex justify-between">
                <span className="font-medium">{log.operation}</span>
                <span className="text-sm text-gray-500">{formatDate(log.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{log.details}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
