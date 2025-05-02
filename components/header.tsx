import Link from "next/link"

export default function Header() {
  return (
    <header className="header">
      <h1>ʕ •ᴥ• ʔ Bear Feed</h1>
      <nav className="header-nav">
        <Link href="/">Home</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
    </header>
  )
}
