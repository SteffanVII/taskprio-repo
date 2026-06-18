import RegisterForm from "@/components/others/shared/RegisterForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage
})

function RegisterPage() {

  return (
    <div className="w-screen flex items-center justify-center">
      <RegisterForm/>
    </div>
  )

}