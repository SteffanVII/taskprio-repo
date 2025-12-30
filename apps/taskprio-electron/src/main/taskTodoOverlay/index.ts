import { TElectronStorePreferencesOverlayLocation } from "@repo/taskprio-types"
import { BrowserWindow, IpcMain, ipcMain, IpcMainEvent, screen } from "electron"
import { EEvents } from "src/lib/enums.js"
import { store } from "src/lib/store.js"


export const taskTodoOverlayMain = () => {

    ipcMain.on( EEvents.MAKE_WINDOW_TO_TASK_TODO_OVERLAY_MODE, ( event : IpcMainEvent, fromFocusMode? : boolean ) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if ( window ) {

            if ( !fromFocusMode ) {
                const { width : boundWidth, height : boundHeight, x, y } = window.getBounds()
                const currentWindowScreen = screen.getDisplayMatching(window.getBounds())
                store.set( "lastFullModeWindowState", {
                    width : boundWidth,
                    height : boundHeight,
                    x,
                    y,
                    screenId : currentWindowScreen.id
                } )
            } else {
                const { x, y } = window.getBounds()
                const currentWindowScreen = screen.getDisplayMatching(window.getBounds())
                store.set( "lastFocusModeWindowState", {
                    x,
                    y,
                    screenId : currentWindowScreen.id
                } )
            }

            const lastScreenId = store.get( "preferences.overlay.screen.id" )
            const displays = screen.getAllDisplays()
            const display = lastScreenId ? displays.find( display => display.id === lastScreenId ) ?? displays[0] : displays[0]
            const boundX = display.bounds.x
            const boundY = display.bounds.y

            // Limit the height to 1080 when display resolution > 1080
            const height = display.workArea.height > 1080 ? 1080 : display.workAreaSize.height
            const location : TElectronStorePreferencesOverlayLocation = store.get("preferences.overlay.location") ?? "top-left"

            window.unmaximize()
            window.setSize(400, height - 20)

            switch (location) {
                case "top-left":
                    window.setPosition( boundX, boundY )
                    break;
                case "top-right":
                    window.setPosition( boundX + display.workAreaSize.width - 400, boundY )
                    break;
                case "bottom-left":
                    window.setPosition( boundX, boundY + display.workAreaSize.height - window.getSize()[1] )
                    break;
                case "bottom-right":
                    window.setPosition( boundX + display.workAreaSize.width - 400, boundY + display.workAreaSize.height - window.getSize()[1] )
                    break;
                default:
                    break;
            }

            window.setResizable(false)
            window.setAlwaysOnTop(false)
            store.set( "preferences.overlay.screen.id", display.id )
        }
    } )

    ipcMain.on( EEvents.MAKE_WINDOW_TO_FULL_MODE, ( event : IpcMainEvent ) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if ( window ) {
            const lastFullModeWindowState = store.get( "lastFullModeWindowState" )

            const width = lastFullModeWindowState.width ?? screen.getPrimaryDisplay().workAreaSize.width;
            const height = lastFullModeWindowState.height ?? screen.getPrimaryDisplay().workAreaSize.height;
            const x = lastFullModeWindowState.x ?? 0;
            const y = lastFullModeWindowState.y ?? 0;

            window.setResizable(true)
            window.setSize( width, height)
            window.setPosition( x, y )
            window.setAlwaysOnTop(false)
        }
    } )

    ipcMain.on( EEvents.MAKE_WINDOW_TO_TASK_TODO_FOCUS_MODE, ( event : IpcMainEvent, fromOverlayMode? : boolean ) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if ( window ) {

            if ( !fromOverlayMode ) {
                const { width : boundWidth, height : boundHeight, x, y } = window.getBounds()
                const currentWindowScreen = screen.getDisplayMatching(window.getBounds())
                store.set( "lastFullModeWindowState", {
                    width : boundWidth,
                    height : boundHeight,
                    x,
                    y,
                    screenId : currentWindowScreen.id
                } )
            }

            const lastFocusModeWindowState = store.get( "lastFocusModeWindowState" )

            if ( lastFocusModeWindowState ) {
                if ( lastFocusModeWindowState ) {
                    const display = screen.getAllDisplays().find( display => display.id === lastFocusModeWindowState.screenId )
                    if ( display ) {
                        window.setPosition( lastFocusModeWindowState.x, lastFocusModeWindowState.y )
                    }
                }
            }

            window.unmaximize()
            window.setResizable(true)
            window.setSize( 290, 110 )
            window.setResizable(false)
            window.setAlwaysOnTop(true)
        }
    } )

    ipcMain.on( EEvents.CHANGE_OVERLAY_SCREEN, ( event : IpcMainEvent, screendId : number ) => {
        const displays = screen.getAllDisplays()
        const display = displays.find( display => display.id === screendId );
        if ( display ) {
            const window = BrowserWindow.fromWebContents(event.sender)
            if ( window ) {
                const boundX = display.bounds.x
                const boundY = display.bounds.y
                // Limit the height to 1080 when display resolution > 1080
                const height = display.workArea.height > 1080 ? 1080 : display.workAreaSize.height
                window.setResizable(true)
                window.setSize( 400, height )
                window.setPosition( boundX, boundY )

                const location : TElectronStorePreferencesOverlayLocation = store.get("preferences.overlay.location") ?? "top-left"

                switch (location) {
                    case "top-left":
                        window.setPosition( boundX, boundY )
                        break;
                    case "top-right":
                        window.setPosition( boundX + display.workAreaSize.width - 400, boundY )
                        break;
                    case "bottom-left":
                        window.setPosition( boundX, boundY + display.workAreaSize.height - window.getSize()[1] )
                        break;
                    case "bottom-right":
                        window.setPosition( boundX + display.workAreaSize.width - 400, boundY + display.workAreaSize.height - window.getSize()[1] )
                        break;
                    default:
                        break;
                }

                window.setResizable(false)
                store.set( "preferences.overlay.screen.id", display.id )
            }
        }
    } )

    ipcMain.on( EEvents.CHANGE_OVERLAY_LOCATION, ( event : IpcMainEvent, location : TElectronStorePreferencesOverlayLocation ) => {
        const display = screen.getAllDisplays().find( display => display.id === store.get( "preferences.overlay.screen.id" ) )
        const window = BrowserWindow.fromWebContents(event.sender)
        if ( display && window ) {
            const boundX = display.bounds.x
            const boundY = display.bounds.y
            switch (location) {
                case "top-left":
                    window.setPosition( boundX, boundY )
                    break;
                case "top-right":
                    window.setPosition( boundX + display.workAreaSize.width - 400, boundY )
                    break;
                case "bottom-left":
                    window.setPosition( boundX, boundY + display.workAreaSize.height - window.getSize()[1] )
                    break;
                case "bottom-right":
                    window.setPosition( boundX + display.workAreaSize.width - 400, boundY + display.workAreaSize.height - window.getSize()[1] )
                    break;
                default:
                    break;
            }
            store.set( "preferences.overlay.location", location )
        }
    } )

}