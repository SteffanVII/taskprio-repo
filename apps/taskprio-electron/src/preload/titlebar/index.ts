import { ipcRenderer } from "electron";
import { EEventListeners, EEvents } from "src/lib/enums.js";

export const titlebarAPI = {
    maximizeWindow : () => ipcRenderer.send( EEvents.MAXIMIZE_WINDOW ),
    minimizeWindow : () => ipcRenderer.send( EEvents.MINIMIZE_WINDOW ),
    unmaximizeWindow : () => ipcRenderer.send( EEvents.UNMAXIMIZE_WINDOW ),
    closeWindow : () => ipcRenderer.send( EEvents.CLOSE_WINDOW ),

    // Listeners
    onWindowMaximizeStateChange : ( callback : ( value : boolean ) => void ) => ipcRenderer.on( EEventListeners.WINDOW_MAXIMIZE_STATE_CHANGED, (_, value) => callback(value) )
}