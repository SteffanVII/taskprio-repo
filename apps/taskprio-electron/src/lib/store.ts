import { TElectronStoreType } from "@repo/taskprio-types";
import Store, { Schema } from "electron-store";
import { v4 as uuidv4 } from "uuid"

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
    },
    clientId : {
        type : "string",
        default : uuidv4()
    }
}

export const store = new Store<TElectronStoreType>({
    schema
})