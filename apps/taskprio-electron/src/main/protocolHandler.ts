import { app } from "electron"
import { mainWindow } from "./main"
import { EEventListeners } from "src/lib/enums"

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on("second-instance", (_, commandLine, _workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
            const urlString = commandLine.pop()
            mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, urlString)
            mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, urlString.includes("taskprio-app://googlelogin"))
            if (urlString.includes("taskprio-app://googlelogin")) {
                const url = new URL(urlString)
                const searchParams = url.searchParams
                const credential = searchParams.get("credential")
                const clientId = searchParams.get("clientId")
                mainWindow.webContents.send(EEventListeners.GOOGLE_LOGIN_SUCCESS, credential, clientId)
            }
        }
    })
}

app.on("open-url", (_, url) => {
    if (mainWindow)
        if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    const urlString = url
    mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, urlString)
    mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, urlString.includes("taskprio-app://googlelogin"))
    if (urlString.includes("taskprio-app://googlelogin")) {
        const url = new URL(urlString)
        const searchParams = url.searchParams
        const credential = searchParams.get("credential")
        const clientId = searchParams.get("clientId")
        mainWindow.webContents.send(EEventListeners.GOOGLE_LOGIN_SUCCESS, credential, clientId)
    }
})