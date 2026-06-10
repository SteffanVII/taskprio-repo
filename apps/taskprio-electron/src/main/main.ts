import { app, BrowserWindow, screen } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { titlebarMain } from './titlebar';
import { generalMain } from './general';
import { taskTodoOverlayMain } from './taskTodoOverlay';
import "./protocolHandler"
import { websocketMain } from './websocket';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

// Set the custom protocol
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient("taskprio-app", process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient("taskprio-app")
}

export let mainWindow: BrowserWindow;

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

    // mainWindow.webContents.openDevTools()

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
