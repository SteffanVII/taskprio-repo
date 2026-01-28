// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from "electron/renderer";
import { generalAPI } from "./general/index";
import { titlebarAPI } from "./titlebar/index";
import { taskTodoAPI } from "./taskTodoOverlay/index";
import { websocketAPI } from "./websocket";

contextBridge.exposeInMainWorld("electronAPI", {
    ...generalAPI,
    ...titlebarAPI,
    ...taskTodoAPI,
    ...websocketAPI
})