import { ipcRenderer } from "electron";
import { EEventListeners, EEvents } from "src/lib/enums.js";

export const generalAPI = {
    requestDisplayList : () => ipcRenderer.invoke( EEvents.REQUEST_DISPLAY_LIST ),
    requestAppPreferences : () => ipcRenderer.invoke( EEvents.REQUEST_APP_PREFERENCES ),

    // Listeners
    onConsoleLog : ( callback : ( value : string ) => void ) => ipcRenderer.on( EEventListeners.CONSOLE_LOG, ( _, value : string ) => callback(value) )
}