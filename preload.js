const { contextBridge, ipcRenderer } = require('electron');

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

  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});