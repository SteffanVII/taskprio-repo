import { WebSocketServer } from "ws"
import { WebSocket } from "ws"
import { IncomingMessage } from "http"
import { EWebsocketClientEventType, TWebSocketMessage } from "@repo/taskprio-types"
import { pathUpdateEventHandlerSimple } from "./eventHandlers/pathUpdateEventHandler.js"
import cookie from "cookie"
import { TJWTPayload } from "../middlewares/types.js"
import jwt from "jsonwebtoken"
import { WebSocketConnectionsManagerSimple } from "./connectionsManager.js"
import { taskTodoTimerHeartbeatEventHandler } from "./eventHandlers/taskTodoEventHandlers.js"

export const registerWebSocketLogic = ( wss : WebSocketServer, wsConnectionsManagerSimple : WebSocketConnectionsManagerSimple ) => {
    
    // Register incoming event handlers
    wsConnectionsManagerSimple.addEventHandler( EWebsocketClientEventType.PATH_CHANGE, pathUpdateEventHandlerSimple )
    wsConnectionsManagerSimple.addEventHandler( EWebsocketClientEventType.TASK_TODO_TIMER_HEARTBEAT, taskTodoTimerHeartbeatEventHandler )

    // Connection event
    wss.on("connection", ( ws : WebSocket, req : IncomingMessage ) => {
        const cookies = cookie.parse(req.headers.cookie || "")
        const accessToken = cookies["access_token"]

        const decodedToken = jwt.verify(accessToken, process.env.JSONWEBTOKEN_SECRET) as TJWTPayload;

        // Close the connection if the user_id doesnt exists
        if ( !decodedToken.user_id ) {
            ws.close()
            return;
        }
        
        // Add the user_id value to the WebSocket class instance
        ws.user_id = decodedToken.user_id;

        // Add the WebSocket to list of connections in the connections manager
        // wsConnectionsManager.addConnection(ws);
        wsConnectionsManagerSimple.addConnection( ws )

        ws.on( "message" , ( _message ) => {
            const messageString = _message.toString()
            const message = JSON.parse(messageString) as TWebSocketMessage
            // const handler = wsConnectionsManager.getEventHandler( message.type )
            // Get the handler from the connections manager base on the message type
            const handler = wsConnectionsManagerSimple.getEventHandler( message.type )
            if ( handler ) handler( ws, message )
        } )

        ws.on( "close" , () => {
            wsConnectionsManagerSimple.removeConnection( decodedToken.user_id )
            console.log("Client disconnected")
        } )

        console.log("Client connected", decodedToken.user_id);

    })

}