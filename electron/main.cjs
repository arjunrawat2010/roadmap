// Electron main process: opens the built Vite app (dist/) in a desktop window.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win = null;

function isExternal(url) {
  return /^https?:\/\//i.test(url);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 400,
    minHeight: 600,
    show: false,
    backgroundColor: '#F0F0F0',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  win.once('ready-to-show', () => win.show());

  // Resource links and "Open repo" open in the default browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternal(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (isExternal(url)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(() => {
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
