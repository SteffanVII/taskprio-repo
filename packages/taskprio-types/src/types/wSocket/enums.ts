

// Events coming from the server to client
export enum EWebSocketEventType {
    
    // Task events
    TASK_CREATED = "task_created",
    TASK_UPDATED = "task_updated",
    TASK_TIME_LOGGED = "task_time_logged",
    TASK_TIME_LOG_REMOVED = "task_time_log_removed",
    TASK_ASSIGNEE_ADDED = "task_assignee_added",
    TASK_ASSIGNEE_REMOVED = "task_assignee_removed",
    TASK_MOVED = "task_moved",
    TASK_ARRANGED = "task_arranged",

    // Taskboard events
    TASKBOARD_DROPPED = "taskboard_dropped",
    TASKBOARD_DEACTIVATED = "taskboard_deactivated",
    TASKBOARD_REACTIVATED = "taskboard_reactivated",

    // Project events
    PROJECT_DROPPED = "project_dropped",
    PROJECT_DEACTIVATED = "project_deactivated",
    PROJECT_REACTIVATED = "project_reactivated"

}

// Events coming from the client to server
export enum EWebsocketClientEventType {
    PATH_CHANGE = "path_change",

    // Task Todo events
    TASK_TODO_TIMER_HEARTBEAT = "task_todo_timer_heartbeat"

}