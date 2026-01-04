import WebSocket, { WebSocketServer } from "ws";
import { EWebSocketEventType, TWebSocketMessage, TWebSocketChangePathMessageSimple, EWebsocketClientEventType } from "@repo/taskprio-types";
import { pathUpdateEventHandlerSimple } from "./eventHandlers/pathUpdateEventHandler.js";
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
    private workspaceChannels : Map<string, WorkspaceWebSocketChannel>;
    private projectChannels : Map<string, ProjectWebSocketChannel>;
    private taskboardChannels : Map<string, TaskboardWebSocketChannel>;
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
            [ EWebsocketClientEventType.PATH_CHANGE, pathUpdateEventHandlerSimple ],
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
        this.allConnections.get(userId)?.delete(clientId)
        this.workspaceChannels.forEach( workspaceClientGroup => {
            workspaceClientGroup.removeConnection( userId, clientId )
        } )
    }

    // When the user switches workspace, we remove the connection from the previous workspace connection group and add it to the new workspace connection group
    public joinWorkspaceChannel( webSocket : WebSocket, workspaceId : string, previousWorkspaceId? : string ) {

        // If the user is switching workspace, we remove the connection from the previous workspace connection group
        if ( previousWorkspaceId ) {
            const previousChannel = this.workspaceChannels.get( previousWorkspaceId );
            if ( previousChannel ) {
                previousChannel.removeConnection( webSocket.user_id , webSocket.client_id );
                console.log("Connection removed from previous workspace", previousWorkspaceId);
            }
        }

        // If the target workspace group doesnt exist, we create a new one
        let newChannel = this.workspaceChannels.get( workspaceId );
        if ( !newChannel ) {
            newChannel = new WorkspaceWebSocketChannel( workspaceId );
            this.workspaceChannels.set( workspaceId, newChannel );
            console.log("Created new workspace client group for workspace", workspaceId);
        }
        newChannel.addConnection( webSocket );
        console.log("Connection added to workspace client group", workspaceId);

    }

    public leaveWorkspaceChannel( webSocket : WebSocket, workspaceId : string ) {
        const channel = this.workspaceChannels.get( workspaceId );
        if ( channel ) {
            channel.removeConnection( webSocket.user_id , webSocket.client_id );
            console.log("Connection removed from workspace client group", workspaceId);
        }
    }

    public joinProjectChannel( webSocket : WebSocket, projectId : string, previousProjectId? : string ) {

        if ( previousProjectId ) {
            const previousChannel = this.projectChannels.get( previousProjectId );
            if ( previousChannel ) {
                previousChannel.removeConnection( webSocket.user_id , webSocket.client_id );
                console.log("Connection removed from previous project", previousProjectId);
            }
        }

        let newChannel = this.projectChannels.get( projectId );
        if ( !newChannel ) {
            newChannel = new ProjectWebSocketChannel( projectId );
            this.projectChannels.set( projectId, newChannel );
            console.log("Created new project client group for project", projectId);
        }
        newChannel.addConnection( webSocket );
        console.log("Connection added to project client group", projectId);
    }

    public leaveProjectChannel( webSocket : WebSocket, projectId : string ) {
        const channel = this.projectChannels.get( projectId );
        if ( channel ) {
            channel.removeConnection( webSocket.user_id , webSocket.client_id );
            console.log("Connection removed from project", projectId);
        }
    }

    public joinTaskboardChannel( webSocket : WebSocket, taskboardId : string, previousTaskboardId? : string ) {

        if ( previousTaskboardId ) {
            const previousChannel = this.taskboardChannels.get( previousTaskboardId );
            if ( previousChannel ) {
                previousChannel.removeConnection( webSocket.user_id , webSocket.client_id );
                console.log("Connection removed from previous taskboard", previousTaskboardId);
            }
        }

        let newChannel = this.taskboardChannels.get( taskboardId );
        if ( !newChannel ) {
            newChannel = new TaskboardWebSocketChannel( taskboardId );
            this.taskboardChannels.set( taskboardId, newChannel );
            console.log("Created new taskboard client group for taskboard", taskboardId);
        }
        newChannel.addConnection( webSocket );
        console.log("Connection added to taskboard client group", taskboardId);
    }

    public leaveTaskboardChannel( webSocket : WebSocket, taskboardId : string ) {
        const channel = this.taskboardChannels.get( taskboardId );
        if ( channel ) {
            channel.removeConnection( webSocket.user_id , webSocket.client_id );
            console.log("Connection removed from taskboard", taskboardId);
        }
    }

    public sendMessage( message : TWebSocketMessage, workspaceId : string, includedUserIds? : string[], excludedUserIds? : string[] ) {

        const channel = this.workspaceChannels.get( workspaceId );
        if ( channel ) {
            channel.getConnections().forEach( userConnections => {
                if ( userConnections.size !== 0 ) {
                    let skip = false;
                    const connection = userConnections.get(userConnections.keys().next().value);

                    if ( includedUserIds && includedUserIds.length > 0 ) {
                        if ( !includedUserIds.includes( connection.user_id ) ) {
                            skip = true;
                        }
                    }
    
                    if ( excludedUserIds && excludedUserIds.length > 0 ) {
                        if ( excludedUserIds.includes( connection.user_id ) ) {
                            skip = true;
                        }
                    }

                    if ( !skip ) {
                        console.log("Sending websocket message to user", connection.user_id, connection.readyState);
                        connection.send( JSON.stringify( message ) )
                    }
                }
            } )
        }

    }

}

class WorkspaceWebSocketChannel {

    private workspaceId : string;
    private connections : Map<string, Map<string, WebSocket>>;

    constructor(
        workspaceId : string
    ) {
        this.workspaceId = workspaceId;
        this.connections = new Map();
    }

    public getId() {
        return this.workspaceId;
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
        }
    }

}

class ProjectWebSocketChannel {

    private projectId : string;
    private connections : Map<string, Map<string, WebSocket>>;

    constructor(
        projectId : string
    ) {
        this.projectId = projectId;
        this.connections = new Map();
    }

    public getId() {
        return this.projectId;
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
        }
    }

}

class TaskboardWebSocketChannel {

    private taskboardId : string;
    private connections : Map<string, Map<string, WebSocket>>;

    constructor(
        taskboardId : string
    ) {
        this.taskboardId = taskboardId;
        this.connections = new Map();
    }

    public getId() {
        return this.taskboardId;
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
        }
    }

}