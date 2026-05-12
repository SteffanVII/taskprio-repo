import { TWebSocketMessage } from "@repo/taskprio-types"
import { ipcMain, session } from "electron"
import { EEventListeners, EEvents } from "src/lib/enums"
import { websocketManager } from "./websocketManager"
import dotenv from "dotenv"
import { mainWindow } from "../main"

dotenv.config()

export const websocketMain = () => {

    ipcMain.on( EEvents.INITIALIZE_WEBSOCKET, async ( event ) => {
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, process.env.COOKIE_DOMAIN)
        const cookie = await event.sender.session.cookies.get({
            name : "access_token",
            domain : "taskprio-repo.onrender.com"
        })
        const accessToken = cookie[0]?.value;
        if ( !accessToken ) {
            throw new Error("Access token not found") 
        }
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, "Getting access token")
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, JSON.stringify(cookie, null, 2))
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, JSON.stringify(cookie[0], null, 2))
        mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, cookie[0].value)
        websocketManager.createConnection(accessToken)
    } )

    ipcMain.on( EEvents.CLOSE_WEBSOCKET, () => {
        if ( websocketManager.websocket ) {
            websocketManager.closeConnection()
        }
    } )

    ipcMain.on( EEvents.SEND_WEBSOCKET_MESSAGE, async ( _, message : TWebSocketMessage ) => {
        if (!websocketManager.websocket) {
            throw new Error("Websocket not initialized")
        }
        websocketManager.websocket.send(JSON.stringify(message))
    } )

}