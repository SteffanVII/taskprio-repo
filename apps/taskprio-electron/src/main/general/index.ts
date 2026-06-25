import { TElectronStorePreferencesType } from "@repo/taskprio-types"
import { ipcMain, screen, shell } from "electron"
import { EEvents } from "src/lib/enums.js"
import { store } from "src/lib/store.js"
import { PKCE } from "../main"

export const generalMain = () => {

  ipcMain.handle(EEvents.REQUEST_DISPLAY_LIST, () => {
    const displays = screen.getAllDisplays()
    return displays.map(display => ({
      id: display.id,
      name: display.label,
      orientation: display.rotation
    }))
  })

  ipcMain.handle(EEvents.REQUEST_APP_PREFERENCES, async (): Promise<TElectronStorePreferencesType> => {
    return store.get("preferences")
  })

  ipcMain.handle(EEvents.OPEN_EXTERNAL_BROWSER, (_, url: string) => {
    console.log(url)
    shell.openExternal(url)
  })

  ipcMain.handle(EEvents.GET_PKCE, (): { verifier : string, challenge : string } => {
    console.log(PKCE);
    return PKCE;
  })

}