import { BrowserWindow, IpcMain, ipcMain, IpcMainEvent, screen } from "electron"
import { EEvents } from "src/lib/enums"


export const taskTodoOverlayMain = () => {

    ipcMain.on( EEvents.MAKE_WINDOW_TO_TASK_TODO_OVERLAY_MODE, ( event : IpcMainEvent ) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if ( window ) {
            window.unmaximize()
            const { height } = screen.getPrimaryDisplay().workAreaSize;
            window.setSize(400, height - 20)
            window.setPosition(10, 10)
            window.setResizable(false)
        }
    } )

    ipcMain.on( EEvents.MAKE_WINDOW_TO_FULL_MODE, ( event : IpcMainEvent ) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if ( window ) {
            const { width, height } = screen.getPrimaryDisplay().workAreaSize;
            window.setResizable(true)
            window.setSize( width - 40, height - 40 )
            window.setPosition( 20, 20 )
        }
    } )

    ipcMain.on( EEvents.MAKE_WINDOW_TO_TASK_TODO_FOCUS_MODE, ( event : IpcMainEvent ) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if ( window ) {
            window.setResizable(true)
            window.setSize( 290, 110 )
            window.setResizable(false)
        }
    } )

}