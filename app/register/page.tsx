import Header from "@/components/header"
import RegisterForm from "@/components/register-form"

export default function RegisterPage() {
  return (
    <main>
      <Header />
      <div>
        <h2 className="text-xl font-medium mb-4">Register</h2>
        <RegisterForm />
      </div>
    </main>
  )
}
