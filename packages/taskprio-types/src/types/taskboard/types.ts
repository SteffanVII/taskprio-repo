import { Selectable } from "kysely";
import { TaskboardTaskBoard } from "../../db";
import { TTaskPrimitive } from "../task/types";

export type TGetProjectTaskboardListRequestQuery = {
    project_id : string
}

export type TGetTaskboardTrashTasksRequestParams = {
    taskboard_id : string
}

export type TGetTaskboardTrashTasksResponseData = TTaskPrimitive[]

export type TCreateTaskboardRequestBody = {
    project_id : string,
    taskboard_name : string
}

export type TDeactivateTaskboardRequestBody = {
    taskboard_id : string,
    project_id : string
}

export type TReactivateTaskboardRequestBody = {
    taskboard_id : string,
    project_id : string
}

export type TDropTaskboardRequestQuery = {
    taskboard_id : string,
    project_id : string,
    taskboard_name_confirmation : string
}

export type TGetProjectInactiveTaskboardsRequestQuery = {
    project_id : string
}

export type TGetProjectInactiveTaskboardsResponseData = TTaskboardInactiveForTable[]

// Taskboard

export type TTaskboard = Selectable<TaskboardTaskBoard>

export type TTaskboardInactiveForTable = TTaskboard & {
    sections : number,
    tasks : number
}