import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useGoogleLoginT, useLogin } from "@/services/authentication"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { z } from "zod"
import Spinner from "../Spinner"
import { Separator } from "@/components/ui/separator"
import { GoogleLogin } from "@react-oauth/google"
import { useElectronStore_isElectron } from "@/stores/electron"

type TLoginFormProps = {
    setRegisterFormOpen : ( isRegister : boolean ) => void,
    dontNavigate? : boolean,
    invitationPurpose? : boolean
}

const loginFormSchema = z.object({
    email : z.string().email(),
    password : z.string(),
})

const LoginForm : React.FC<TLoginFormProps> = ({
    setRegisterFormOpen,
    dontNavigate = false,
    invitationPurpose = false
}) => {

    const isElectron = useElectronStore_isElectron()

    const navigate = useNavigate()

    const loginForm = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const {
        mutateAsync: login,
        data: loginData,
        isPending: isLoginPending,
        isError: isLoginError,
        error: loginError,
    } = useLogin( () => {
        if ( !dontNavigate ) {
            navigate("/p/w")
        }
    } )

    const {
        mutateAsync: googleLoginT,
        isPending : isGoogleLoginPending
    } = useGoogleLoginT( () => {
        if ( !dontNavigate ) {
            navigate("/p/w")
        }
    } )

    const inputsDisabled = useMemo(() => {
        return isLoginPending || isGoogleLoginPending
    }, [ isLoginPending, isGoogleLoginPending ])

    const onSubmitLogin = async (data: z.infer<typeof loginFormSchema>) => {
        login({
            body: {
                ...data,
                for_invitation_purpose : invitationPurpose
            },
        })
    }

    return (
        <Form {...loginForm}>
            <form
                onSubmit={loginForm.handleSubmit(onSubmitLogin)}
                className="w-[20rem] flex flex-col gap-4"
            >
                <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Email" disabled={inputsDisabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Password" type="password" disabled={inputsDisabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={inputsDisabled}
                >
                    { inputsDisabled ? <Spinner size="sm"/> : "Login"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                    Don't have an account?{" "}
                    <span 
                        className="text-primary font-medium hover:underline cursor-pointer transition-colors" 
                        onClick={() => {
                            loginForm.reset()
                            setRegisterFormOpen(true)
                        }}
                    >
                        Register
                    </span>
                </p>
                {
                    isLoginError && (
                        <p className="text-sm font-medium text-red-500 text-center animate-in fade-in-50">{loginError?.response?.data?.message}</p>
                    )
                }
                {
                    loginData && (
                        <p className="text-sm font-medium text-green-500 text-center animate-in fade-in-50">{loginData?.message}</p>
                    )
                }

                <Separator className="my-4" />

                <span className="text-xs text-center text-muted-foreground">Or</span>

                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        if ( !credentialResponse.clientId || !credentialResponse.credential ) {
                            return
                        }
                        if ( isElectron ) {
                            const url = new URL(window.location.origin)
                            url.protocol = "taskprio-app:"
                            url.pathname = "googlelogin"
                            url.searchParams.append("credential", credentialResponse.credential)
                            url.searchParams.append("client_id", credentialResponse.clientId)
                            console.log(url.toString());
                            window.location.href = url.toString()
                        } else {
                            googleLoginT({
                                clientId : credentialResponse.clientId,
                                credential : credentialResponse.credential,
                                for_invitation_purpose : invitationPurpose
                            })
                        }
                    }}
                    auto_select={true}
                    ux_mode={ isElectron ? "redirect" : "popup" }
                    login_uri={ isElectron ? "https://taskprio-repo.onrender.com/redirect-to-electron-app" : undefined }
                />
            </form>
        </Form>
    )

}

export default LoginForm