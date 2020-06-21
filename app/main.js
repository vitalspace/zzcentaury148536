const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

require('../servidor/src/index')

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      center: true,
      show: false,
      webPreferences: {
          nodeIntegration: true,
      },
  });

  mainWindow.loadURL(url.format({
      pathname: 'localhost:4000',
      protocol: 'http:',
      slashes: true,
      nodeIntegration: false
  }));

  mainWindow.on('closed', function() {
      mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
      mainWindow.show()
      autoUpdater.checkForUpdatesAndNotify();
  });

}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});