import LoginForm from "@/components/others/shared/LoginForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {

  return (
    <div className="w-screen flex items-center justify-center">
      <LoginForm/>
    </div>
  )

}