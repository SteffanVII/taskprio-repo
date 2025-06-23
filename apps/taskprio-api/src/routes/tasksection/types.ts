
// // Query

// import { TTaskForCardView } from "@repo/taskprio-types"

// export type TGetTaskboardSectionsRequestParams = {
//     task_board_id : string
// }

// // Mutation

// export type TCreateTaskboardSectionRequestBody = {
//     task_board_id : string,
//     task_section_name : string,
// }

// export type TUpdateTaskboardSectionRequestParams = {
//     task_section_id : string
// }

// export type TUpdateTaskboardSectionRequestBody = {
//     task_section_name? : string,
//     display_order? : number
// }

// // Task Section

// export type TTaskSection = {
//     task_section_id : string,
//     task_section_name : string,
//     task_board_id : string,
//     display_order : number,
//     created_at : string   
// }

// export type TTaskSectionWithTasks = TTaskSection & {
//     tasks : TTaskForCardView[]
// }