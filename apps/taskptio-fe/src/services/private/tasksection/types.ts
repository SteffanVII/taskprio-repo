import { TTaskForCardView } from "../task/types"

// Query

export type TGetTaskboardSectionsPayload = {
    pathParameter : {
        task_board_id? : string
    },
    pathQuery : {
        include_tasks? : boolean
    }
}

export type TGetTaskboardSectionsResponse = ( TTaskSectionWithTasks | TTaskSection )[]

// Mutation

export type TCreateTaskboardSectionPayload = {
    body : {
        task_board_id : string,
        task_section_name : string,
    }
}

export type TCreateTaskboardSectionResponse = TTaskSection;

export type TCreateTaskboardSectionBody = {
    task_board_id : string,
    task_section_name : string,
}

export type TUpdateTaskboardSectionPayload = {
    task_section_id : string,
    body : TUpdateTaskboardSectionPayloadBody
}

export type TUpdateTaskboardSectionPayloadBody = {
    task_section_name? : string,
    display_order? : number
}

// Task section

export type TTaskSection = {
    task_section_id : string,
    task_section_name : string,
    task_board_id : string,
    display_order : number,
    created_at : string   
}

export type TTaskSectionWithTasks = TTaskSection & {
    tasks : TTaskForCardView[]
}