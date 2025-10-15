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

// Taskboard

export type TTaskboard = Selectable<TaskboardTaskBoard>