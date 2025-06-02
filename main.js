const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    // width: 900,
    // height: 700,
    frame: false,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from Vite dev server
  // In production, load the built index.html
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  setupTray();

  registerShortcut();

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
  });
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

  tray.setToolTip('Nvision AI');
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


ipcMain.on('set-fullscreen', (event, flag) => {
  mainWindow.setFullScreen(flag);
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
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



// function takeScreenshot() {
//   if (mainWindow) {
//     // Tell renderer process to take a screenshot
//     mainWindow.webContents.send('take-screenshot');
//   }
// }

// ipcMain.on('screenshot-taken', (event, imageData) => {
//   const savePath = path.join(app.getPath('pictures'), 'WebcamScreenshots');

//   // Create directory if it doesn't exist
//   if (!fs.existsSync(savePath)) {
//     fs.mkdirSync(savePath, { recursive: true });
//   }

//   // Save the image with timestamp
//   const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
//   const filePath = path.join(savePath, `webcam-${timestamp}.png`);

//   // Remove data URL prefix to get just the base64 data
//   const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

//   fs.writeFile(filePath, base64Data, 'base64', (err) => {
//     if (err) {
//       console.error('Failed to save image:', err);
//     } else {
//       // Notify user through main window
//       if (mainWindow && mainWindow.isVisible()) {
//         mainWindow.webContents.send('screenshot-saved', filePath);
//       } else {
//         // Show notification if window is hidden
//         const notification = {
//           title: 'Webcam Screenshot',
//           body: `Screenshot saved to ${filePath}`
//         };
//         new Notification(notification).show();
//       }
//     }
//   });
// });


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
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadPath = isTestMode ? 'test-images' : 'production-images';
    const timestamp = Date.now();
    const fileName = `${uploadPath}/${ppid}_${patternName}_${timestamp}.png`;

    // Create put command
    const command = new PutObjectCommand({
      Bucket: 'rlogic-images-data',
      Key: fileName,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: 'image/png',
      ACL: 'public-read'
    });

    // Upload to DigitalOcean Spaces
    await s3Client.send(command);

    // Return the URL of the uploaded image
    return `https://rlogic-images-data.blr1.digitaloceanspaces.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to DigitalOcean:', error);
    throw error;
  }
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