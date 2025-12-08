import { BrowserWindow } from "electron";


export const registerMainWindowListeners = ( window : BrowserWindow ) => {

  window.on( "maximize", () => {
    window.webContents.send( "window-maximize-state-changed", true )
  } )
  
  window.on( "unmaximize", () => {
    window.webContents.send( "window-maximize-state-changed", false )
  } )

}