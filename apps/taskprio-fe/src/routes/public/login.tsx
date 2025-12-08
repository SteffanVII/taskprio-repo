import { useState } from "react"
import LoginForm from "@/components/others/shared/LoginForm"
import RegisterForm from "@/components/others/shared/RegisterForm"
import ElectronCustomTitlebar from "@/components/others/shared/ElectronCustomTitlebar"
import { useElectronStore_isElectron } from "@/stores/electron"

const LoginRoute = () => {

    const isElectron = useElectronStore_isElectron()

    const [registerFormOpen, setRegisterFormOpen] = useState<boolean>(false)

    return (
        <div className="size-full flex items-center justify-center">
            {
                isElectron &&
                <ElectronCustomTitlebar/>
            }
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