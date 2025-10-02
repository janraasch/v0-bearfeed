import type React from "react"

import Linkify from 'linkify-react';

export const formatTextWithLinks = (text: string) => <Linkify options={{
  render: {
    url: ({ attributes, content }) => {
      const linkProps = {
        ...attributes,
        target: "_blank",
        title: content, // Show full URL on hover
        rel: "noopener noreferrer",
        className: "text-blue-600 dark:text-[#8cc2dd] hover:underline break-all transition-colors"
      };
      // Truncate display URL if it's too long
      const displayUrl = content.length > 50 ? content.substring(0, 47) + "..." : content
      return <a {...linkProps}>{displayUrl}</a>;
    }
  }
}}>{text}</Linkify>
