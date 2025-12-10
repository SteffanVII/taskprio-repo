import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthenticate } from "@/services/authentication";
import { updateGlobalsStore, useGlobalsStore_authenticated } from "@/stores/globals";

const AuthLayout = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const [ searchParams ] = useSearchParams()
    const authenticated = useGlobalsStore_authenticated()
    
    const onAuthenticateSuccess = () => {
        updateGlobalsStore({
            authenticated : true
        })
        if ( searchParams.get("invite_token") ) return
        if ( location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register" ) {
            navigate("/p/w")
        }
    }

    const onAuthenticateError = () => {
        updateGlobalsStore({
            authenticated : false
        })
        if ( location.pathname === "/accept" ) return
        navigate("/login")
    }

    const {
        mutateAsync : authenticate,
        isPending : authenticateIsPending,
    } = useAuthenticate(
        onAuthenticateSuccess,
        onAuthenticateError
    )

    useEffect( () => {
        if ( !authenticated ) authenticate()
    }, [ authenticated ] )

    useLayoutEffect(() => {
        updateGlobalsStore({
            authenticateIsPending,
        })
    }, [
        authenticateIsPending,
    ])

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
            <Outlet/>   
        </GoogleOAuthProvider>
    )

}

export default AuthLayout;