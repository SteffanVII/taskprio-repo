import { ipcRenderer } from "electron";
import { EEventListeners } from "src/lib/enums.js";

export const authenticationAPI = {
    onGoogleLoginSuccess : ( callback : ( credential : string, clientId : string ) => void ) => ipcRenderer.on( EEventListeners.GOOGLE_LOGIN_SUCCESS, (_, credential, clientId) => callback(credential, clientId) )
}