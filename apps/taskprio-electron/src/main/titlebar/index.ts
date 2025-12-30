import { BrowserWindow, ipcMain, shell } from "electron";
import { IpcMainEvent } from "electron/main";
import { mainWindow } from "../main.js";
import { EEventListeners, EEvents } from "src/lib/enums.js";

export const titlebarMain = () => {

    ipcMain.on( EEvents.MAXIMIZE_WINDOW, ( event : IpcMainEvent ) => {
        const webContents = event.sender;
        const window = BrowserWindow.fromWebContents(webContents)
        if ( !!window ) window.maximize()
    } )

    ipcMain.on( EEvents.UNMAXIMIZE_WINDOW, ( event : IpcMainEvent ) => {
        const webContents = event.sender;
        const window = BrowserWindow.fromWebContents(webContents)
        if ( !!window ) window.unmaximize()
    } )

    ipcMain.on( EEvents.MINIMIZE_WINDOW, ( event : IpcMainEvent ) => {
        const webContents = event.sender;
        const window = BrowserWindow.fromWebContents(webContents)
        if ( !!window ) window.minimize()
    } )

    ipcMain.on( EEvents.CLOSE_WINDOW, ( event : IpcMainEvent ) => {
        const webContents = event.sender;
        const window = BrowserWindow.fromWebContents(webContents)
        if ( !!window ) window.close()
    } )

    mainWindow.on( "maximize", () => {
        mainWindow.webContents.send( EEventListeners.WINDOW_MAXIMIZE_STATE_CHANGED, true )
    } )
    
    mainWindow.on( "unmaximize", () => {
        mainWindow.webContents.send( EEventListeners.WINDOW_MAXIMIZE_STATE_CHANGED, false )
    } )

    mainWindow.webContents.on( "will-navigate", ( event, url ) => {
        console.log(url);
        if ( url.includes( "google.com/oauth" ) || url.includes( "google.com/o/oauth" ) ) {
            event.preventDefault()
            shell.openExternal(url)
        }
    } )

}