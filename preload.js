const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // takeScreenshot: () => ipcRenderer.send('take-screenshot'),
  // sendScreenshotData: (imageData) => ipcRenderer.send('screenshot-taken', imageData),
  // onScreenshotSaved: (callback) => {
  //   ipcRenderer.on('screenshot-saved', (event, filePath) => callback(filePath));
  // },

  saveTestImages: (imageDataArray) => ipcRenderer.send('save-test-images', imageDataArray),
  onTestImagesSaved: (callback) => {
    ipcRenderer.on('test-images-saved', (event, filePaths) => callback(filePaths));
  },
  uploadImage: (data) => ipcRenderer.invoke('upload-image', data),


  enableFullScreen: () => ipcRenderer.send('set-fullscreen', true),
  disableFullScreen: () => ipcRenderer.send('set-fullscreen', false),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});