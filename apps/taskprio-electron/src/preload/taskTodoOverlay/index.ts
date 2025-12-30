import { TElectronStorePreferencesOverlayLocation } from "@repo/taskprio-types";
import { ipcRenderer } from "electron/renderer";
import { EEvents } from "src/lib/enums.js";

export const taskTodoAPI = {
    makeWindowToTaskTodoOverlayMode : ( fromFocusMode? : boolean ) => ipcRenderer.send( EEvents.MAKE_WINDOW_TO_TASK_TODO_OVERLAY_MODE, fromFocusMode ),
    makeWindowToFullMode : () => ipcRenderer.send( EEvents.MAKE_WINDOW_TO_FULL_MODE ),
    makeWindowToFocusMode : ( fromOverlayMode? : boolean ) => ipcRenderer.send( EEvents.MAKE_WINDOW_TO_TASK_TODO_FOCUS_MODE, fromOverlayMode ),
    changeOverlayScreen : ( screedId : number ) => ipcRenderer.send( EEvents.CHANGE_OVERLAY_SCREEN, screedId ),
    changeOverlayLocation : ( location : TElectronStorePreferencesOverlayLocation ) => ipcRenderer.send( EEvents.CHANGE_OVERLAY_LOCATION, location )
}