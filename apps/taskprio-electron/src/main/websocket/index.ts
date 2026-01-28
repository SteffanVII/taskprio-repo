import { TWebSocketMessage } from "@repo/taskprio-types"
import { IpcMain, ipcMain, IpcMainEvent, session } from "electron"
import { EEvents } from "src/lib/enums"
import { websocketManager } from "./websocketManager"

export const websocketMain = () => {

    ipcMain.on( EEvents.INITIALIZE_WEBSOCKET, async ( event : IpcMainEvent ) => {
        const cookie = await session.defaultSession.cookies.get({
            name : "access_token",
            // domain : "taskprio-repo.onrender.com"
            domain : "localhost"
        })
        const accessToken = cookie[0]?.value;
        if ( !accessToken ) {
            throw new Error("Access token not found") 
        }
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