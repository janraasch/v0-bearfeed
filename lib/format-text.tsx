import type React from "react"

// Improved regex that properly captures domain names but excludes trailing punctuation
const URL_REGEX =
  /(https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z0-9][-a-zA-Z0-9%_.~/#?&=:]*[a-zA-Z0-9/])|(www\.[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z0-9][-a-zA-Z0-9%_.~/#?&=:]*[a-zA-Z0-9/])/g

export function formatTextWithLinks(text: string): React.ReactNode[] {
  if (!text) return [text]

  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match

  // Use exec to iterate through all matches with their positions
  while ((match = URL_REGEX.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index))
    }

    // Get the matched URL
    const url = match[0]
    const href = url.startsWith("www.") ? `https://${url}` : url

    // Truncate display URL if it's too long
    const displayUrl = url.length > 50 ? url.substring(0, 47) + "..." : url

    // Add the link with proper styling for overflow
    result.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
        title={url} // Show full URL on hover
      >
        {displayUrl}
      </a>,
    )

    // Update the last index
    lastIndex = match.index + url.length
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }

  return result
}
