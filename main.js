const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { imageSizeFromFile } = require('image-size/fromFile')
const windowStateKeeper = require('electron-window-state');

let mainWindow;
let previewWindow;
let currentImage;

const createWindow = () => {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600,
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindowState.manage(mainWindow);

    mainWindow.loadFile(path.join(__dirname, 'pages', 'index.html'));
};

const createPreviewWindow = () => {
    if (previewWindow) return;

    previewWindow = new BrowserWindow({
        width: 250,
        height: 250,
        parent: mainWindow,
        show: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    previewWindow.loadFile(path.join(__dirname, 'pages', 'about.html'));

    previewWindow.on('closed', () => {
        previewWindow = null;
    });

    if (currentImage) {
        previewWindow.webContents.on('did-finish-load', () => {
            previewWindow.webContents.send('image-data', currentImage);
        });
    }

    previewWindow.show();
};

const registerShortcuts = () => {
    globalShortcut.register('Ctrl+Alt+Left', () => {
        const display = require('electron').screen.getPrimaryDisplay();
        mainWindow.setBounds({
            x: 0,
            y: 0,
            width: Math.round(display.workAreaSize.width / 2),
            height: display.workAreaSize.height,
        });
    });

    globalShortcut.register('Ctrl+Alt+Right', () => {
        const display = require('electron').screen.getPrimaryDisplay();
        mainWindow.setBounds({
            x: Math.round(display.workAreaSize.width / 2),
            y: 0,
            width: Math.round(display.workAreaSize.width / 2),
            height: display.workAreaSize.height,
        });
    });

    globalShortcut.register('Ctrl+Alt+Up', () => {
        const display = require('electron').screen.getPrimaryDisplay();
        const twoThirdsWidth = Math.round(display.workAreaSize.width * 2 / 3);
        const twoThirdsHeight = Math.round(display.workAreaSize.height * 2 / 3);
        mainWindow.setBounds({
            x: Math.round((display.workAreaSize.width - twoThirdsWidth) / 2),
            y: Math.round((display.workAreaSize.height - twoThirdsHeight) / 2),
            width: twoThirdsWidth,
            height: twoThirdsHeight,
        });
    });

    globalShortcut.register('CommandOrControl+Shift+P', () => {
        if (previewWindow) {
            previewWindow.close();
        } else if (currentImage) {
            createPreviewWindow();
        }
    });
};

app.whenReady().then(() => {
    createWindow();
    registerShortcuts();
    ipcMain.on('windowControls.minimize', () => mainWindow.minimize());
    ipcMain.on('windowControls.maximizeRestore', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.on('windowControls.close', () => mainWindow.close());

    ipcMain.handle('windowControls.openImage', async () => {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'webp'] }]
        });

        if (filePaths && filePaths.length > 0) {
            const filePath = filePaths[0];
            const fileName = path.basename(filePath);
            const stats = fs.statSync(filePath);
            const dimensions = imageSizeFromFile(filePath);

            currentImage = {
                path: filePath,
                name: fileName,
                size: stats.size,
                width: (await dimensions).width,
                height: (await dimensions).height,
            };

            if (previewWindow) {
                previewWindow.webContents.send('image-data', currentImage);
            }

            return currentImage;
        }
        return null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});