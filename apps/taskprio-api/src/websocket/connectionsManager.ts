import WebSocket, { WebSocketServer } from "ws";
import { EWebSocketEventType, TWebSocketMessage, TWebSocketChangePathMessageSimple, EWebsocketClientEventType } from "@repo/taskprio-types";

export class WebSocketConnectionsManagerSimple {

    private allConnections : Map<string, WebSocket>;
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
        console.log("Adding connection", webSocket.user_id);
        this.allConnections.set( webSocket.user_id, webSocket )
    }

    public removeConnection( userId : string ) {
        this.allConnections.delete( userId )
        this.workspaceClientGroups.forEach( workspaceClientGroup => {
            workspaceClientGroup.removeConnection( userId )
        } )
    }

    // When the user switches workspace, we remove the connection from the previous workspace connection group and add it to the new workspace connection group
    public switchWorkspace( webSocket : WebSocket, workspaceId : string, previousWorkspaceId? : string ) {

        // If the user is switching workspace, we remove the connection from the previous workspace connection group
        if ( previousWorkspaceId ) {
            const previousClientGroup = this.workspaceClientGroups.get( previousWorkspaceId );
            if ( previousClientGroup ) {
                previousClientGroup.removeConnection( webSocket.user_id );
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
            clientGroup.getConnections().forEach( connection => {
                let skip = false;

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
            } )
        }

    }

}

class WorkspaceWebSocketClientGroup {

    private workspaceId : string;
    private connections : Map<string, WebSocket>;

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
        this.connections.set( webSocket.user_id, webSocket )
    }

    public getConnections() {
        return this.connections;
    }

    public getConnection( userId : string ) : WebSocket | undefined {
        return this.connections.get( userId );
    }

    public removeConnection( userId : string ) {
        const connection = this.getConnection( userId );
        if ( connection ) {
            this.connections.delete( userId )
        }
    }

}