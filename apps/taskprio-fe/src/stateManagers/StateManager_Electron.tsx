import { useGoogleLoginT } from "@/services/authentication";
import { updateDialogsStore } from "@/stores/dialogs";
import { updateElectronStore, useElectronStore_preferences } from "@/stores/electron";
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { ETaskTodoPageUIMode, updateTaskTodoPageStore } from "@/stores/taskTodoPage";
import { TElectronStorePreferencesOverlayLocation } from "@repo/taskprio-types/src";
import React, { createContext, useLayoutEffect } from "react";
import { useNavigate } from "react-router";

type TStateManager_ElectronProps = {
    children: React.ReactNode
}

type TStateManager_ElectronContext = {
    switchToOverlayModeFromFullMode: () => void,
    switchToOverlayModeFromFocusMode: () => void,
    switchToFocusModeFromFullMode: () => void,
    switchToFocusModeFromOverlayMode: () => void,
    switchToFullModeFromOverlayOrFocusMode: () => void,
    switchOverlayLocation: (location: TElectronStorePreferencesOverlayLocation) => void
}

export const StateManager_ElectronContext = createContext<TStateManager_ElectronContext>({
    switchToOverlayModeFromFullMode: () => { },
    switchToOverlayModeFromFocusMode: () => { },
    switchToFocusModeFromFullMode: () => { },
    switchToFocusModeFromOverlayMode: () => { },
    switchToFullModeFromOverlayOrFocusMode: () => { },
    switchOverlayLocation: () => { }
})

const StateManager_Electron: React.FC<TStateManager_ElectronProps> = ({ children }) => {

    const navigate = useNavigate()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const preferences = useElectronStore_preferences()

    const {
        mutateAsync: googleLoginT,
    } = useGoogleLoginT(() => {
        navigate("/p/w")
    })

    const setDisplays = async () => {
        const displays = await window.electronAPI.requestDisplayList()
        updateElectronStore({
            displays
        })
    }

    const getAppPreferences = async () => {
        const value = await window.electronAPI.requestAppPreferences()
        updateElectronStore({
            preferences: value ?? null
        })
    }

    useLayoutEffect(() => {
        if (!!window.electronAPI) {
            updateElectronStore({
                isElectron: !!window.electronAPI
            })
            window.electronAPI.onWindowMaximizeStateChange((value) => {
                updateElectronStore({
                    windowMaximize: value
                })
            })
            window.electronAPI.onGoogleLoginSuccess((credential, clientId) => {
                googleLoginT({
                    clientId: clientId,
                    credential: credential
                })
            })
            window.electronAPI.onAcceptInvitation((inviteToken) => {
                if (inviteToken) {
                    updateDialogsStore({
                        acceptInvitationDialog: {
                            open: true,
                            token: inviteToken
                        }
                    })
                }
            })
            window.electronAPI.onConsoleLog((value) => {
                console.log(value)
            })
            setDisplays()
            getAppPreferences()
        }
    }, [])

    const switchToOverlayModeFromFullMode = () => {
        if (!!window.electronAPI) {
            navigate(`/p/task_todo_overlay/${selectedWorkspace?.workspace_id}`)
            updateTaskTodoPageStore({
                uIMode: ETaskTodoPageUIMode.OVERLAY
            })
            window.electronAPI.makeWindowToTaskTodoOverlayMode()
        }
    }

    const switchToOverlayModeFromFocusMode = () => {
        if (!!window.electronAPI) {
            updateTaskTodoPageStore({
                uIMode: ETaskTodoPageUIMode.OVERLAY
            })
            window.electronAPI.makeWindowToTaskTodoOverlayMode(true)
        }
    }

    const switchToFocusModeFromFullMode = () => {
        if (!!window.electronAPI) {
            navigate(`/p/task_todo_overlay/${selectedWorkspace?.workspace_id}`)
            updateTaskTodoPageStore({
                uIMode: ETaskTodoPageUIMode.WIDGET
            })
            window.electronAPI.makeWindowToFocusMode()
        }
    }

    const switchToFocusModeFromOverlayMode = () => {
        if (!!window.electronAPI) {
            updateTaskTodoPageStore({
                uIMode: ETaskTodoPageUIMode.WIDGET
            })
            window.electronAPI.makeWindowToFocusMode(true)
        }
    }

    const switchToFullModeFromOverlayOrFocusMode = () => {
        if (!!window.electronAPI) {
            updateTaskTodoPageStore({
                uIMode: ETaskTodoPageUIMode.FULL
            })
            window.electronAPI.makeWindowToFullMode()
            setTimeout(() => {
                navigate(-1)
            }, 100)
        }
    }

    const switchOverlayLocation = (location: TElectronStorePreferencesOverlayLocation) => {
        if (!!window.electronAPI) {
            window.electronAPI.changeOverlayLocation(location)
            updateElectronStore({
                preferences: {
                    ...preferences,
                    overlay: {
                        ...preferences?.overlay,
                        location: location
                    }
                }
            })
        }
    }

    return <StateManager_ElectronContext.Provider
        value={{
            switchToOverlayModeFromFullMode,
            switchToOverlayModeFromFocusMode,
            switchToFocusModeFromFullMode,
            switchToFocusModeFromOverlayMode,
            switchToFullModeFromOverlayOrFocusMode,
            switchOverlayLocation
        }}
    >{children}</StateManager_ElectronContext.Provider>;

}

export default StateManager_Electron;