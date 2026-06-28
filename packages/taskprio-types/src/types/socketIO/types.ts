import { TWorkspaceMember } from "../workspace/types"

export type TSocketEventPayload<T> = {
  data : T
}

// =============================
// Workspace
// =============================

export type TSocketEventPayloadWorkspaceMemberJoin = TSocketEventPayload<{
  workspaceId : string,
  workspaceMember : TWorkspaceMember
}>

export type TSocketEventPayloadWorkspaceMemberDeactivated = TSocketEventPayload<{
  workspaceId : string,
  userId : string
}>

export type TSocketEventPayloadWorkspaceMemberReactivated = TSocketEventPayload<{
  workspaceId : string,
  userId : string
}>

export type TSocketEventPayloadWorkspacePrimitiveDataUpdated = TSocketEventPayload<{
  workspaceId : string
}>