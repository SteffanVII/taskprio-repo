import { ipcRenderer } from "electron";
import { EEvents } from "src/lib/enums";

export const authenticationAPI = {
    onGoogleLoginSuccess : ( callback : ( credential : string, clientId : string ) => void ) => ipcRenderer.on( EEvents.GOOGLE_LOGIN_SUCCESS, (_, credential, clientId) => callback(credential, clientId) )
}