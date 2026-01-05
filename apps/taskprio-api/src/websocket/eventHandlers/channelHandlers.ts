import WebSocket from "ws"
import { TWebSocketJoinProjectChannelMessage, TWebSocketJoinTaskboardChannelMessage, TWebSocketJoinWorkspaceChannelMessage, TWebSocketLeaveProjectChannelMessage, TWebSocketLeaveTaskboardChannelMessage, TWebSocketLeaveWorkspaceChannelMessage, TWebSocketMessage } from "@repo/taskprio-types"
import { wsConnectionsManager } from "../../app.js"

export const joinWorkspaceChannelEventHandler = ( ws : WebSocket, payload : TWebSocketMessage<TWebSocketJoinWorkspaceChannelMessage> ) => {
    wsConnectionsManager.joinChannel( "workspace", ws, payload.message.workspace_id, payload.message.previous_workspace_id )
}

export const leaveWorkspaceChannelEventHandler = ( ws : WebSocket, payload : TWebSocketMessage<TWebSocketLeaveWorkspaceChannelMessage> ) => {
    wsConnectionsManager.leaveChannel( "workspace", ws, payload.message.workspace_id )
}

export const joinProjectChannelEventHandler = ( ws : WebSocket, payload : TWebSocketMessage<TWebSocketJoinProjectChannelMessage> ) => {
    wsConnectionsManager.joinChannel( "project", ws, payload.message.project_id, payload.message.previous_project_id )
}

export const leaveProjectChannelEventHandler = ( ws : WebSocket, payload : TWebSocketMessage<TWebSocketLeaveProjectChannelMessage> ) => {
    wsConnectionsManager.leaveChannel( "project", ws, payload.message.project_id )
}

export const joinTaskboardChannelEventHandler = ( ws : WebSocket, payload : TWebSocketMessage<TWebSocketJoinTaskboardChannelMessage> ) => {
    wsConnectionsManager.joinChannel( "taskboard", ws, payload.message.taskboard_id, payload.message.previous_taskboard_id )
}

export const leaveTaskboardChannelEventHandler = ( ws : WebSocket, payload : TWebSocketMessage<TWebSocketLeaveTaskboardChannelMessage> ) => {
    wsConnectionsManager.leaveChannel( "taskboard", ws, payload.message.taskboard_id )
}