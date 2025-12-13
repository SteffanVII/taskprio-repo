export enum EQueryKeys {

    // Profile
    GET_USER_PROFILE = "get_user_profile",

    // Project
    GET_PROJECT = "get_project",
    GET_PROJECT_PRIMITIVE = "get_project/primitive",
    GET_USER_PROJECTS_BY_WORKSPACE = "get_user_projects_by_workspace",
    GET_PROJECT_INACTIVE_TASKBOARDS = "get_project/get_inactive_taskboards",
    GET_PROJECT_LIST_WITH_USER_ASSIGNED_TASKS = "get_project/get_project_list_with_user_assigned_tasks",

    // Project Tag
    GET_PROJECT_TAGS = "get_project/get_tags",

    // Project Member
    GET_PROJECT_MEMBERS = "get_project/get_members",
    GET_PROJECT_MEMBER = "get_project/get_member",

    // Task
    GET_TASK = "get_task",
    GET_TASK_COMMENTS = "get_task/get_comments",

    // Taskboard
    GET_PROJECT_TASKBOARDS = "get_project/get_taskboards",
    GET_TASKBOARD_TRASH_TASKS = "get_taskboard/get_taskboard_trash_tasks",

    // Taskboard Section
    GET_TASKBOARD_SECTIONS = "get_taskboard/get_sections",

    // Workspace
    GET_USER_WORKSPACE = "get_user_workspace",
    GET_USER_WORKSPACES = "get_user_workspaces",
    GET_WORKSPACE_MEMBER = "get_user_workspace/get_member",
    GET_WORKSPACE_INACTIVE_PROJECTS = "get_user_workspace/get_inactive_projects",

    // Todo
    GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE = "get_tasks_assigned_to_user_by_workspace",
    GET_AVAILABLE_TASKS_BY_PROJECT = "get_available_tasks_by_project",
    GET_USER_TASK_TODO_STATE = "get_user_task_todo_state"
}

const splitQueryKey = ( queryKey : EQueryKeys ) => {
    return queryKey.split( "/" )
}

export const QueryKeys = new Proxy({} as Record<keyof typeof EQueryKeys, { value : string, split : string[] }>, {
    get : ( _, property ) => {
        if ( property in EQueryKeys ) {
            const key = EQueryKeys[ property as keyof typeof EQueryKeys ]
            return {
                value : key,
                split : splitQueryKey( key )
            }
        }
        return undefined
    }
} )