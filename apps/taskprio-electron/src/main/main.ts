import { app, BrowserWindow, screen } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { titlebarMain } from './titlebar';
import { generalMain } from './general';
import { taskTodoOverlayMain } from './taskTodoOverlay';
import { websocketMain } from './websocket';
import { generatePKCE } from './general/googleAuthPKCE';
import { EEventListeners } from 'src/lib/enums';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

export let mainWindow: BrowserWindow;

export const PKCE = generatePKCE()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

if (app.isPackaged) {
  const devPath = path.join(app.getPath("appData"), "taskprio-electron-dev")
  app.setPath("userData", devPath)
}

// Set the custom protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("taskprio-app", process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient("taskprio-app")
}

const createWindow = () => {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: width - 40,
    height: height - 40,
    titleBarStyle: "default",
    // ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../dist/renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.setPosition(20, 20)

  mainWindow.webContents.openDevTools()

  return mainWindow
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  mainWindow = createWindow()
  titlebarMain()
  generalMain()
  taskTodoOverlayMain()
  websocketMain()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
    titlebarMain()
    generalMain()
    taskTodoOverlayMain()
    websocketMain()
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", (_, commandLine) => {
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
    const code = searchParams.get("code")
    console.log(PKCE)
    mainWindow.webContents.send(EEventListeners.GOOGLE_LOGIN_SUCCESS, code, PKCE.verifier)
  }

  if (url.includes("taskprio-app://accept_invitation")) {
    const urlObj = new URL(url)
    const searchParams = urlObj.searchParams
    const inviteToken = searchParams.get("invite_token")
    mainWindow.webContents.send(EEventListeners.ACCEPT_INVITATION, inviteToken)
  }

}