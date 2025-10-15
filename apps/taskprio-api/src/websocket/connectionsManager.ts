import WebSocket, { WebSocketServer } from "ws";
import { EWebSocketEventType, TWebSocketMessage, TWebSocketChangePathMessageSimple } from "@repo/taskprio-types";

// class WebSocketConnectionsManager {

//     // All connections : Key = user_id
//     private allConnections : Map<string, WebSocket>;
//     // Workspaces connection groups : Key = workspace_id
//     private workspaceClientGroups : Map<string, WorkspaceClientGroup>;
//     private eventHandlers : Map<string, ( ws : WebSocket, data : TWebSocketMessage ) => void>;
//     private wss : WebSocketServer;

//     constructor( wss : WebSocketServer ) {
//         this.wss = wss;
//         this.allConnections = new Map();
//         this.workspaceClientGroups = new Map();
//         this.eventHandlers = new Map();
//     }

//     public addConnection( ws : WebSocket ) {
//         this.allConnections.set( ws.user_id, ws )
//     }

//     public removeConnection( user_id : string ) {
//         console.log("Removing connection", user_id);
//         this.allConnections.delete( user_id )
//         this.workspaceClientGroups.forEach( ( workspaceClientGroup ) => {
//             workspaceClientGroup.removeConnection( user_id )
//             workspaceClientGroup.projectClientGroups.forEach( ( projectClientGroup ) => {
//                 projectClientGroup.removeConnection( user_id )
//                 projectClientGroup.boardClientGroups.forEach( ( boardClientGroup ) => {
//                     boardClientGroup.removeConnection( user_id )
//                 } )
//             } )
//         } )
//     }

//     public getConnectionFromAll( user_id : string ) {
//         return this.allConnections.get( user_id )
//     }

//     public addEventHandler( event : EWebSocketEventType, handler : ( ws : WebSocket, data : TWebSocketMessage ) => void ) {
//         this.eventHandlers.set( event, handler );
//     }

//     public getEventHandler( event : EWebSocketEventType ) {
//         return this.eventHandlers.get( event )
//     }

//     public updateConnectionPath( pathMessage : TWebSocketChangePathMessage, ws : WebSocket ) {

//         // Undefined previous_path.workspace_id means it's a new connection
//         if ( !pathMessage.previous_path.workspace_id ) {
//             // let isNewWorkspaceClientGroup = false
//             let workspaceClientGroup = this.workspaceClientGroups.get( pathMessage.workspace_id );
//             // If the workspace client group doesnt exist we make a new one
//             if ( !workspaceClientGroup ) {
//                 workspaceClientGroup = new WorkspaceClientGroup( pathMessage.workspace_id )
//                 this.workspaceClientGroups.set( pathMessage.workspace_id, workspaceClientGroup )
//             }
            
//             if ( pathMessage.project_id ) {
//                 let projectClientGroup = workspaceClientGroup.getProjectClientGroup( pathMessage.project_id ) 
//                 if ( !projectClientGroup ) {
//                     projectClientGroup = new ProjectClientGroup( pathMessage.project_id )
//                     workspaceClientGroup.addProjectClientGroup( projectClientGroup )
//                 }
//                 // If there is board_id add the connection to the board client group
//                 if ( pathMessage.board_id ) {
//                     let boardClientGroup = projectClientGroup.getBoardClientGroup( pathMessage.board_id )
//                     if ( !boardClientGroup ) {
//                         boardClientGroup = new BoardClientGroup( pathMessage.board_id )
//                         projectClientGroup.addBoardClientGroup( boardClientGroup )
//                         boardClientGroup.addConnection( ws )
//                     }
//                 // If there is no board_id add the connection to the project client group
//                 } else {
//                     projectClientGroup.addConnection( ws )
//                 }
//             // If project_id doesnt exist add the connection to the workspace client group
//             } else {
//                 workspaceClientGroup.addConnection( ws )
//             }
//         // If previous_path.workspace_id exists means we need to relocate the connection to the new path
//         } else {

//             // First we remove the connection from the previous path

//             const previousWorkspaceClientGroup = this.workspaceClientGroups.get( pathMessage.previous_path.workspace_id )
//             // If the previous workspace client group exist we continue searching for the connection otherwise we continue to move the connection to a new path
//             if ( previousWorkspaceClientGroup ) {
//                 previousWorkspaceClientGroup.removeConnection( ws.user_id )
//                 if ( pathMessage.previous_path.project_id ) {
//                     const previousProjectClientGroup = previousWorkspaceClientGroup.getProjectClientGroup( pathMessage.previous_path.project_id )
//                     // If the previous project client group exist we continue searching for the connection otherwise we continue to move the connection to a new path
//                     if ( previousProjectClientGroup ) {
//                         previousProjectClientGroup.removeConnection( ws.user_id )
//                         if ( pathMessage.previous_path.board_id ) {
//                             const previousBoardClientGroup = previousProjectClientGroup.getBoardClientGroup( pathMessage.previous_path.board_id )
//                             // If the previous board client group exist we continue searching for the connection otherwise we continue to move the connection to a new path
//                             if ( previousBoardClientGroup ) {
//                                 previousBoardClientGroup.removeConnection( ws.user_id )
//                             }
//                         }
//                     }
//                 }
//             }

//             let workspaceClientGroup = this.workspaceClientGroups.get( pathMessage.workspace_id )
//             if ( !workspaceClientGroup ) {
//                 workspaceClientGroup = new WorkspaceClientGroup( pathMessage.workspace_id )
//                 this.workspaceClientGroups.set( pathMessage.workspace_id, workspaceClientGroup )
//             }
//             if ( pathMessage.project_id ) {
//                 let projectClientGroup = workspaceClientGroup.getProjectClientGroup( pathMessage.project_id )
//                 if ( !projectClientGroup ) {
//                     projectClientGroup = new ProjectClientGroup( pathMessage.project_id )
//                     workspaceClientGroup.addProjectClientGroup( projectClientGroup )
//                 }
//                 if ( pathMessage.board_id ) {
//                     let boardClientGroup = projectClientGroup.getBoardClientGroup( pathMessage.board_id )
//                     if ( !boardClientGroup ) {
//                         boardClientGroup = new BoardClientGroup( pathMessage.board_id )
//                         boardClientGroup.addConnection( ws )
//                         projectClientGroup.addBoardClientGroup( boardClientGroup )
//                     }
//                 } else {
//                     projectClientGroup.addConnection( ws )
//                 }
//             } else {
//                 workspaceClientGroup.addConnection( ws )
//             }
//         }

//     }

//     public sendMessage( message : TWebSocketMessage, excludedUserId : string[], path : TConnectedClientPath ) {
//         let wsMap : Map<string, WebSocket>;
//         const workspaceClientGroup = this.workspaceClientGroups.get( path.workspace_id )
//         if ( workspaceClientGroup ) {
//             if ( path.project_id ) {
//                 const projectClientGroup = workspaceClientGroup.getProjectClientGroup( path.project_id )
//                 if ( projectClientGroup ) {
//                     if ( path.board_id ) {
//                         const boardClientGroup = projectClientGroup.getBoardClientGroup( path.board_id )
//                         if ( boardClientGroup ) {
//                             wsMap = boardClientGroup.connections
//                         }
//                     } else {
//                         wsMap = projectClientGroup.connections
//                     }
//                 }
//             } else {
//                 wsMap = workspaceClientGroup.connections
//             }
//         }

//         if ( wsMap ) {
//             wsMap.forEach( ( ws ) => {
//                 if ( !excludedUserId.includes( ws.user_id ) ) {
//                     ws.send( JSON.stringify( message ) )
//                 }
//             } )
//         }
//     }

// }

// export default WebSocketConnectionsManager;

// class WorkspaceClientGroup {
    
//     private workspaceId : string;
//     public projectClientGroups : Map<string, ProjectClientGroup>;
//     public connections : Map<string, WebSocket>;
//     constructor( workspace_id : string ) {
//         this.workspaceId = workspace_id
//         this.projectClientGroups = new Map()
//         this.connections = new Map()
//     }
//     public getId() {
//         return this.workspaceId
//     }
//     public addProjectClientGroup( pGC : ProjectClientGroup ) {
//         if ( this.projectClientGroups.get( pGC.getId() ) ) return
//         this.projectClientGroups.set( pGC.getId(), pGC )
//     }
//     public getProjectClientGroup( project_id : string ) {
//         return this.projectClientGroups.get( project_id )
//     }
//     public addConnection( ws : WebSocket ) {
//         this.connections.set( ws.user_id, ws )
//     }
//     public getConnection( user_id : string ) {
//         let connection : WebSocket;
//         connection = this.connections.get( user_id )
//         return connection;
//     }
//     public removeConnection( user_id : string ) {
//         this.connections.delete( user_id )
//     }

// }

// class ProjectClientGroup {
//     private projectId : string;
//     public boardClientGroups : Map<string, BoardClientGroup>
//     public connections : Map<string, WebSocket>;
//     constructor( projectId : string ) {
//         this.projectId = projectId;
//         this.boardClientGroups = new Map();
//         this.connections = new Map()
//     }
//     public getId() {
//         return this.projectId
//     }
//     public addBoardClientGroup( bCG : BoardClientGroup ) {
//         this.boardClientGroups.set( bCG.getId(), bCG )
//     }
//     public getBoardClientGroup( board_id : string ) {
//         return this.boardClientGroups.get( board_id )
//     }
//     public addConnection( ws : WebSocket ) {
//         this.connections.set( ws.user_id, ws )
//     }
//     public getConnection( user_id : string ) {
//         let connection : WebSocket;
//         connection = this.connections.get( user_id )
//         return connection;
//     }
//     public removeConnection( user_id : string ) {
//         this.connections.delete( user_id )
//     }
// }

// class BoardClientGroup {
//     private boardId : string;
//     public connections : Map<string, WebSocket>;
//     constructor( boardId : string ) {
//         this.boardId = boardId;
//         this.connections = new Map()
//     }
//     public getId() {
//         return this.boardId;
//     }
//     public addConnection( ws : WebSocket ) {
//         this.connections.set( ws.user_id, ws )
//     }
//     public getConnection( user_id : string ) {
//         let connection : WebSocket;
//         connection = this.connections.get( user_id )
//         return connection
//     }
//     public removeConnection( user_id : string ) {
//         this.connections.delete( user_id )
//     }
// }

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

    public addEventHandler( eventType : EWebSocketEventType, handler : ( ws : WebSocket, data : TWebSocketMessage ) => void ) {
        this.eventHandlers.set( eventType, handler );
    }

    public getEventHandler( eventType : EWebSocketEventType ) {
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

    // When the user switches workspace, we remove the connection from the previous workspace and add it to the new workspace
    public switchWorkspace( webSocket : WebSocket, workspaceId : string, previousWorkspaceId? : string ) {

        // If the user is switching workspace, we remove the connection from the previous workspace
        if ( previousWorkspaceId ) {
            const previousClientGroup = this.workspaceClientGroups.get( previousWorkspaceId );
            if ( previousClientGroup ) {
                previousClientGroup.removeConnection( webSocket.user_id );
            }
        }

        // If the target workspace group doesnt exist, we create a new one
        let newClientGroup = this.workspaceClientGroups.get( workspaceId );
        if ( !newClientGroup ) {
            newClientGroup = new WorkspaceWebSocketClientGroup( workspaceId );
            this.workspaceClientGroups.set( workspaceId, newClientGroup );
        }
        newClientGroup.addConnection( webSocket );
    }

    public sendMessage( message : TWebSocketMessage, excludedUserIds : string[], workspaceId : string ) {

        const clientGroup = this.workspaceClientGroups.get( workspaceId );
        if ( clientGroup ) {
            clientGroup.getConnections().forEach( connection => {
                if ( !excludedUserIds.includes( connection.user_id ) ) {
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