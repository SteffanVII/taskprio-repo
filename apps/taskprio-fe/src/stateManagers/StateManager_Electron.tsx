import { updateElectronStore } from "@/stores/electron";
import React, { useLayoutEffect } from "react";

type TStateManager_ElectronProps = {
    children : React.ReactNode
}

const StateManager_Electron : React.FC<TStateManager_ElectronProps> = ({ children }) => {

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
        }
    }, [])

    return children;

}

export default StateManager_Electron;