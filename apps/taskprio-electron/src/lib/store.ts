import { TElectronStoreType } from "@repo/taskprio-types";
import Store, { Schema } from "electron-store";

const schema : Schema<TElectronStoreType> = {
    preferences : {
        type : "object",
        properties : {
            screen : {
                type : "object",
                properties : {
                    id : {
                        type : "number"
                    }
                }
            }
        }
    },
    lastFullModeWindowState : {
        type : "object",
        properties : {
            width : { type : "number" },
            height : { type : "number" },
            x : { type : "number" },
            y : { type : "number" },
            screenId : { type : "number" }
        }
    },
    lastFocusModeWindowState : {
        type : "object",
        properties : {
            x : { type : "number" },
            y : { type : "number" },
            screenId : { type : "number" },
        }
    }
}

export const store = new Store<TElectronStoreType>({
    schema
})