

// Events coming from the server to client
export enum EWebSocketEventType {

    CHECK_HEALTH = "check_health",

    // Task events
    TASK_CREATED = "task_created",
    TASK_UPDATED = "task_updated",
    TASK_ASSIGNEE_ADDED = "task_assignee_added",
    TASK_ASSIGNEE_REMOVED = "task_assignee_removed",
    TASK_TAG_ADDED = "task_tag_added",
    TASK_TAG_REMOVED = "task_tag_removed",
    TASK_MOVED = "task_moved",
    TASK_ARRANGED = "task_arranged",

    // Taskboard events
    TASKBOARD_DROPPED = "taskboard_dropped",
    TASKBOARD_DEACTIVATED = "taskboard_deactivated",
    TASKBOARD_REACTIVATED = "taskboard_reactivated",

    // Project events
    PROJECT_CREATED = "project_created",
    PROJECT_DROPPED = "project_dropped",
    PROJECT_DEACTIVATED = "project_deactivated",
    PROJECT_REACTIVATED = "project_reactivated",
    PROJECT_MEMBERS_ADDED = "project_members_added",
    PROJECT_CUSTOMIZATION_UPDATED = "project_customization_updated",
    PROJECT_MEMBER_ROLE_UPDATED = "project_member_role_updated",
    PROJECT_MEMBER_DEACTIVATED = "project_member_deactivated",
    PROJECT_MEMBER_REACTIVATED = "project_member_reactivated",

    // Workspace events
    WORKSPACE_MEMBER_DEACTIVATED = "workspace_member_deactivated",
    WORKSPACE_MEMBER_REACTIVATED = "workspace_member_reactivated"

}

// Events coming from the client to server
export enum EWebsocketClientEventType {

    JOIN_WORKSPACE_CHANNEL = "join_workspace_channel",
    LEAVE_WORKSPACE_CHANNEL = "leave_workspace_channel",

    JOIN_PROJECT_CHANNEL = "join_project_channel",
    LEAVE_PROJECT_CHANNEL = "leave_project_channel",

    JOIN_TASKBOARD_CHANNEL = "join_taskboard_channel",
    LEAVE_TASKBOARD_CHANNEL = "leave_taskboard_channel",

    CHECK_HEALTH = "check_health",

    PATH_CHANGE = "path_change",

    // Task Todo events
    TASK_TODO_TIMER_HEARTBEAT = "task_todo_timer_heartbeat"

}