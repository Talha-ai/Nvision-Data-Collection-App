const { contextBridge, ipcRenderer } = require('electron');
const path = require('path'); // Missing this import
const fs = require('fs'); // Missing this import

// Rest of your preload.js code
contextBridge.exposeInMainWorld('electronAPI', {
  enableFullScreen: () => ipcRenderer.send('set-fullscreen', true),
  disableFullScreen: () => ipcRenderer.send('set-fullscreen', false),
  takeScreenshot: () => ipcRenderer.send('take-screenshot'),
  sendScreenshotData: (imageData) => ipcRenderer.send('screenshot-taken', imageData),
  saveTestImages: (imageDataArray) => ipcRenderer.send('save-test-images', imageDataArray),
  onScreenshotSaved: (callback) => {
    ipcRenderer.on('screenshot-saved', (event, filePath) => callback(filePath));
  },
  onTestImagesSaved: (callback) => {
    ipcRenderer.on('test-images-saved', (event, filePaths) => callback(filePaths));
  },
  getAssetPath: (assetName) => ipcRenderer.invoke('get-asset-path', assetName),


  // Optional: Add a method to load image as data URL if needed
  // In preload.js
  loadImageAsDataURL: (imageName) => {
    try {
      const isDev = !process.execPath.includes('node_modules');
      let imagePath;

      if (isDev) {
        imagePath = path.join(__dirname, '..', 'public', 'test-patterns', imageName);
      } else {
        imagePath = path.join(process.resourcesPath, 'test-patterns', imageName);
      }

      const imageBuffer = fs.readFileSync(imagePath);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error loading image:', error);
      // Return a placeholder or error image
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5zAMMkgAAAABJRU5ErkJggg==';
    }
  }

});