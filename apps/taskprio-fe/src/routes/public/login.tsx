import { useState } from "react"
import LoginForm from "@/components/others/shared/LoginForm"
import RegisterForm from "@/components/others/shared/RegisterForm"

const LoginRoute = () => {

    const [registerFormOpen, setRegisterFormOpen] = useState<boolean>(false)
    
    return (
        <div className="size-full flex items-center justify-center">
            <div className={`${registerFormOpen ? 'hidden' : 'block'}`}>
                <LoginForm
                    setRegisterFormOpen={setRegisterFormOpen}
                />
            </div>

            <div className={`${registerFormOpen ? 'block' : 'hidden'}`}>
                <RegisterForm
                    setRegisterFormOpen={setRegisterFormOpen}
                />
            </div>
        </div>
    )

}

export default LoginRoute;