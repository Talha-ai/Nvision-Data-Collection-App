const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const { STAGING_URL, PRODUCTION_URL } = require('./constants')
let mainWindow;
let tray = null;
let isProductionMode = true;

const PRODUCTION_URL = 'https://nvision.alemeno.com';
const STAGING_URL = 'https://nvision-staging.alemeno.com';

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  setupTray();
  registerShortcuts();

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
  });

  // mainWindow.on('minimize', (event) => {
  //   event.preventDefault();
  //   mainWindow.hide();
  // });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  const iconPath = app.isPackaged
    ? path.join(__dirname, 'src/assets/nvision_logo.png')
    : path.join(__dirname, 'src/assets/nvision_logo.png');

  tray = new Tray(iconPath);

  updateTrayMenu();
  tray.setToolTip('Nvision AI');

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function updateTrayMenu() {
  if (!tray) return;

  const currentEnv = getCurrentEnvironment();
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      }
    },
    {
      label: `Mode: ${currentEnv.environment}`,
      click: () => toggleEnvironment()
    },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function registerShortcuts() {
  const envToggleShortcut = globalShortcut.register('CommandOrControl+Alt+P', () => {
    toggleEnvironment();
  });

  if (!envToggleShortcut) {
    console.log('Environment toggle shortcut registration failed');
  } else {
    console.log('Environment toggle shortcut registered: Ctrl+Alt+P');
  }
}

function getCurrentEnvironment() {
  return {
    isProduction: isProductionMode,
    baseUrl: isProductionMode ? PRODUCTION_URL : STAGING_URL,
    environment: isProductionMode ? 'Production' : 'Staging'
  };
}

function toggleEnvironment() {
  isProductionMode = !isProductionMode;
  const currentEnv = getCurrentEnvironment();

  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('environment-changed', currentEnv);
  }

  updateTrayMenu();

  // Show notification
  try {
    const notification = new Notification({
      title: 'Environment Switched',
      body: `Now using ${currentEnv.environment} environment\n${currentEnv.baseUrl}`
    });
    notification.show();
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

// IPC Handlers
ipcMain.on('toggle-environment', () => {
  toggleEnvironment();
});

ipcMain.handle('get-current-environment', () => {
  return getCurrentEnvironment();
});

ipcMain.on('set-fullscreen', (event, flag) => {
  mainWindow?.setFullScreen(flag);
});

ipcMain.on('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow?.close();
});

// Handle test image saving
ipcMain.on('save-test-images', (event, imageDataArray) => {
  const savePath = path.join(app.getPath('pictures'), 'NvisionTestData');

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  const sessionId = Date.now();
  const sessionPath = path.join(savePath, `session-${sessionId}`);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const savedPaths = [];
  imageDataArray.forEach((imageData, index) => {
    const filePath = path.join(sessionPath, `image-${index + 1}.png`);
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    savedPaths.push(filePath);
  });

  event.reply('test-images-saved', savedPaths);
});

// S3 Configuration
const s3Client = new S3Client({
  endpoint: 'https://blr1.digitaloceanspaces.com',
  region: 'blr1',
  credentials: {
    accessKeyId: 'DO801GNGMDNYAUGC8JYG',
    secretAccessKey: 'AtFgGOnOMcmtOg/3gky6XXyYXzneOZ3H89e3wclzFaw'
  }
});

ipcMain.handle('upload-image', async (event, { imageData, ppid, patternName, isTestMode }) => {
  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadPath = isTestMode ? 'test-images' : 'production-images';
    const timestamp = Date.now();
    const fileName = `${uploadPath}/${ppid}_${patternName}_${timestamp}.png`;

    const command = new PutObjectCommand({
      Bucket: 'rlogic-images-data',
      Key: fileName,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: 'image/png',
      ACL: 'public-read'
    });

    await s3Client.send(command);
    return `https://rlogic-images-data.blr1.digitaloceanspaces.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to DigitalOcean:', error);
    throw error;
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});