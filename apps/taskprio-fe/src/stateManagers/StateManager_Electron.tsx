import { useGoogleLoginT } from "@/services/authentication";
import { updateElectronStore } from "@/stores/electron";
import React, { useLayoutEffect } from "react";

type TStateManager_ElectronProps = {
    children : React.ReactNode
}

const StateManager_Electron : React.FC<TStateManager_ElectronProps> = ({ children }) => {

    const {
        mutateAsync: googleLoginT,
    } = useGoogleLoginT( () => {
        console.log("Authenticated")
    } )

    useLayoutEffect(() => {
        if ( !!window.electronAPI ) {
            updateElectronStore({
                isElectron : !!window.electronAPI
            })
            window.electronAPI.onWindowMaximizeStateChange( ( value ) => {
                updateElectronStore({
                    windowMaximize : value
                })                
            } )
            window.electronAPI.onGoogleLoginSuccess( ( value ) => {
                console.log(value)
                googleLoginT({
                    clientId : process.env.VITE_GOOGLE_AUTH_CLIENT_ID!,
                    credential : value
                })
            } )
            window.electronAPI.onConsoleLog( ( value ) => {
                console.log( value )
            } )
        }
    }, [])

    return children;

}

export default StateManager_Electron;