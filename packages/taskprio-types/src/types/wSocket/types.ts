import { EProjectRole } from "../project/enums"
import { TProject, TProjectMember, TProjectPrimitive } from "../project/types"
import { TTaskTag } from "../tag/types"
import { TTask, TTaskAssignee, TTaskPrimitive } from "../task/types"
import { EWebsocketClientEventType, EWebSocketEventType } from "./enums"

export type TWebSocketMessage<T = any> = {
    type: EWebSocketEventType | EWebsocketClientEventType,
    message: T,
}

export type TWebSocketChangePathMessage = {
    previous_workspace_id?: string,
    workspace_id: string
}

export type TWebSocketJoinWorkspaceChannelMessage = {
    workspace_id: string,
    previous_workspace_id?: string
}

export type TWebSocketLeaveWorkspaceChannelMessage = {
    workspace_id: string
}

export type TWebSocketJoinProjectChannelMessage = {
    project_id: string,
    previous_project_id?: string
}

export type TWebSocketLeaveProjectChannelMessage = {
    project_id: string
}

export type TWebSocketJoinTaskboardChannelMessage = {
    taskboard_id: string,
    previous_taskboard_id?: string
}

export type TWebSocketLeaveTaskboardChannelMessage = {
    taskboard_id: string
}

export type TCheckHealthWebSocketMessage = {
    message: "ping" | "pong"
}

// Task messages
export type TTaskCreateWebSocketMessage = {
    data: TTask,
    workspace_id: string
}

export type TTaskUpdateWebSocketMessage = {
    data: TTask,
    workspace_id: string
}

export type TTaskArrangedWebSocketMessage = {
    data: TTaskPrimitive,
    taskboard_id: string
}

export type TTaskAssigneeAddedWebSocketMessage = {
    data: TTaskAssignee,
    taskboard_id: string,
    task_id: string
}

export type TTaskAssigneeRemovedWebSocketMessage = {
    data: string,
    taskboard_id: string,
    task_id: string
}

export type TTaskTagAddedWebSocketMessage = {
    data: TTaskTag,
    taskboard_id: string,
    task_id: string
}

export type TTaskTagRemovedWebSocketMessage = {
    data: string,
    taskboard_id: string,
    task_id: string
}

// Task todo messages
export type TTaskTodoTimerHeartbeatWebSocketMesssage = {
    task_id: string,
    workspace_id: string
}

// Taskboard messages
export type TTaskboardDroppedWebSocketMessage = {
    taskboard_id: string,
    workspace_id: string
}

export type TTaskboardDeactivatedWebSocketMessage = {
    taskboard_id: string,
    workspace_id: string
}

export type TTaskboardReactivatedWebSocketMessage = {
    project_id: string
}

// Project messages
export type TProjectCreatedWebSocketMessage = {
    data: TProject,
    workspace_id: string
}

export type TProjectDeactivatedSocketMessage = {
    workspace_id: string,
    project_id: string
}

export type TProjectDroppedSocketMessage = {
    workspace_id: string,
    project_id: string
}

export type TProjectReactivatedSocketMessage = {
    workspace_id: string,
    project_id: string
}

export type TProjectMembersAddedWebSocketMessage = {
    members: TProjectMember[],
    workspace_id: string
}

export type TProjectCustomizationUpdatedWebSocketMessage = {
    data: TProjectPrimitive,
    workspace_id: string
}

export type TProjectMemberRoleUpdatedWebSocketMessage = {
    workspace_id: string,
    project_id: string,
    member_id: string,
    role: EProjectRole
}

export type TProjectMemberDeactivatedWebSocketMessage = {
    workspace_id: string,
    project_id: string,
    member_id: string
}

export type TProjectMemberReactivatedWebSocketMessage = {
    workspace_id: string,
    project_id: string,
    member_id: string
}

// Workspace messages
export type TWorkspaceMemberDeactivatedWebSocketMessage = {
    workspace_id: string,
    member_id: string
}

export type TWorkspaceMemberReactivatedWebSocketMessage = {
    workspace_id: string,
    member_id: string
}
