import {BrowserWindow, clipboard, globalShortcut, ipcMain, net, app, protocol, shell, screen, dialog} from 'electron';
import {
  mkdirSync,
  unlinkSync,
  writeFileSync,
  writeFile,
  existsSync,
  unlink,
  lstatSync,
  copyFileSync,
  readdirSync, exists
} from "fs";
import {join, basename, dirname, resolve} from "path";
import {exec} from 'child_process';
import {deleteClipboard, getClipboardFiles, getClipboardList, isCopyFile, setCurrentClipboard} from "../clipboard";
import {downloadQuickLook} from "../../utils/plugins";
import {getDeviceId, getDownLoadIcon} from "../../utils";
import {iconList} from "../../utils/options";
import CreateSettingWindow from "../setting";
import {getConfig, updateDBId} from "../../utils/database";

import rubick from 'rubick-native';
import dayjs from "dayjs";
const Store = require('electron-store');
let dblTimer = [];
const store = new Store();

// 打开文件
export function openFile (event, arg){

  shell.openPath(arg);
}
// 打开目录
export function openPath (event, arg){
  console.log(arg);
  shell.showItemInFolder(arg);
}

// 复制目录
export function copyPath (event, arg){
  console.log(arg);
  clipboard.writeText(dirname(arg));
}

// 删除文件
export function deleteFile(path) {
  if (existsSync(path) && lstatSync(path).isFile()) {
       unlinkSync(path);
  }

}


// 使用quickLook预览文件
export function openQuickLook(event, url, isTxt = false) {
  // isTxt = true，则为预览文本


    const isExist = existsSync(url);
    if (isExist) {
      if(process.platform == 'win32'){
      exec( `${join(global.pluginDir('quickLook'), 'QuickLook.exe')} ${url}`, {})
      }
      if(process.platform == 'darwin'){
        BrowserWindow.fromId(global.mainId).previewFile(url);
      }

    } else if (isTxt){
      writeFileSync(join(global.pluginDir('quickLook'), 'temp.txt'), url)

      if(process.platform == 'win32'){
        exec( `${join(global.pluginDir('quickLook'), 'QuickLook.exe')} ${join(global.pluginDir('quickLook'), 'temp.txt')}`, {})
      }
      if(process.platform == 'darwin'){
        BrowserWindow.fromId(global.mainId).previewFile(join(global.pluginDir('quickLook'), 'temp.txt'));
      }

      //  unlinkSync( join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'temp.txt'));

    }









}


//集中处理事件
export function handleEvent() {

  ipcMain.handle('getClipboardFiles', getClipboardFiles)
  // 打开文件
  ipcMain.handle('openFile', openFile)
  //打开目录
  ipcMain.handle('openPath', openPath)
  // 复制目录
  ipcMain.handle('copyPath', copyPath);
  //获取剪切板列表
  ipcMain.handle('getClipboardList', getClipboardList);

  // 设置双击项为当前剪切项
  ipcMain.handle('setCurrentClipboard', setCurrentClipboard)
  // 单独复制文件
  ipcMain.handle('isCopyFile', isCopyFile)

  // 删除选中项
  ipcMain.handle('deleteClipboard', deleteClipboard)

  // 下载quickLook
  ipcMain.handle('downloadQuickLook', downloadQuickLook);

  // 使用quickLook预览文件
  ipcMain.handle('openQuickLook', openQuickLook);

  // 重新设置快捷键
  ipcMain.handle('handleShortcut', handleShortcut);

  // 设置菜单快捷键
  ipcMain.handle('handleMenuShortcut', handleMenuShortcut);


  // 获取配置
  ipcMain.handle('getConfig', (ev) => {
    const res = getConfig();
    global.Config = res;
    return res;
  });

  // 保存配置
  ipcMain.handle('saveConfig', saveConfig);

  // 浏览器打开网页
  ipcMain.handle('toLink', (ev, link) => {
    shell.openExternal(link)
  })

  // 获取系统版本
  ipcMain.handle('getVersion',(ev, data) => {
    return app.getVersion();
  })

  // 最小化
  ipcMain.handle('handleMin', () => {
    global.settingWindow.minimize();
  })
  ipcMain.handle('handleClose', () => {
    console.log(global.settingWindow);
    global.settingWindow.close();
  })

  // 处理粘贴事件
  ipcMain.handle('handlePaste', handlePaste)

  // 设置双击快捷键
  ipcMain.handle('setDblKey', ev =>{
    return global.dblKey;
  })

  // 更换数据路径
  ipcMain.handle('changeDataPath', changeDataPath);

  // 更换路径同步数据
  ipcMain.handle('syncData', syncData);

  // 重启
  ipcMain.handle('handleRestart', handleRestart);

  // 获取基础数据路径配置
  ipcMain.handle('getDataPath', () => {
    return store.get('dataPath');
  });

}

// 统一管理通用全局变量
export function handleGlobal() {
  let dataPath = '';
  if (store.has('dataPath')) {
    dataPath = store.get('dataPath');

  } else {
     store.set('dataPath', app.getPath('userData')  + '\\data');
    dataPath = store.get('dataPath');

  }

  global.driveId = getDeviceId();
  global.exePath = dirname(process.execPath);
  global.dataDir = (path = '') => join(dataPath, path);
  global.iconDir = (path = '') => join(global.dataDir() + '\\icon\\', path);
  global.fileDir = (path = '') => join(global.dataDir() +  '\\file\\', path);
  global.tempDir = (path = '') => join(global.dataDir() +  '\\temp\\', path);
  global.dbDir = (path = '') => join(global.dataDir()  + '\\db\\', path);
  global.pluginDir = (path = '') => join(global.dataDir() +  '\\plugins\\', path);
  global.fileIsExists = (path) => existsSync(path);
  console.log(global.dataDir(), 192);

}

// 监听所有键盘、鼠标事件
export function handlePositionAndShortcut() {

    rubick.onInputEvent(ev => {
      // let mouseValue = null;
      //
      // if (ev.event.type == 'MouseMove'){
      //   console.log(ev);
      //
      // }
      // if (ev.event.type == 'ButtonRelease' && ev.event.value == 'Left'){
      //   console.log(ev);
      // }


      // 监听双击激活程序
      if (ev.event.type === 'KeyRelease' && ev.event.value  === global.Config.b1 && global.Config?.isDoubKey === 1 ) {

        if (dblTimer.length == 0) {
          dblTimer.push({time:dayjs().valueOf(), value: ev.event.value})
        } else if (dblTimer.length == 1) {
          dblTimer.push({time: dayjs().valueOf(), value: ev.event.value})
        }else if (dblTimer.length == 2) {
          dblTimer.shift();
          dblTimer.push({time: dayjs().valueOf(), value: ev.event.value})

        }

        if ( dblTimer.length == 2 &&  dblTimer[1].time - dblTimer[0].time < 1000 ) {
          console.log(dblTimer, 220);
          global.settingWindow ? global.settingWindow.webContents.send('onDblKey', dblTimer) : '';

            //判断是否最小化
              if (!global.mainWindow.isMinimized()) {
                global.mainWindow.minimize();
              // BrowserWindow.fromId(global.mainId).hide();
            } else {
                global.mainWindow.restore();
                global.mainWindow.focus();

            }
            dblTimer = [];

        }

      }
    })


}


// 统一管理快捷键
export function handleShortcut() {

  globalShortcut.unregisterAll();
  const configData =  getConfig();


  globalShortcut.register('CommandOrControl+Shift+L', () => {
    BrowserWindow.fromId(global.mainId).toggleDevTools()
  })

  if (configData.isDoubKey == 0) {
    globalShortcut.register( configData.k0 ? configData.k0 :'CommandOrControl+R', () => {
      //判断是否最小化
      if (!BrowserWindow.fromId(global.mainId).isMinimized()) {
        BrowserWindow.fromId(global.mainId).minimize();
        // BrowserWindow.fromId(global.mainId).hide();
      } else {
        BrowserWindow.fromId(global.mainId).restore();
        BrowserWindow.fromId(global.mainId).focus();
      }
    })
  }
    const copyShortcut = [configData.k1, configData.k2, configData.k3, configData.k4, configData.k5];

  copyShortcut.forEach((item, index) => {
    item && globalShortcut.register( item, () => {
      BrowserWindow.fromId(global.mainId).webContents.send('handleCopyShortcut', index + 1);
    })
  })

  const pasteShortcut = [configData.k6, configData.k7, configData.k8, configData.k9, configData.k10];

  pasteShortcut.forEach((item, index) => {
    item && globalShortcut.register( item, () => {
      BrowserWindow.fromId(global.mainId).webContents.send('handlePasteShortcut', index + 1);

    })
  })
}

// 绑定选中项菜单快捷键
export function handleMenuShortcut(ev, len = 0) {
  for (let i = 0; i < len; i++) {
    // 数据库字段从b2开始

    globalShortcut.register( global.Config['b' + (i+2)], () => {
      console.log(i, 291);
      BrowserWindow.fromId(global.mainId).webContents.send('setMenuShortcut', i);
    })
  }

}


// 获取文件系统图标
export async function getFileIcon(ext = '') {

  const res =  []

  for(const key of iconList.keys()) {
    const tempFile = join(__dirname, `temp.${key}`);
     writeFileSync(tempFile, ""); // create empty temp file
    const image = (await app.getFileIcon(tempFile)).toPNG(); // get file icon of temp file
     unlinkSync(tempFile); // delete temp file
    getDownLoadIcon(key.toLowerCase(), 'png', image);
  }

  //
  //   const tempFile = join(__dirname, `temp.${key}`);
  //   writeFileSync(tempFile, ""); // create empty temp file
  //   const image = (await app.getFileIcon(tempFile)).toDataURL(); // get file icon of temp file
  //   unlinkSync(tempFile); // delete temp file
  //   getDownLoadIcon(key.toLowerCase(), 'png', image);



  return res;

}



// 注册协议 cdm-clipboard 协议名字无所谓 自定义即可
export function regMyProtocol() {


  protocol.handle('cdm-clipboard', (request) => {
    return net.fetch('file://' + request.url.slice('cdm-clipboard://'.length))
  })

}


// 设置页面管理
export function   handleSetting() {
    const data = {
      windowTitle: '设置',
      inUrl: 'setting'
    }
    // 判断当前窗口是否已经存在， 存在的话 直接唤起
    console.log(global['settingWindow'], 36);
    if (global['settingWindow']) {

      global['settingWindow'].show()
    } else {
      CreateSettingWindow(data);
      global['settingWindow'].show()
    }

}

// 处理粘贴事件
export const handlePaste = (ev) => {
  // console.log(data.text);
  BrowserWindow.fromId(global.mainId).blur();
  // 模拟组合键，例如Ctrl+v
  rubick.sendKeyboardSimulation('{+CTRL}v{-CTRL}');
  return true;
}


// 开机自启
export function handleAutoRun(openAtLogin = true) {
  console.log(openAtLogin, 352);
  if (app.isPackaged) {

    if (app.getLoginItemSettings().openAtLogin && openAtLogin)  return;
    const ex = process.execPath;
    app.setLoginItemSettings({
      openAtLogin: openAtLogin,
      path: ex,
      openAsHidden: true,
      args: [],
    });
  }

}

// 窗口对齐位置
export function handleWindowAlign(isOffset) {
  // 居中靠右对齐
  if (isOffset == 0) {
    let display = screen.getPrimaryDisplay();
    let x = display.bounds.width - 520 - 100;
    let y = display.bounds.height - (display.bounds.height / 2) - 325;

    global.mainWindow.setPosition(x, y);
  } else if (isOffset == 1) {
    global.mainWindow.center();
  } else if (isOffset == 2) {

  }

}


export function saveConfig(ev, data)  {
  const jData =JSON.parse(data);
  const id = jData.id;
  const d = {};
  Object.keys(jData).forEach(key => {
    d[key] = jData[key] == null ? '' : jData[key];
  })
  delete d.id;
  const res = updateDBId('Config', d, id);

  store.set('dataPath', jData.dataPath);

  // 处理开机自启
  handleAutoRun(!!jData.autoStart);
  // 设置窗口位置
  handleWindowAlign(jData.isOffset);
  global.Config = jData;
  // const res = getConfig(JSON.parse(data));
  return res;
}

// 更换数据路径配置
export  async function changeDataPath(ev) {
  console.log(ev, 411);
  const res = await  dialog.showOpenDialog({
    defaultPath: global.Config.dataPath,
    properties: ['openDirectory', 'createDirectory'],
  });
  console.log(res);
  return res;
}

export function syncData(ev, oldPath, newPath) {
  console.log(oldPath, newPath, 435)
  if(!existsSync(newPath)) mkdirSync(newPath, { recursive: true })
  const files = readdirSync(oldPath, { withFileTypes: true })

  files.forEach(item => {
    const sourceItemPath = resolve(oldPath, item.name)
    const destItemPath = resolve(newPath, item.name)
    console.log(sourceItemPath,destItemPath, 442);

    if (item.isDirectory()) {
      syncData(ev, sourceItemPath, destItemPath)
    } else {
      // 开始复制文件
      copyFileSync(sourceItemPath, destItemPath)

    }
  })
}
//应用重启
export function handleRestart() {

    // 退出
    global.app.relaunch();
    global.app.quit();

}





