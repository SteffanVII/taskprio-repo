import { WebSocketServer } from "ws"
import { WebSocket } from "ws"
import { IncomingMessage } from "http"
import { TWebSocketMessage } from "@repo/taskprio-types"
import cookie from "cookie"
import { TJWTPayload } from "../middlewares/types.js"
import jwt from "jsonwebtoken"
import { EWebsocketConnectionType, WebSocketConnectionsManager } from "./connectionsManager.js"

export const registerWebSocketLogic = ( wss : WebSocketServer, wsConnectionsManager : WebSocketConnectionsManager ) => {

    // Connection event
    wss.on("connection", ( ws : WebSocket, req : IncomingMessage ) => {
        const cookies = cookie.parse(req.headers.cookie || "")
        const accessToken = cookies["access_token"]
        const url = new URL(req.url || "", `ws://${req.headers.host}`);
        const connectionType = url.searchParams.get('connection_type')
        const client_id = url.searchParams.get('client_id')

        const decodedToken = jwt.verify(accessToken, process.env.JSONWEBTOKEN_SECRET) as TJWTPayload;

        // Close the connection if the user_id doesnt exists
        if ( !decodedToken.user_id ) {
            ws.close()
            return;
        }
        
        // Add the user_id value to the WebSocket class instance
        ws.user_id = decodedToken.user_id;
        ws.connection_type = connectionType as EWebsocketConnectionType;
        ws.client_id = client_id

        // Add the WebSocket to list of connections in the connections manager
        wsConnectionsManager.addConnection( ws )

        ws.on( "message" , ( _message ) => {
            const messageString = _message.toString()
            const message = JSON.parse(messageString) as TWebSocketMessage
            // Get the handler from the connections manager base on the message type
            const handler = wsConnectionsManager.getEventHandler( message.type )
            if ( handler ) handler( ws, message )
        } )

        ws.on( "close" , () => {
            wsConnectionsManager.removeConnection( decodedToken.user_id, ws.client_id )
            console.log("Client disconnected", decodedToken.user_id, ws.client_id )
        } )

        console.log("Client connected", decodedToken.user_id, ws.client_id );

    })

}