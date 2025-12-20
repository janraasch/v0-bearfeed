"use client"

import { useTheme } from "next-themes"
import Snowfall from "react-snowfall"
import { useEffect, useState } from "react"

export function SnowfallEffect() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) return null

  // Only show snowfall in dark mode
  if (resolvedTheme !== "dark") return null

  return (
    <Snowfall
      snowflakeCount={150}
      speed={[0.5, 2]}
      wind={[-0.5, 1]}
    />
  )
}

