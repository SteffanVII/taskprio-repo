
export type TElectronStoreType = {
    preferences : TElectronStorePreferencesType,
    lastFullModeWindowState : TElectronStoreLastFullWindowState,
    lastFocusModeWindowState : TElectronStoreLastFocusModeWindowState,
    clientId : string
}

export type TElectronStorePreferencesType = {
    overlay : TElectronStorePreferencesOverlay
}

export type TElectronStorePreferencesOverlay = {
    screen : TElectronStorePreferencesOverlayScreen,
    location : TElectronStorePreferencesOverlayLocation
}

export type TElectronStorePreferencesOverlayScreen = {
    id : number
}

export type TElectronStorePreferencesOverlayLocation = "top-left" | "top-right" | "bottom-left" | "bottom-right"

export type TElectronStoreLastFullWindowState = {
    width : number,
    height : number,
    x : number,
    y : number,
    screedId : number
}

export type TElectronStoreLastFocusModeWindowState = {
    x : number,
    y : number,
    screenId : number
}

export type TDisplay = {
    id : number,
    name : string,
    orientation : number
}