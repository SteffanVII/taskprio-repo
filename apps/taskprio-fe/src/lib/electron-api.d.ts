import { TDisplay, TElectronStorePreferencesOverlayLocation, TElectronStorePreferencesType } from "@repo/taskprio-types/src"

declare global {
    interface Window {
        electronAPI : {

            // Titlebar
            closeWindow : () => void,
            maximizeWindow : () => void,
            unmaximizeWindow : () => void,
            minimizeWindow : () => void,

            // Titlebar listeners
            onWindowMaximizeStateChange : ( callback : ( value : boolean ) => void ) => void,

            // General
            requestDisplayList : () => Promise<TDisplay[]>,
            requestAppPreferences : () => Promise<TElectronStorePreferencesType>

            // General listeners
            onGoogleLoginSuccess : ( callback : ( credential : string, clientId : string ) => void ) => void,
            onConsoleLog : ( callback : ( value : string ) => void ) => void,

            // Task todo
            makeWindowToTaskTodoOverlayMode : ( fromFocusMode? : boolean ) => void,
            makeWindowToFullMode : () => void,
            makeWindowToFocusMode : ( fromOverlayMode? : boolean ) => void,
            changeOverlayScreen : ( screenId : number ) => void,
            changeOverlayLocation : ( location : TElectronStorePreferencesOverlayLocation ) => void
        }
    }
}

export {}