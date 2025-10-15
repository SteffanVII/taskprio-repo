// Query

import { Selectable } from "kysely"
import { TTaskForCardView } from "../task/types"
import { TaskboardTaskSection } from "../../db"

export type TGetTaskboardSectionsRequestParams = {
    task_board_id : string
}

// Mutation

export type TCreateTaskboardSectionRequestBody = {
    task_board_id : string,
    task_section_name : string,
    task_section_color? : string
}

export type TUpdateTaskboardSectionRequestParams = {
    task_section_id : string
}

export type TUpdateTaskboardSectionRequestBody = {
    task_section_name? : string,
    display_order? : number,
    task_section_color? : string
}

// Task Section

export type TTaskSection = Selectable<TaskboardTaskSection>

export type TTaskSectionWithTasks = TTaskSection & {
    tasks : TTaskForCardView[]
}