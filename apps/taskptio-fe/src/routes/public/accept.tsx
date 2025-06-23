import LoginForm from "@/components/others/shared/LoginForm"
import RegisterForm from "@/components/others/shared/RegisterForm"
import Spinner from "@/components/others/Spinner"
import { useAcceptInvitation } from "@/services/private/invitation/mutation"
import { useGlobalsStore } from "@/stores/globals"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"


const AcceptRoute = () => {

    const navigate = useNavigate()
    const [ searchParams ] = useSearchParams()

    const {
        authenticated
    } = useGlobalsStore()

    const {
        mutateAsync : acceptInvitation,
        isPending : isAcceptInvitationPending
    } = useAcceptInvitation()

    const [ registerFormOpen, setRegisterFormOpen ] = useState<boolean>(false)

    useEffect(() => {
        if ( !searchParams.get("invite_token") ) {
            navigate('/login')
        }
    }, [ searchParams ])

    useEffect( () => {
        if ( authenticated && searchParams.get("invite_token") ) {
            acceptInvitation( searchParams.get("invite_token") as string )
        }
    }, [ searchParams, authenticated ] )

    return (
        authenticated ? (
            isAcceptInvitationPending &&   
            <div className="size-full flex items-center justify-center">
                <Spinner size="xl" />
            </div>
        ) : (
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
    )

}

export default AcceptRoute