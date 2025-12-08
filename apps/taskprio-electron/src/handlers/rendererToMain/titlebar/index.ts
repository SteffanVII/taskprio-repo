import { BrowserWindow, IpcMain } from "electron";
import { IpcMainEvent } from "electron/main";

export const registerTitlebarEvents = ( ipcMain : IpcMain ) => {
    ipcMain.on( "maximize-window", handleWindowMaximize )
    ipcMain.on( "unmaximize-window", handleWindowUnmaximize )
    ipcMain.on( "minimize-window", handleWindowMinimize )
    ipcMain.on( "close-window", handleWindowClose )
}

export const handleWindowMaximize = ( event : IpcMainEvent ) => {
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents)
    if ( !!window ) {
        window.maximize()
        webContents.send( "window-maximize-state-changed", window.isMaximized() )
    }
}

export const handleWindowUnmaximize = ( event : IpcMainEvent ) => {
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents)
    if ( !!window ) {
        window.unmaximize()
        webContents.send( "window-maximize-state-changed", window.isMaximized() )
    }
}

export const handleWindowMinimize = ( event : IpcMainEvent ) => {
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents)
    if ( !!window ) window.minimize()
}

export const handleWindowClose = ( event : IpcMainEvent ) => {
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents)
    if ( !!window ) window.close()
}