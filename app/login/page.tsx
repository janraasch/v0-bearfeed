import Header from "@/components/header"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <main>
      <Header />
      <div>
        <h2 className="text-xl font-medium mb-4">Login</h2>
        <LoginForm />
      </div>
    </main>
  )
}
