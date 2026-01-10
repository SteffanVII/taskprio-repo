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
            handler(urlString)
        }
    })
}

app.on("open-url", (_, url) => {
    if (mainWindow)
        if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    const urlString = url
    mainWindow.webContents.send(EEventListeners.CONSOLE_LOG, urlString)
    handler(urlString)
})

const handler = (url: string) => {

    if (url.includes("taskprio-app://googlelogin")) {
        const urlObj = new URL(url)
        const searchParams = urlObj.searchParams
        const proofKey = searchParams.get("proof_key")
        const clientId = searchParams.get("client_id")
        mainWindow.webContents.send(EEventListeners.GOOGLE_LOGIN_SUCCESS, proofKey, clientId)
    }

    if (url.includes("taskprio-app://accept_invitation")) {
        const urlObj = new URL(url)
        const searchParams = urlObj.searchParams
        const inviteToken = searchParams.get("invite_token")
        mainWindow.webContents.send(EEventListeners.ACCEPT_INVITATION, inviteToken)
    }

}