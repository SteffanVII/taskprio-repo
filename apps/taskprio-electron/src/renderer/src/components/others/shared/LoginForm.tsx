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
import { useGoogleLogin } from "@react-oauth/google"

type TLoginFormProps = {
    setRegisterFormOpen: (isRegister: boolean) => void,
    dontNavigate?: boolean,
    invitationPurpose?: boolean
}

const loginFormSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

const LoginForm: React.FC<TLoginFormProps> = ({
    setRegisterFormOpen,
    dontNavigate = false,
    invitationPurpose = false
}) => {

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
    } = useLogin(() => {
        if (!dontNavigate) {
            navigate("/p/w")
        }
    })

    const {
        isPending: isGoogleLoginPending
    } = useGoogleLoginT(() => {
        if (!dontNavigate) {
            navigate("/p/w")
        }
    })

    const googleLogin = useGoogleLogin({
        flow: "auth-code",
        redirect_uri: "https://taskprio-repo.onrender.com/redirect/google_login",
        ux_mode: "redirect"
    })

    const inputsDisabled = useMemo(() => {
        return isLoginPending || isGoogleLoginPending
    }, [isLoginPending, isGoogleLoginPending])

    const onSubmitLogin = async (data: z.infer<typeof loginFormSchema>) => {
        login({
            body: {
                ...data,
                for_invitation_purpose: invitationPurpose
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
                    {inputsDisabled ? <Spinner size="sm" /> : "Login"}
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

                <Button
                    variant={"outline"}
                    className={`justify-start`}
                    onClick={() => {
                        googleLogin()
                    }}
                >
                    <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    <p className="w-full" >Sign in with Google</p>
                </Button>
                {/* <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        if (!credentialResponse.clientId || !credentialResponse.credential) {
                            return
                        }
                        if (!isElectron) {
                            // const url = new URL(window.location.origin)
                            // url.protocol = "taskprio-app:"
                            // url.pathname = "googlelogin"
                            // url.searchParams.append("credential", credentialResponse.credential)
                            // url.searchParams.append("client_id", credentialResponse.clientId)
                            // console.log(url.toString());
                            // window.location.href = url.toString()
                            googleLoginT({
                                clientId: credentialResponse.clientId,
                                credential: credentialResponse.credential,
                                for_invitation_purpose: invitationPurpose
                            })
                        }
                    }}
                    auto_select={true}
                    ux_mode={isElectron ? "redirect" : "popup"}
                    login_uri={isElectron ? "https://taskprio-repo.onrender.com/redirect/google_login" : undefined}
                /> */}
            </form>
        </Form>
    )

}

export default LoginForm