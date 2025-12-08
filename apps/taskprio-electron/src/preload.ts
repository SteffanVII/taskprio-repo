// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from "electron/renderer";
import { titlebarAPI } from "./preloadAPIs/titlebar";

contextBridge.exposeInMainWorld( "electronAPI", {
    ...titlebarAPI
} )