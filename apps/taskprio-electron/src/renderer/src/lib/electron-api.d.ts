import { TDisplay, TElectronStorePreferencesOverlayLocation, TElectronStorePreferencesType } from "@repo/taskprio-types"

declare global {
    interface Window {
        electronAPI: {

            // Titlebar
            closeWindow: () => void,
            maximizeWindow: () => void,
            unmaximizeWindow: () => void,
            minimizeWindow: () => void,

            // Titlebar listeners
            onWindowMaximizeStateChange: (callback: (value: boolean) => void) => void,

            // General
            requestDisplayList: () => Promise<TDisplay[]>,
            requestAppPreferences: () => Promise<TElectronStorePreferencesType>

            // General listeners
            onGoogleLoginSuccess: (callback: (credential: string, clientId: string) => void) => void,
            onAcceptInvitation: (callback: (inviteToken: string) => void) => void,
            onConsoleLog: (callback: (value: string) => void) => void,

            // Task todo
            makeWindowToTaskTodoOverlayMode: (fromFocusMode?: boolean) => void,
            makeWindowToFullMode: () => void,
            makeWindowToFocusMode: (fromOverlayMode?: boolean) => void,
            changeOverlayScreen: (screenId: number) => void,
            changeOverlayLocation: (location: TElectronStorePreferencesOverlayLocation) => void,

            // Websocket
            initializeWebsocket: () => Promise<void>,
            closeWebsocket: () => void,
            onWebsocketConnectionState: (callback: (value: EWebsocketConnectionState) => void) => void,
            onWebsocketMessage: (callback: (message: TWebSocketMessage) => void) => void,
            onPingServer: (callback : () => void) => void
            
        }
    }
}

export { }