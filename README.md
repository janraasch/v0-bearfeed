# ʕ •ᴥ• ʔ Bear Feed

A minimalist social feed app inspired by the clean aesthetic of [Bear Blog][bear-blog-url].

## Raison d'être

Bear Feed is currently in a "friends & family alpha" phase, being used by a small group of friends. The project embraces a philosophy of intentional social connection:

- **Local & Small**: Designed for close-knit communities rather than mass adoption
- **Distraction-Free**: No notifications, no real-time updates, and posts that automatically expire after 15 days to keep the feed fresh and intentional
- **Accessible**: Built with [Next.js][nextjs-url], [TailwindCSS][tailwind-url], [Supabase][supabase-url], and [v0.dev][v0-url] to make it easy for anyone to build & deploy their own social feed with minimal technical knowledge

The goal is to empower people to create and run their own spaces for meaningful connections.

## Features

- Content-first approach with focus on readability
- Extremely minimal interface with generous whitespace
- Standard typography with black text on white background and blue links
- Simple semantic HTML wherever possible
- Limited UI components - only what's necessary
- Responsive design for mobile and desktop

## Core Functionality

- Timeline showing posts from friends in chronological order
- Simple post creation with basic text formatting, images & link support
- Comments displayed directly under posts
- Subtle like functionality
- Minimal navigation with simple text links
- Basic user authentication

## Technical Stack

- [Next.js][nextjs-url] framework
- [Supabase][supabase-url] for authentication and database
- [TailwindCSS][tailwind-url] for styling

## Post Retention

Posts are automatically removed after 15 days to keep the feed fresh.

## Special Thanks 🎁

* A special thank you goes out to [Herman][herman-url] for creating the original [ʕ•ᴥ•ʔ Bear Blog][bear-blog-url].
* The teddy bear icon (ʕ •ᴥ• ʔ) is from [Microsoft's Fluent Emoji][fluent-emoji-url] collection - licensed under [MIT][fluent-emoji-mit-url].

## License

[Bear Feed][repo-url] by [Jan Raasch][author-url] is licensed under [CC BY-NC 4.0][license-url].

[![CC][license-cc-svg] ![BY][license-by-svg] ![NC][license-nc-svg]][license-url]

[license-url]: https://creativecommons.org/licenses/by-nc/4.0
[license-cc-svg]: https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1
[license-by-svg]: https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1
[license-nc-svg]: https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1
[bear-blog-url]: https://bearblog.dev
[nextjs-url]: https://nextjs.org
[supabase-url]: https://supabase.com
[tailwind-url]: https://tailwindcss.com
[herman-url]: https://herman.bearblog.dev
[fluent-emoji-url]: https://github.com/microsoft/fluentui-emoji/tree/main
[fluent-emoji-mit-url]: https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE
[repo-url]: https://github.com/janraasch/v0-bearfeed
[author-url]: https://www.janraasch.com
[v0-url]: https://v0.dev
