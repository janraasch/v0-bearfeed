import Header from "@/components/header"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <main>
      <Header />
      <div className="max-w-md mx-auto">
        <h2>Login</h2>
        <LoginForm />
      </div>
    </main>
  )
}
