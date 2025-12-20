import { ipcRenderer } from "electron/renderer";
import { EEvents } from "src/lib/enums";

export const taskTodoAPI = {
    makeWindowToTaskTodoOverlayMode : () => ipcRenderer.send( EEvents.MAKE_WINDOW_TO_TASK_TODO_OVERLAY_MODE ),
    makeWindowToFullMode : () => ipcRenderer.send( EEvents.MAKE_WINDOW_TO_FULL_MODE ),
    makeWindowToFocusMode : () => ipcRenderer.send( EEvents.MAKE_WINDOW_TO_TASK_TODO_FOCUS_MODE )
}