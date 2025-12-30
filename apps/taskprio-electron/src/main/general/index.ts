import { TElectronStorePreferencesType } from "@repo/taskprio-types"
import { ipcMain, screen } from "electron"
import { EEvents } from "src/lib/enums.js"
import { store } from "src/lib/store.js"

export const generalMain = () => {

    ipcMain.handle( EEvents.REQUEST_DISPLAY_LIST, () => {
        const displays = screen.getAllDisplays()
        return displays.map( display => ({
            id : display.id,
            name : display.label,
            orientation : display.rotation
        }) )
    } )

    ipcMain.handle( EEvents.REQUEST_APP_PREFERENCES, async () : Promise<TElectronStorePreferencesType> => {
        return store.get( "preferences" )
    } )

}