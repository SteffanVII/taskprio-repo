import WebSocket, { WebSocketServer } from "ws";
import { EWebSocketEventType, TWebSocketMessage, EWebsocketClientEventType } from "@repo/taskprio-types";
import { taskTodoTimerHeartbeatEventHandler } from "./eventHandlers/taskTodoEventHandlers.js";
import { checkHealthEventHandler } from "./eventHandlers/generalEventHandlers.js";
import { joinProjectChannelEventHandler, joinTaskboardChannelEventHandler, joinWorkspaceChannelEventHandler, leaveProjectChannelEventHandler, leaveTaskboardChannelEventHandler, leaveWorkspaceChannelEventHandler } from "./eventHandlers/channelHandlers.js";

export enum EWebsocketConnectionType {
    webapp = "webapp",
    electron = "electron"
}

export class WebSocketConnectionsManager {

    private wss : WebSocketServer;
    private allConnections : Map<string, Map<string, WebSocket>>;
    private workspaceChannels : Map<string, WebSocketChannel>;
    private projectChannels : Map<string, WebSocketChannel>;
    private taskboardChannels : Map<string, WebSocketChannel>;
    private eventHandlers : Map<(EWebSocketEventType | EWebsocketClientEventType), ( ws : WebSocket, data : TWebSocketMessage ) => void>;
    
    constructor( wss : WebSocketServer ) {
        this.wss = wss;
        this.allConnections = new Map();
        this.workspaceChannels = new Map();
        this.projectChannels = new Map();
        this.taskboardChannels = new Map();
        this.eventHandlers = new Map<(EWebSocketEventType | EWebsocketClientEventType), ( ws : WebSocket, data : TWebSocketMessage ) => void>([
            [ EWebsocketClientEventType.JOIN_WORKSPACE_CHANNEL, joinWorkspaceChannelEventHandler ],
            [ EWebsocketClientEventType.LEAVE_WORKSPACE_CHANNEL, leaveWorkspaceChannelEventHandler ],
            [ EWebsocketClientEventType.JOIN_PROJECT_CHANNEL, joinProjectChannelEventHandler ],
            [ EWebsocketClientEventType.LEAVE_PROJECT_CHANNEL, leaveProjectChannelEventHandler ],
            [ EWebsocketClientEventType.JOIN_TASKBOARD_CHANNEL, joinTaskboardChannelEventHandler ],
            [ EWebsocketClientEventType.LEAVE_TASKBOARD_CHANNEL, leaveTaskboardChannelEventHandler ],
            [ EWebsocketClientEventType.TASK_TODO_TIMER_HEARTBEAT, taskTodoTimerHeartbeatEventHandler ],
            [ EWebsocketClientEventType.CHECK_HEALTH, checkHealthEventHandler ] 
        ]);
    }

    public getEventHandler( eventType : (EWebSocketEventType | EWebsocketClientEventType) ) {
        return this.eventHandlers.get( eventType )
    }

    // On initial connection, the user is not in any workspace so we add the connection to the allConnections map
    // The client needs to call a switch workspace event to be subscribe to the workspace they currently in
    public addConnection( webSocket : WebSocket ) {
        console.log("Adding connection", webSocket.user_id, webSocket.connection_type);
        const userConnections = this.allConnections.get( webSocket.user_id )
        // If the user websocket connections map exists then append
        if ( !!userConnections ) {
            userConnections.set( webSocket.client_id, webSocket );
        } else {
        // If not create the a new user connections map with the new connection
            const newUserConnectionsMap : Map<string, WebSocket> = new Map()
            newUserConnectionsMap.set( webSocket.client_id, webSocket )
            this.allConnections.set( webSocket.user_id, newUserConnectionsMap )
        }
    }

    public removeConnection( userId : string, clientId : string ) {

        [
            this.workspaceChannels,
            this.projectChannels,
            this.taskboardChannels
        ].forEach( channelMap => {
            channelMap.forEach( ( channel : IWebSocketChannel ) => {
                channel.removeConnection( userId, clientId )
                if ( channel.isEmpty() ) {
                    channelMap.delete( channel.getId() )
                }
            } )
        } ) 
        this.allConnections.get(userId)?.delete(clientId)
    }

    public joinChannel(
        channelType : "workspace" | "project" | "taskboard",
        webSocket : WebSocket,
        channelId : string,
        previousChannelId? : string,
    ) {

        const channelMap : Map<string, IWebSocketChannel> = {
            workspace : this.workspaceChannels,
            project : this.projectChannels,
            taskboard : this.taskboardChannels
        }[channelType];

        const channel = channelMap.get( channelId );

        if ( channel ) {
            channel.addConnection( webSocket );
            console.log("Connection added to channel", channelType, channelId);
        } else {
            let newChannel : IWebSocketChannel = new WebSocketChannel( channelId );
            channelMap.set( channelId, newChannel );
            newChannel.addConnection( webSocket );
            console.log("New channel created and connection added", channelType, channelId);
        }

        if ( previousChannelId ) {
            const previousChannel = channelMap.get( previousChannelId );
            if ( previousChannel ) {
                previousChannel.removeConnection( webSocket.user_id , webSocket.client_id );
                console.log("Connection removed from previous channel", channelType, previousChannelId);
                if ( previousChannel.isEmpty() ) {
                    channelMap.delete( previousChannelId );
                }
            }
        }

    }

    public leaveChannel(
        channelType : "workspace" | "project" | "taskboard",
        webSocket : WebSocket,
        channelId : string
    ) {

        const channelMap = {
            workspace : this.workspaceChannels,
            project : this.projectChannels,
            taskboard : this.taskboardChannels
        }[channelType];

        const channel = channelMap.get( channelId );
        if ( channel ) {
            channel.removeConnection( webSocket.user_id , webSocket.client_id );
            console.log("Connection removed from channel", channelType, channelId);
            if ( channel.isEmpty() ) {
                channelMap.delete( channelId );
            }
        }

    }

    public broadcastToChannel(
        channelType : "workspace" | "project" | "taskboard",
        channelId : string,
        message : TWebSocketMessage,
        includedUserIds? : string[],
        excludedUserIds? : string[]
    ) {

        const channelMap = {
            workspace : this.workspaceChannels,
            project : this.projectChannels,
            taskboard : this.taskboardChannels,
        }[channelType];

        const channel = channelMap.get( channelId );
        if ( channel ) {
             channel.getConnections().forEach( (userConnections, userId) => {
                if (includedUserIds && includedUserIds.length > 0 && !includedUserIds.includes(userId)) return;
                if (excludedUserIds && excludedUserIds.length > 0 && excludedUserIds.includes(userId)) return;

                userConnections.forEach( connection => {
                    if ( connection.readyState === WebSocket.OPEN ) {
                        console.log("Sending websocket message to user", userId, connection.readyState);
                        connection.send( JSON.stringify( message ) )
                    }
                } )
            } )
        }

    }

    public broadcastToUsers(
        message : TWebSocketMessage,
        userIds : string[]
    ) {

        if ( userIds.length === 0 ) return;

        userIds.forEach( userId => {
            const userConnections = this.allConnections.get( userId );
            if ( userConnections ) {
                userConnections.forEach( connection => {
                    if ( connection.readyState === WebSocket.OPEN ) {
                        console.log("Sending websocket message to user", userId, connection.readyState);
                        connection.send( JSON.stringify( message ) )
                    }
                } )
            }
        } )

    }

}

interface IWebSocketChannel {
    getId() : string;
    isEmpty() : boolean;
    addConnection( webSocket : WebSocket ) : void;
    removeConnection( userId : string, clientId : string ) : void;
    getConnections() : Map<string, Map<string, WebSocket>>;
}

class WebSocketChannel implements IWebSocketChannel {

    private channelId : string;
    private connections : Map<string, Map<string, WebSocket>>;

    constructor(
        channelId : string
    ) {
        this.channelId = channelId;
        this.connections = new Map();
    }

    public getId() {
        return this.channelId;
    }

    public isEmpty() {
        return this.connections.size === 0;
    }

    public addConnection( webSocket : WebSocket ) {
        const userWebSocketConnectionsMap : Map<string, WebSocket> | undefined = this.getUserConnections( webSocket.user_id )
        if ( !!userWebSocketConnectionsMap ) {
            userWebSocketConnectionsMap.set( webSocket.client_id, webSocket )
        } else {
            const newUserWebSocketConnectionsMap = new Map()
            newUserWebSocketConnectionsMap.set( webSocket.client_id, webSocket )
            this.connections.set( webSocket.user_id, newUserWebSocketConnectionsMap )
        }
    }

    public getConnections() {
        return this.connections;
    }

    public getUserConnections( userId : string ) : Map<string, WebSocket> | undefined {
        return this.connections.get( userId );
    }

    public getUserClientConnection( userId : string, clientId : string ) : WebSocket | undefined {
        return this.getUserConnections( userId ).get( clientId )
    }

    public removeConnection( userId : string, clientId : string ) {
        const connection = this.getUserConnections( userId );
        if ( connection ) {
            connection.delete( clientId )
            if ( connection.size === 0 ) {
                this.connections.delete( userId )
            }
        }
    }

}