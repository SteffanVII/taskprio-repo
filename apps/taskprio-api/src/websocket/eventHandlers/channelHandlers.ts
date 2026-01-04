import WebSocket from "ws"
import { TWebSocketJoinProjectChannelMessage, TWebSocketJoinTaskboardChannelMessage, TWebSocketJoinWorkspaceChannelMessage, TWebSocketLeaveProjectChannelMessage, TWebSocketLeaveTaskboardChannelMessage, TWebSocketLeaveWorkspaceChannelMessage, TWebSocketMessage } from "@repo/taskprio-types"
import { wsConnectionsManager } from "../../app.js"


export const joinWorkspaceChannelEventHandler = ( ws : WebSocket, message : TWebSocketMessage<TWebSocketJoinWorkspaceChannelMessage> ) => {
    wsConnectionsManager.joinWorkspaceChannel( ws, message.data.workspace_id, message.data.previous_workspace_id )
}

export const leaveWorkspaceChannelEventHandler = ( ws : WebSocket, message : TWebSocketMessage<TWebSocketLeaveWorkspaceChannelMessage> ) => {
    wsConnectionsManager.leaveWorkspaceChannel( ws, message.data.workspace_id )
}

export const joinProjectChannelEventHandler = ( ws : WebSocket, message : TWebSocketMessage<TWebSocketJoinProjectChannelMessage> ) => {
    wsConnectionsManager.joinProjectChannel( ws, message.data.project_id, message.data.previous_project_id )
}

export const leaveProjectChannelEventHandler = ( ws : WebSocket, message : TWebSocketMessage<TWebSocketLeaveProjectChannelMessage> ) => {
    wsConnectionsManager.leaveProjectChannel( ws, message.data.project_id )
}

export const joinTaskboardChannelEventHandler = ( ws : WebSocket, message : TWebSocketMessage<TWebSocketJoinTaskboardChannelMessage> ) => {
    wsConnectionsManager.joinTaskboardChannel( ws, message.data.taskboard_id, message.data.previous_taskboard_id )
}

export const leaveTaskboardChannelEventHandler = ( ws : WebSocket, message : TWebSocketMessage<TWebSocketLeaveTaskboardChannelMessage> ) => {
    wsConnectionsManager.leaveTaskboardChannel( ws, message.data.taskboard_id )

}