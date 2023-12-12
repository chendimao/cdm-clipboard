import {app, shell, BrowserWindow, ipcMain, dialog,  Menu, Tray, BrowserView, protocol, net, globalShortcut } from 'electron'
import {join} from 'path'
import request from 'request'
import fs from 'fs'
import {electronApp, optimizer, is} from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {readDir} from "./readDir";
import {trayInit} from "./tray";
import {getElectronVersion} from './main'
import {downloadFileToFolder, downloadFileToFolderNode} from '../utils/index.js';


import {getClipboardFiles, getClipboardList, openFile, setCurrentClipboard} from './clipboard.js';
require('@electron/remote/main').initialize();



function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 360,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      devTools: is.dev,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return {action: 'deny'}
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }


  globalShortcut.register('CommandOrControl+Shift+L', () => {
    mainWindow.toggleDevTools()
  })



  global.mainId =  mainWindow.id;
  return mainWindow


}


// 程序单例模式
let myWindow = null
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  // 如果已经有同样的该程序正在运行，则不启动
  app.quit()
} else {
  // 如果检测到有同样的该程序正在试图启动...
  app.on(
    'second-instance',
    (event, commandLine, workingDirectory, additionalData) => {
      if (myWindow) {
        // 弹出系统提示对话框
        dialog.showMessageBox({
          message: '此程序已经正在运行',
        })
        // 如果该程序窗口处于最小化状态，则恢复窗口
        if (myWindow.isMinimized()) myWindow.restore()
        // 将该程序窗口置为当前聚焦态
        myWindow.focus()
      }
    }
  )

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {

    myWindow = createWindow();
    require("@electron/remote/main").enable(myWindow.webContents);
    // 全局变量
    global.mainWindow = myWindow;
    global.app = app;

    // 注册自定义协议
    regMyProtocol();
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
      // require("@electron/remote/main").enable(myWindow.webContents);
    })


    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })



    ipcMain.handle('getClipboardFiles', getClipboardFiles)
    // 打开文件
    ipcMain.handle('openFile', openFile)
    //获取剪切板列表
    ipcMain.handle('getClipboardList', getClipboardList);

    // 设置双击项为当前剪切项
    ipcMain.handle('setCurrentClipboard', setCurrentClipboard)

    trayInit();


  })


  app.on('before-quit', () => {
    global.db && global.db.close();
  });


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {

      app.quit()
    }
  })




}




function regMyProtocol() {
  // 注册协议 cdm-clipboard 协议名字无所谓 自定义即可

  protocol.handle('cdm-clipboard', (request) => {
   return net.fetch('file://' + request.url.slice('cdm-clipboard://'.length))
  })

}







// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
