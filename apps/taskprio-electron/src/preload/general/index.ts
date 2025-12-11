import { ipcRenderer } from "electron";
import { EEvents } from "src/lib/enums";

export const generalAPI = {
    onConsoleLog : ( callback : ( value : string ) => void ) => ipcRenderer.on( EEvents.CONSOLE_LOG, ( _, value : string ) => callback(value) )
}