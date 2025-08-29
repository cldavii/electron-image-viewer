const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('windowControls.minimize'),
    maximizeRestore: () => ipcRenderer.send('windowControls.maximizeRestore'),
    close: () => ipcRenderer.send('windowControls.close'),
    openImage: () => ipcRenderer.invoke('windowControls.openImage'),
    onImageData: (callback) => ipcRenderer.on('image-data', (event, image) => callback(image))
});