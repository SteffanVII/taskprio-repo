import WebSocket, { WebSocketServer } from "ws";
import { EWebSocketEventType, TWebSocketMessage, TWebSocketChangePathMessageSimple, EWebsocketClientEventType } from "@repo/taskprio-types";

export enum EWebsocketConnectionType {
    webapp = "webapp",
    electron = "electron"
}

export class WebSocketConnectionsManagerSimple {

    private allConnections : Map<string, Map<string, WebSocket>>;
    private workspaceClientGroups : Map<string, WorkspaceWebSocketClientGroup>;
    private eventHandlers : Map<string, ( ws : WebSocket, data : TWebSocketMessage ) => void>
    private wss : WebSocketServer;
    
    constructor( wss : WebSocketServer ) {
        this.wss = wss;
        this.allConnections = new Map();
        this.workspaceClientGroups = new Map();
        this.eventHandlers = new Map();
    }

    public addEventHandler( eventType : (EWebSocketEventType | EWebsocketClientEventType), handler : ( ws : WebSocket, data : TWebSocketMessage ) => void ) {
        this.eventHandlers.set( eventType, handler );
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
        this.workspaceClientGroups.forEach( workspaceClientGroup => {
            workspaceClientGroup.removeConnection( userId, clientId )
        } )
    }

    // When the user switches workspace, we remove the connection from the previous workspace connection group and add it to the new workspace connection group
    public switchWorkspace( webSocket : WebSocket, workspaceId : string, previousWorkspaceId? : string ) {

        // If the user is switching workspace, we remove the connection from the previous workspace connection group
        if ( previousWorkspaceId ) {
            const previousClientGroup = this.workspaceClientGroups.get( previousWorkspaceId );
            if ( previousClientGroup ) {
                previousClientGroup.removeConnection( webSocket.user_id , webSocket.client_id );
                console.log("Connection removed from previous workspace", previousWorkspaceId);
            }
        }

        // If the target workspace group doesnt exist, we create a new one
        let newClientGroup = this.workspaceClientGroups.get( workspaceId );
        if ( !newClientGroup ) {
            newClientGroup = new WorkspaceWebSocketClientGroup( workspaceId );
            this.workspaceClientGroups.set( workspaceId, newClientGroup );
            console.log("Created new workspace client group for workspace", workspaceId);
        }
        newClientGroup.addConnection( webSocket );
        console.log("Connection added to workspace client group", workspaceId);
    }

    public sendMessage( message : TWebSocketMessage, workspaceId : string, includedUserIds? : string[], excludedUserIds? : string[] ) {

        const clientGroup = this.workspaceClientGroups.get( workspaceId );
        if ( clientGroup ) {
            clientGroup.getConnections().forEach( userConnections => {
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

class WorkspaceWebSocketClientGroup {

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
            newUserWebSocketConnectionsMap.set( webSocket.client_id, webSocket );
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