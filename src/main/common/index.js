import {BrowserWindow, clipboard, globalShortcut, ipcMain, net,app,  protocol, shell} from 'electron';
import {mkdirSync, unlinkSync, writeFileSync, writeFile, existsSync, unlink, lstatSync} from "fs";
import {join, basename, dirname} from "path";
import {exec} from 'child_process';
import {deleteClipboard, getClipboardFiles, getClipboardList, isCopyFile, setCurrentClipboard} from "../clipboard";
import {downloadQuickLook} from "../../utils/plugins";
import {getDeviceId, getDownLoadIcon} from "../../utils";
import {iconList} from "../../utils/options";
import CreateSettingWindow from "../setting";
import {getConfig, updateDBId} from "../../utils/database";

import rubick from 'rubick-native';
import dayjs from "dayjs";

let dblTimer = [];


// 打开文件
export function openFile (event, arg){
  console.log(arg);
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
  if (lstatSync(path).isFile()) {
    existsSync(path) && unlinkSync(path);
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

  // 获取配置
  ipcMain.handle('getConfig', (ev) => {
    const res = getConfig();
    global.Config = res;
    return res;
  });

  // 保存配置
  ipcMain.handle('saveConfig', (ev, data) => {
    const jData =JSON.parse(data);
    const id = jData.id;
    const d = {};
      Object.keys(jData).forEach(key => {
        d[key] = jData[key] == null ? '' : jData[key];
    })
      delete d.id;
    const res = updateDBId('Config', d, id);


    // 处理开机自启
    handleAutoRun(!!jData.autoStart);





    global.Config = jData;
   // const res = getConfig(JSON.parse(data));





    return res;
  });

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



}

// 统一管理通用全局变量
export function handleGlobal() {
  console.log(app.getPath('userData'), 94);
  global.driveId = getDeviceId();
  global.exePath = dirname(process.execPath);
  global.dataDir = (path = '') => join(app.getPath('userData') + '\\data', path);
  global.iconDir = (path = '') => join(app.getPath('userData') + '\\data\\icon\\', path);
  global.fileDir = (path = '') => join(app.getPath('userData') + '\\data\\file\\', path);
  global.tempDir = (path = '') => join(app.getPath('userData') + '\\data\\temp\\', path);
  global.dbDir = (path = '') => join(app.getPath('userData') + '\\data\\db\\', path);
  global.pluginDir = (path = '') => join(app.getPath('userData') + '\\data\\plugins\\', path);
  global.fileIsExists = (path) => existsSync(path);


}

// 绑定双击快捷键
export function handleDoubleShortcut() {

    rubick.onInputEvent(ev => {
      // 监听双击激活程序
      if (ev.event.type === 'KeyRelease' && global.Config?.isDoubKey === 1 ) {
        if (dblTimer.length == 0) {
          dblTimer.push({time:dayjs().valueOf(), value: ev.event.value})
        } else if (dblTimer.length == 1) {
          dblTimer.push({time: dayjs().valueOf(), value: ev.event.value})
        }else if (dblTimer.length == 2) {
          dblTimer.shift();
          dblTimer.push({time: dayjs().valueOf(), value: ev.event.value})

        }

        if ( dblTimer.length == 2 &&  dblTimer[1].time - dblTimer[0].time < 1000 && dblTimer[1].value == dblTimer[0].value ) {

          global.settingWindow ? global.settingWindow.webContents.send('onDblKey', dblTimer) : '';
          if(global.Config.b1 ==  dblTimer[0].value &&  global.Config.b1 ==  dblTimer[1].value) {
            //判断是否最小化
              if (!global.mainWindow.isMinimized()) {
                global.mainWindow.minimize();
              // BrowserWindow.fromId(global.mainId).hide();
            } else {
                global.mainWindow.restore();
            }
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
  console.log(configData);

  if (configData.isDoubKey == 0) {
    globalShortcut.register( configData.k0 ? configData.k0 :'CommandOrControl+R', () => {
      //判断是否最小化
      if (!BrowserWindow.fromId(global.mainId).isMinimized()) {
        BrowserWindow.fromId(global.mainId).minimize();
        // BrowserWindow.fromId(global.mainId).hide();
      } else {
        BrowserWindow.fromId(global.mainId).restore();
      }
    })
  }



    const copyShortcut = [configData.k1, configData.k2, configData.k3, configData.k4, configData.k5];

  copyShortcut.forEach((item, index) => {
    globalShortcut.register( item, () => {
      console.log(index, 187);
      BrowserWindow.fromId(global.mainId).webContents.send('handleCopyShortcut', index + 1);
    })
  })

  const pasteShortcut = [configData.k6, configData.k7, configData.k8, configData.k9, configData.k10];

  pasteShortcut.forEach((item, index) => {
    globalShortcut.register( item, () => {
      BrowserWindow.fromId(global.mainId).webContents.send('handlePasteShortcut', index + 1);

    })
  })
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






