import { useGoogleLoginT } from "@/services/authentication";
import { updateElectronStore } from "@/stores/electron";
import React, { useLayoutEffect } from "react";
import { useNavigate } from "react-router";

type TStateManager_ElectronProps = {
    children : React.ReactNode
}

const StateManager_Electron : React.FC<TStateManager_ElectronProps> = ({ children }) => {

    const navigate = useNavigate()

    const {
        mutateAsync: googleLoginT,
    } = useGoogleLoginT( () => {
        navigate("/p/w")
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
            window.electronAPI.onGoogleLoginSuccess( ( credential, clientId ) => {
                googleLoginT({
                    clientId : clientId,
                    credential : credential
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