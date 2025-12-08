import { IpcMain } from "electron/main";
import { registerTitlebarEvents } from "./rendererToMain/titlebar";

export const registerEventHandlers = ( ipcMain : IpcMain ) => {

    registerTitlebarEvents( ipcMain )
    
}