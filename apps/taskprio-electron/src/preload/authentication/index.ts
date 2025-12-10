import { ipcRenderer } from "electron";
import { EEvents } from "src/lib/enums";

export const authenticationAPI = {
    onGoogleLoginSuccess : ( callback : ( data : string ) => void ) => ipcRenderer.on( EEvents.GOOGLE_LOGIN_SUCCESS, (_, value) => callback(value) )
}