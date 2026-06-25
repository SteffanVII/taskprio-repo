import { ipcRenderer } from "electron";
import { EEventListeners, EEvents } from "src/lib/enums.js";

export const generalAPI = {
    requestDisplayList: () => ipcRenderer.invoke(EEvents.REQUEST_DISPLAY_LIST),
    requestAppPreferences: () => ipcRenderer.invoke(EEvents.REQUEST_APP_PREFERENCES),
    openExternalBrowser: (url: string) => ipcRenderer.invoke(EEvents.OPEN_EXTERNAL_BROWSER, url),
    getPKCE: () => ipcRenderer.invoke(EEvents.GET_PKCE),

    // Listeners
    onConsoleLog: (callback: (value: string) => void) => ipcRenderer.on(EEventListeners.CONSOLE_LOG, (_, value: string) => callback(value)),
    onGoogleLoginSuccess: (callback: (code: string) => void) => ipcRenderer.on(EEventListeners.GOOGLE_LOGIN_SUCCESS, (_, code, verifier) => callback(code)),
    onAcceptInvitation: (callback: (inviteToken: string) => void) => ipcRenderer.on(EEventListeners.ACCEPT_INVITATION, (_, inviteToken) => callback(inviteToken))
}