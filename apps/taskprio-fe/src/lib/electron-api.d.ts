declare global {
    interface Window {
        electronAPI : {
            closeWindow : () => void,
            maximizeWindow : () => void,
            unmaximizeWindow : () => void,
            minimizeWindow : () => void,
            onWindowMaximizeStateChange : ( callback : ( value : boolean ) => void ) => void,
            onGoogleLoginSuccess : ( callback : ( value : string ) => void ) => void,
            onConsoleLog : ( callback : ( value : string ) => void ) => void
        }
    }
}

export {}