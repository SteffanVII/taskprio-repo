import { ESocketEventType, TSocketEventPayloadWorkspaceMemberDeactivated, TSocketEventPayloadWorkspaceMemberJoin, TSocketEventPayloadWorkspaceMemberReactivated } from "@repo/taskprio-types"
import { io } from "../index.js"

export const emitWorkspaceMemberJoined = (workspaceId : string, data : TSocketEventPayloadWorkspaceMemberJoin) => {
  io.to(workspaceId).emit(ESocketEventType.WORKSPACE_JOIN, data)
}

export const emitWorkspaceMemberDeactivated = (workspaceId : string, data : TSocketEventPayloadWorkspaceMemberDeactivated) => {
  io.to(workspaceId).emit(ESocketEventType.WORKSPACE_MEMBER_DEACTIVATED, data)
}

export const emitWorkspaceMemberReactivated = (workspaceId : string, data : TSocketEventPayloadWorkspaceMemberReactivated) => {
  io.to(workspaceId).emit(ESocketEventType.WORKSPACE_MEMBER_REACTIVATED, data)
}