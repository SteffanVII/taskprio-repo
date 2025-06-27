import LoginForm from "@/components/others/shared/LoginForm"
import RegisterForm from "@/components/others/shared/RegisterForm"
import Spinner from "@/components/others/Spinner"
import { Button } from "@/components/ui/button"
import { useAcceptInvitation } from "@/services/private/invitation/mutation"
import { useGlobalsStore } from "@/stores/globals"
import { AxiosError } from "axios"
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
        isPending : isAcceptInvitationPending,
        isSuccess : isAcceptInvitationSuccess,
        error : acceptInvitationError
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

    if ( acceptInvitationError ) {
        if (
            acceptInvitationError instanceof AxiosError &&
            acceptInvitationError.response?.status === 400 &&
            acceptInvitationError.response?.data.message === "Invitation already accepted"
        ) {
            return (
                <div className="size-full flex items-center justify-center">
                    <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg shadow-lg max-w-md">
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-blue-800 mb-2">Invitation Already Accepted</h2>
                        <p className="text-blue-600 mb-4">
                            This invitation has already been accepted. You can access the workspace from your dashboard.
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            )
        }
    }

    if ( isAcceptInvitationSuccess ) {
        return (
            <div className="size-full flex items-center justify-center">
                <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg shadow-lg max-w-md">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Invitation Accepted!</h2>
                    <p className="text-green-600 mb-4">
                        You have successfully joined the workspace. You will be redirected to your dashboard shortly.
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    if ( !authenticated ) {
        return (
            <div className="size-full flex items-center justify-center">
                <div className={`${registerFormOpen ? 'hidden' : 'block'}`}>
                    <LoginForm
                        dontNavigate={true}
                        setRegisterFormOpen={setRegisterFormOpen}
                    />
                </div>
                <div className={`${registerFormOpen ? 'block' : 'hidden'}`}>
                    <RegisterForm
                        dontNavigate={true}
                        setRegisterFormOpen={setRegisterFormOpen}
                    />
                </div>
            </div>
        )
    }

    return (
        isAcceptInvitationPending &&   
        <div className="size-full flex items-center justify-center">
            <Spinner size="xl" />
        </div>
    )

}

export default AcceptRoute