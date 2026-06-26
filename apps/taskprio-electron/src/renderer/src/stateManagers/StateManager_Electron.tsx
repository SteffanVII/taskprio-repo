import { useGoogleLoginT } from "@/services/authentication";
import { useElectronStore, useElectronStore_preferences } from "@/stores/electron";
import { ETaskTodoPageUIMode, useTaskTodoPageStore } from "@/stores/taskTodoPage";
import { TElectronStorePreferencesOverlayLocation } from "@repo/taskprio-types";
import React, { createContext, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDialogsStore } from "@/stores/dialogs";

type TStateManager_ElectronProps = {
  children: React.ReactNode
}

type TStateManager_ElectronContext = {
  switchToOverlayModeFromFullMode: () => void,
  switchToOverlayModeFromFocusMode: () => void,
  switchToFocusModeFromFullMode: () => void,
  switchToFocusModeFromOverlayMode: () => void,
  switchToFullModeFromOverlayOrFocusMode: () => void,
  switchOverlayLocation: (location: TElectronStorePreferencesOverlayLocation) => void,
  openExternalBrowser: (url: string) => void,
  getPKCE: () => Promise<{ verifier : string, challenge : string }>
}

export const StateManager_ElectronContext = createContext<TStateManager_ElectronContext>({
  switchToOverlayModeFromFullMode: () => { },
  switchToOverlayModeFromFocusMode: () => { },
  switchToFocusModeFromFullMode: () => { },
  switchToFocusModeFromOverlayMode: () => { },
  switchToFullModeFromOverlayOrFocusMode: () => { },
  switchOverlayLocation: () => { },
  openExternalBrowser: () => { },
  getPKCE: async () => { return { verifier: "", challenge: "" } }
})

const StateManager_Electron: React.FC<TStateManager_ElectronProps> = ({ children }) => {

  const navigate = useNavigate()

  // const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
  const preferences = useElectronStore_preferences()
  const _setDisplays = useElectronStore(state => state.setDisplays)
  const setPreferences = useElectronStore(state => state.setPreferences)
  const setIsElectron = useElectronStore(state => state.setIsElectron);
  const setWindowMaximaize = useElectronStore(state => state.setWindowMaximize);
  const setAcceptInvitationDialog = useDialogsStore(state => state.setAcceptInvitationDialog)
  const setUIMode = useTaskTodoPageStore(state => state.setUIMode)

  const {
    mutateAsync: googleLoginT,
  } = useGoogleLoginT(() => {
    navigate({ to: "/workspace" })
  })

  const setDisplays = async () => {
    const displays = await window.electronAPI.requestDisplayList()
    _setDisplays(displays)
  }

  const getAppPreferences = async () => {
    const value = await window.electronAPI.requestAppPreferences()
    setPreferences(value ?? null)
  }

  // Listeners for events coming from electron main
  useEffect(() => {
    if (!!window.electronAPI) {
      setIsElectron(!!window.electronAPI)
      window.electronAPI.onWindowMaximizeStateChange((value) => {
        setWindowMaximaize(value);
      })
      window.electronAPI.onGoogleLoginSuccess((code, verifier) => {
        googleLoginT({
          code: code,
          verifier: verifier
        })
      })
      window.electronAPI.onAcceptInvitation((inviteToken) => {
        if (inviteToken) {
          setAcceptInvitationDialog(inviteToken, true)
        }
      })
      window.electronAPI.onConsoleLog((value) => {
        console.log(value)
      })
      setDisplays()
      getAppPreferences()
      console.log("Electron listeners added")
    }
  }, [])

  const switchToOverlayModeFromFullMode = () => {
    if (!!window.electronAPI) {
      // navigate(`/p/task_todo_overlay/${selectedWorkspace?.workspace_id}`)
      setUIMode(ETaskTodoPageUIMode.OVERLAY)
      window.electronAPI.makeWindowToTaskTodoOverlayMode()
    }
  }

  const switchToOverlayModeFromFocusMode = () => {
    if (!!window.electronAPI) {
      setUIMode(ETaskTodoPageUIMode.OVERLAY)
      window.electronAPI.makeWindowToTaskTodoOverlayMode(true)
    }
  }

  const switchToFocusModeFromFullMode = () => {
    if (!!window.electronAPI) {
      // navigate(`/p/task_todo_overlay/${selectedWorkspace?.workspace_id}`)
      setUIMode(ETaskTodoPageUIMode.WIDGET)
      window.electronAPI.makeWindowToFocusMode()
    }
  }

  const switchToFocusModeFromOverlayMode = () => {
    if (!!window.electronAPI) {
      setUIMode(ETaskTodoPageUIMode.WIDGET)
      window.electronAPI.makeWindowToFocusMode(true)
    }
  }

  const switchToFullModeFromOverlayOrFocusMode = () => {
    if (!!window.electronAPI) {
      setUIMode(ETaskTodoPageUIMode.FULL)
      window.electronAPI.makeWindowToFullMode()
      setTimeout(() => {
        // navigate(-1)
      }, 100)
    }
  }

  const switchOverlayLocation = (location: TElectronStorePreferencesOverlayLocation) => {
    if (!!window.electronAPI) {
      window.electronAPI.changeOverlayLocation(location)
      setPreferences({
        ...preferences,
        overlay: {
          ...preferences?.overlay,
          location: location
        }
      })
    }
  }

  const openExternalBrowser = (url: string) => {
    if (!!window.electronAPI) {
      window.electronAPI.openExternalBrowser(url)
    }
  }

  const getPKCE = async () => {
    if (!!window.electronAPI) {
      return await window.electronAPI.getPKCE()
    }
    return { verifier: "", challenge: "" }
  }

  return <StateManager_ElectronContext.Provider
    value={{
      switchToOverlayModeFromFullMode,
      switchToOverlayModeFromFocusMode,
      switchToFocusModeFromFullMode,
      switchToFocusModeFromOverlayMode,
      switchToFullModeFromOverlayOrFocusMode,
      switchOverlayLocation,
      openExternalBrowser,
      getPKCE
    }}
  >{children}</StateManager_ElectronContext.Provider>;

}

export default StateManager_Electron;