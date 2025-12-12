import { app, BrowserWindow, dialog, ipcMain, ipcRenderer } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { titlebarMain } from './titlebar';
import { EEvents } from 'src/lib/enums';
import { URL } from 'node:url';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Set the custom protocol
if ( process.defaultApp ) {
  if ( process.argv.length >= 2 ) {
    app.setAsDefaultProtocolClient( "taskprio-app", process.execPath, [ path.resolve(process.argv[1]) ]  )
  }
} else {
  app.setAsDefaultProtocolClient( "taskprio-app" )
}

export let mainWindow : BrowserWindow;

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar : true,
    titleBarStyle : "hidden",
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

    // mainWindow.webContents.openDevTools()
    mainWindow.maximize()

    return mainWindow
};

const gotTheLock = app.requestSingleInstanceLock()

if ( !gotTheLock ) {
    app.quit()
} else {
    app.on( "second-instance", ( _, commandLine, _workingDirectory ) => {
        if ( mainWindow ) {
        if ( mainWindow.isMinimized() ) mainWindow.restore()
            mainWindow.focus()
            const urlString = commandLine.pop()
            mainWindow.webContents.send( EEvents.CONSOLE_LOG, urlString )
            mainWindow.webContents.send( EEvents.CONSOLE_LOG, urlString.includes("taskprio-app://googlelogin") )
            if ( urlString.includes("taskprio-app://googlelogin") ) {
                const url = new URL(urlString)
                const searchParams = url.searchParams
                const credential = searchParams.get("credential")
                const clientId = searchParams.get("clientId")
                mainWindow.webContents.send( EEvents.GOOGLE_LOGIN_SUCCESS, credential, clientId )
            }
        }
        // dialog.showErrorBox('Welcome back', `You arrived from ${commandLine.pop()}`)
    } )
}

app.on( "open-url", (_, url) => {
    if ( mainWindow ) {

    }
  // dialog.showErrorBox( 'Welcome Back', `You arrived from: ${url}` )
} )

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    mainWindow = createWindow()
    titlebarMain()
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
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
