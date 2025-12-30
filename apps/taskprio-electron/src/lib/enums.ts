

export enum EEvents {

    // Titlebar
    MAXIMIZE_WINDOW = "maximize-window",
    MINIMIZE_WINDOW = "minimize-window",
    UNMAXIMIZE_WINDOW = "unmaximize-window",
    // Titlebar listeners
    CLOSE_WINDOW = "close-window",
    
    // General
    REQUEST_DISPLAY_LIST = "request_display_list",
    REQUEST_APP_PREFERENCES = "request_app_preferences",
    
    // Task todo
    MAKE_WINDOW_TO_TASK_TODO_OVERLAY_MODE = "make-window-to-task-todo-overlay-mode",
    MAKE_WINDOW_TO_FULL_MODE = "make-window-to-full-mode",
    MAKE_WINDOW_TO_TASK_TODO_FOCUS_MODE = "make-window-to-task-todo-focus-mode",
    CHANGE_OVERLAY_SCREEN = "change_overlay_screen",
    CHANGE_OVERLAY_LOCATION = "change_overlay_location"
}

export enum EEventListeners {
    // Titlebar
    WINDOW_MAXIMIZE_STATE_CHANGED = "window-maximize-state-changed",
    
    // General
    CONSOLE_LOG = "console-log",
    GOOGLE_LOGIN_SUCCESS = "google-login-success",
}