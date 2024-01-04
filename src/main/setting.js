import { BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import {is} from "@electron-toolkit/utils";
import icon from "../../resources/icon.png";
import {join} from "path";
/**
 * 必传参数
 * outUrl  外部链接
 * or
 * inUrl 内部链接
 * windowTitle 页面标题 注意：此值不可重复
 */
const CreateSettingWindow = ({
                                   ...data
                                 }) => {


  const obj = {
    width: 580,
    height: 530,
    show: false,
    backgroundColor: '#f1f3f8',
    autoHideMenuBar: true,
    alwaysOnTop: true,
    maximizable: false,
    frame: false,
    resizable: false,
    center: true,
    // titleBarStyle: 'hidden',
    closable: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
    }
  }
  // 这里创建窗口实例
  const settingWindow = new BrowserWindow(obj)
  // 注册全局快捷键-打开开发者工具（方便查看问题）
  globalShortcut.register('CommandOrControl+alt+shift+k', () => {
    settingWindow.webContents.openDevTools()
  })
  // 设置窗口名称
  settingWindow.setTitle(data.windowTitle || '设置')
  // 这里将当前窗口的唯一id，存入全局变量，以容易区分多个独立窗口
  // 变量声明下方说明
  global.settingWindowId = settingWindow.webContents.id;
  // 声明打开页面的url
  let winURL = ''
  // /settingWindow这个路由是在渲染进程创建的承载外部链接的独立窗口的页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) { // 判断若为开发环境
    // settingWindow.webContents.openDevTools()
    winURL = process.env['ELECTRON_RENDERER_URL'] + '#/' + (data.inUrl ? data.inUrl : 'settingWindow')
  } else {
    createProtocol('app')
    winURL = 'app://./index.html#' + (data.inUrl ? data.inUrl : '#/settingWindow')
  }
  // 这里是为了获取拼接需要传入到页面的参数
  const param = Object.keys(data).reduce((pre, cue) => {
    return data[cue] ? `${pre}${pre === '?' ? '' : '&'}${cue}=${data[cue]}` : pre
  }, '?')
  // 使用loadURL方法将页面注入到窗口
  settingWindow.loadURL(winURL + param)
  // 若参数设置开启最大化窗口
  if (data.maxSize) {
    settingWindow.maximize()
  }
  // 加载页面loading
  //CreateProcessLoadingPage(settingWindow, data)

  settingWindow.on('close', (e) => {
    globalShortcut.unregister('CommandOrControl+alt+shift+k')
    global.settingWindow = undefined;
    global.settingWindowId = undefined;
    setTimeout(() => {
      if (!settingWindow.isDestroyed() && settingWindow) {
        settingWindow.destroy()
      }
    }, 100)
  })

  global['settingWindow'] = settingWindow
}
export default CreateSettingWindow
