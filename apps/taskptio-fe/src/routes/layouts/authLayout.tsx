import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthenticate } from "@/services/authentication";
import { updateGlobalsStore } from "@/stores/globals";

const AuthLayout = () => {

    const navigate = useNavigate()

    const {
        mutateAsync : authenticate
    } = useAuthenticate(
        () => {
            updateGlobalsStore({
                authenticated : true
            })
            // navigate("/p/w")
        },
        () => {
            updateGlobalsStore({
                authenticated : false
            })
            navigate("/login")
        }
    )

    useEffect( () => {
        authenticate()
    }, [] )

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
            <Outlet/>   
        </GoogleOAuthProvider>
    )

}

export default AuthLayout;