import Link from "next/link"

export default function AdminHeader() {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold mb-2">ʕ •ᴥ• ʔ Bear Feed Admin</h1>
      <div className="flex gap-4 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Feed
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/admin" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/admin/users" className="text-blue-600 hover:underline">
          Users
        </Link>
      </div>
    </header>
  )
}
