import Header from "@/components/header"
import RegisterForm from "@/components/register-form"

export default function RegisterPage() {
  return (
    <main>
      <Header />
      <div className="max-w-md mx-auto">
        <h2>Register</h2>
        <RegisterForm />
      </div>
    </main>
  )
}
