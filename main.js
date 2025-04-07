const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from Vite dev server
  // In production, load the built index.html
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  setupTray();

  registerShortcut();

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  tray = new Tray(path.join(__dirname, 'assets/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Take Screenshot',
      click: () => {
        takeScreenshot();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Nvision Data Collection App');
  tray.setContextMenu(contextMenu);

  // Show window on tray icon click
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

function registerShortcut() {
  // Register a global shortcut: Ctrl+Alt+W
  const shortcutRegistered = globalShortcut.register('CommandOrControl+Alt+W', () => {
    takeScreenshot();
  });

  if (!shortcutRegistered) {
    console.log('Shortcut registration failed');
  }
}

function takeScreenshot() {
  if (mainWindow) {
    // Tell renderer process to take a screenshot
    mainWindow.webContents.send('take-screenshot');
  }
}

// Handle saving the screenshot image
ipcMain.on('screenshot-taken', (event, imageData) => {
  const savePath = path.join(app.getPath('pictures'), 'WebcamScreenshots');

  // Create directory if it doesn't exist
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  // Save the image with timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const filePath = path.join(savePath, `webcam-${timestamp}.png`);

  // Remove data URL prefix to get just the base64 data
  const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Failed to save image:', err);
    } else {
      // Notify user through main window
      if (mainWindow && mainWindow.isVisible()) {
        mainWindow.webContents.send('screenshot-saved', filePath);
      } else {
        // Show notification if window is hidden
        const notification = {
          title: 'Webcam Screenshot',
          body: `Screenshot saved to ${filePath}`
        };
        new Notification(notification).show();
      }
    }
  });
});

// Handle capturing images for testing
ipcMain.on('save-test-images', (event, imageDataArray) => {
  const savePath = path.join(app.getPath('pictures'), 'NvisionTestData');

  // Create directory if it doesn't exist
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  // Generate a unique test session ID
  const sessionId = Date.now();
  const sessionPath = path.join(savePath, `session-${sessionId}`);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  // Save each image
  const savedPaths = [];
  imageDataArray.forEach((imageData, index) => {
    const filePath = path.join(sessionPath, `image-${index + 1}.png`);

    // Remove data URL prefix to get just the base64 data
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    fs.writeFileSync(filePath, base64Data, 'base64');
    savedPaths.push(filePath);
  });

  // Send back the saved file paths
  event.reply('test-images-saved', savedPaths);
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Unregister shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});