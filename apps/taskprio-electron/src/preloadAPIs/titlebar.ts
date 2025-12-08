import { ipcRenderer } from "electron";

export const titlebarAPI = {
    maximizeWindow : () => ipcRenderer.send('maximize-window'),
    minimizeWindow : () => ipcRenderer.send('minimize-window'),
    unmaximizeWindow : () => ipcRenderer.send('unmaximize-window'),
    closeWindow : () => ipcRenderer.send('close-window'),
    onWindowMaximizeStateChange : ( callback : ( value : boolean ) => void ) => ipcRenderer.on( 'window-maximize-state-changed', (_, value) => callback(value) )
}