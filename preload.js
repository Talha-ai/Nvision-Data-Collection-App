const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  takeScreenshot: () => ipcRenderer.send('take-screenshot'),
  sendScreenshotData: (imageData) => ipcRenderer.send('screenshot-taken', imageData),
  saveTestImages: (imageDataArray) => ipcRenderer.send('save-test-images', imageDataArray),
  onScreenshotSaved: (callback) => {
    ipcRenderer.on('screenshot-saved', (event, filePath) => callback(filePath));
  },
  onTestImagesSaved: (callback) => {
    ipcRenderer.on('test-images-saved', (event, filePaths) => callback(filePaths));
  }
});