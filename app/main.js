const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

require('../servidor/src/index')


// ========== [ Set Icon ] ========== //
const nativeImage = require('electron').nativeImage;
let image = nativeImage.createFromPath(path.join(__dirname, '../servidor/src/public/icon/icon.png')); 

image.setTemplateImage(true);


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      center: true,
      icon: image, 
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
      mainWindow.setMenuBarVisibility(false)
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