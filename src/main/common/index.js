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

  // 获取配置
  ipcMain.handle('getConfig', (ev) => {
    const res = getConfig();
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
    console.log(res, 120);
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

// 统一管理快捷键
export function handleShortcut() {

  const configData =  getConfig();

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    BrowserWindow.fromId(global.mainId).toggleDevTools()
  })
  console.log()

  globalShortcut.register( configData.k0 ? configData.k0 :'Alt+R', () => {
    //判断是否最小化
    if (!BrowserWindow.fromId(global.mainId).isMinimized()) {
      BrowserWindow.fromId(global.mainId).minimize();
      // BrowserWindow.fromId(global.mainId).hide();
    } else {
      BrowserWindow.fromId(global.mainId).restore();
    }
  })

    const copyShortcut = [configData.k1, configData.k2, configData.k3, configData.k4, configData.k5];

  copyShortcut.forEach((item, index) => {
    globalShortcut.register( item, () => {
      console.log(index, 187);
      BrowserWindow.fromId(global.mainId).webContents.send('handleCopyShortcut', index);
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

//



