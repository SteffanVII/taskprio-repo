import { WebSocketServer } from "ws"
import { WebSocket } from "ws"
import { wsConnectionsManager } from "../app.js"
import { IncomingMessage } from "http"
import { TWebSocketMessage } from "./types.js"
import { EWebSocketEventType } from "./enums.js"
import { pathUpdateEventHandler } from "./eventHandlers/pathUpdateEventHandler.js"
import cookie from "cookie"
import { TJWTPayload } from "../middlewares/types.js"
import jwt from "jsonwebtoken"
export const registerWebSocketLogic = ( wss : WebSocketServer ) => {
    
    wsConnectionsManager.addEventHandler( EWebSocketEventType.PATH_CHANGE, pathUpdateEventHandler )

    // Connection event
    wss.on("connection", ( ws : WebSocket, req : IncomingMessage ) => {
        const cookies = cookie.parse(req.headers.cookie || "")
        const accessToken = cookies.accessToken

        console.log(accessToken);
        console.log(process.env.JSONWEBTOKEN_SECRET);

        const decodedToken = jwt.verify(accessToken, process.env.JSONWEBTOKEN_SECRET) as TJWTPayload;

        // Close the connection if the user_id doesnt exists
        if ( !decodedToken.user_id ) {
            ws.close()
            return;
        }
        
        // Add the user_id value to the WebSocket class instance
        ws.user_id = decodedToken.user_id;

        // Add the WebSocket to list of connections in the connections manager
        wsConnectionsManager.addConnection(ws);

        ws.on( "message" , ( _message ) => {
            const messageString = _message.toString()
            const message = JSON.parse(messageString) as TWebSocketMessage
            const handler = wsConnectionsManager.getEventHandler( message.type )
            if ( handler ) handler( ws, message )
        } )

        ws.on( "close" , () => {
            wsConnectionsManager.removeConnection( decodedToken.user_id )
            console.log("Client disconnected")
        } )

    })

}