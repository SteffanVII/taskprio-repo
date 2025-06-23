import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthenticate } from "@/services/authentication";
import { updateGlobalsStore } from "@/stores/globals";

const AuthLayout = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const [ searchParams ] = useSearchParams()


    const {
        mutateAsync : authenticate
    } = useAuthenticate(
        () => {
            updateGlobalsStore({
                authenticated : true
            })
            if ( searchParams.get("invite_token") ) return
            if ( location.pathname === "/login" || location.pathname === "/register" ) {
                // navigate("/p/w")
            }
        },
        () => {
            updateGlobalsStore({
                authenticated : false
            })
            if ( location.pathname === "/p/accept" ) return
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