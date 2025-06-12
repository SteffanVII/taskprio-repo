import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useGoogleLoginT, useLogin, useRegister } from "@/services/authentication"
import { Button } from "@/components/ui/button"
import Spinner from "@/components/others/Spinner"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Separator } from "@/components/ui/separator"
import { GoogleLogin } from "@react-oauth/google"

const loginFormSchema = z.object({
    email : z.string().email(),
    password : z.string(),
})

const registerFormSchema = z.object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})


const LoginRoute = () => {
    
    const navigate = useNavigate()

    const loginForm = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const registerForm = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const [registerFormOpen, setRegisterFormOpen] = useState<boolean>(false)

    const {
        mutateAsync: login,
        // data: loginData,
        isPending: isLoginPending,
        // isError: isLoginError,
        // error: loginError,
    } = useLogin( () => {
        navigate("/p/w")
    } )

    const {
        mutateAsync: googleLoginT,
        isPending : isGoogleLoginPending
    } = useGoogleLoginT( () => {
        navigate("/p/w")
    } )

    const {
        mutateAsync: register,
        data: registerData,
        isPending: isRegisterPending,
        isError: isRegisterError,
        error: registerError,
    } = useRegister( () => {
        navigate("/p/w")
    } )

    const inputsDisabled = useMemo(() => {
        return isLoginPending || isRegisterPending || isGoogleLoginPending
    }, [ isLoginPending, isRegisterPending, isGoogleLoginPending ])

    const handleFormSwitch = (isRegister: boolean) => {
        if (isRegister) {
            loginForm.reset()
        } else {
            registerForm.reset()
        }
        setRegisterFormOpen(isRegister)
    }

    const onSubmitLogin = async (data: z.infer<typeof loginFormSchema>) => {
        login({
            body: data,
        })
    }

    const onSubmitRegister = async (data: z.infer<typeof registerFormSchema>) => {
        register({
            body: {
                email: data.email,
                password: data.password,
                firstname: data.firstname,
                lastname: data.lastname,
            },
        })
    }
    
    return (
        <div className="size-full flex items-center justify-center">
            <div className={`${registerFormOpen ? 'hidden' : 'block'}`}>
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
                                onClick={() => handleFormSwitch(true)}
                            >
                                Register
                            </span>
                        </p>
                        {/* {
                            isLoginError && (
                                <p className="text-sm font-medium text-red-500 text-center animate-in fade-in-50">{loginError?.response?.data?.message}</p>
                            )
                        }
                        {
                            loginData && (
                                <p className="text-sm font-medium text-green-500 text-center animate-in fade-in-50">{loginData?.message}</p>
                            )
                        } */}

                        <Separator className="my-4" />

                        <span className="text-xs text-center text-muted-foreground">Or</span>

                        {/* <Button
                            variant={"outline"}
                            type="button"
                            className=" w-fit h-fit !p-0 rounded-full mx-auto cursor-pointer "
                            onClick={() => googleLogin()}
                        >
                            <img src="/web_neutral_rd_SI.svg" alt="Google" className="w-[12rem]" />
                        </Button> */}
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                if ( !credentialResponse.clientId || !credentialResponse.credential ) {
                                    return
                                }
                                googleLoginT({
                                    clientId : credentialResponse.clientId,
                                    credential : credentialResponse.credential
                                })
                            }}
                            auto_select={true}
                        />
                    </form>
                </Form>
            </div>

            <div className={`${registerFormOpen ? 'block' : 'hidden'}`}>
                <Form {...registerForm}>
                    <form
                        onSubmit={registerForm.handleSubmit(onSubmitRegister)}
                        className="w-[20rem] flex flex-col gap-4"
                    >
                        <FormField
                            control={registerForm.control}
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
                            control={registerForm.control}
                            name="firstname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="First Name" disabled={inputsDisabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={registerForm.control}
                            name="lastname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Last Name" disabled={inputsDisabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={registerForm.control}
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
                        <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Confirm Password" type="password" disabled={inputsDisabled} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={inputsDisabled}
                        >
                            { inputsDisabled ? <Spinner size="sm"/> : "Create Account"}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <span 
                                className="text-primary font-medium hover:underline cursor-pointer transition-colors" 
                                onClick={() => handleFormSwitch(false)}
                            >
                                Login
                            </span>
                        </p>
                        {
                            isRegisterError && (
                                <p className="text-sm font-medium text-red-500 text-center animate-in fade-in-50">{registerError?.response?.data?.message}</p>
                            )
                        }
                        {
                            registerData && (
                                <p className="text-sm font-medium text-green-500 text-center animate-in fade-in-50">{registerData?.message}</p>
                            )
                        }
                    </form>
                </Form>
            </div>
        </div>
    )

}

export default LoginRoute;