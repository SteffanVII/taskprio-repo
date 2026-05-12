import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRegister } from "@/services/authentication"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import z from "zod"
import Spinner from "../Spinner"

type TRegisterFormProps = {
    setRegisterFormOpen : ( isRegister : boolean ) => void,
    dontNavigate? : boolean,
    invitationPurpose? : boolean
}

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

const RegisterForm : React.FC<TRegisterFormProps> = ({ setRegisterFormOpen, dontNavigate = false }) => {

    const navigate = useNavigate()

    const registerForm = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const {
        mutateAsync: register,
        data: registerData,
        isPending: isRegisterPending,
        isError: isRegisterError,
        error: registerError,
    } = useRegister( () => {
        if ( !dontNavigate ) {
            navigate("/p/w")
        }
    } )

    const inputsDisabled = useMemo(() => {
        return isRegisterPending
    }, [ isRegisterPending ])

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
                        onClick={() => {
                            registerForm.reset()
                            setRegisterFormOpen(false)
                        }}
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

    )

}

export default RegisterForm