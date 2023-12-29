import {BrowserWindow, clipboard, globalShortcut, ipcMain, net,app,  protocol, shell} from 'electron';
import {mkdirSync, unlinkSync, writeFileSync, writeFile, existsSync, unlink} from "fs";
import {join, basename, dirname} from "path";
import {exec} from 'child_process';
import {deleteClipboard, getClipboardFiles, getClipboardList, isCopyFile, setCurrentClipboard} from "../clipboard";
import {downloadQuickLook} from "../../utils/plugins";
import {getDeviceId, getDownLoadIcon} from "../../utils";
import {iconList} from "../../utils/options";

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
  existsSync(path) && unlinkSync(path);
}


// 使用quickLook预览文件
export function openQuickLook(event, url, isTxt = false) {
  // isTxt = true，则为预览文本
  const isExist = existsSync(url);
  if (isExist) {

    console.log(`${join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'QuickLook.exe')} ${url}`);
    exec( `${join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'QuickLook.exe')} ${url}`, {})
  } else if (isTxt){
    console.log(isTxt,url, 33);
    writeFileSync(join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'temp.txt'), url)
    exec( `${join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'QuickLook.exe')} ${join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'temp.txt')}`, {})
  //  unlinkSync( join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'temp.txt'));

  }

  console.log(join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'temp.txt', url ));


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

  // 最小化
  ipcMain.handle('handleMin', () => {
    BrowserWindow.fromId(global.mainId).minimize();
  })
  ipcMain.handle('handleClose', () => {
    BrowserWindow.fromId(global.mainId).minimize();
    BrowserWindow.fromId(global.mainId).setSkipTaskbar(true);
  })


}

// 统一管理通用全局变量
export function handleGlobal() {
  global.driveId = getDeviceId();
  global.exePath = dirname(process.execPath);
  global.dataDir = (path = '') => join(dirname(process.execPath) + '\\data', path);
  global.iconDir = (path = '') => join(dirname(process.execPath) + '\\data\\icon\\', path);
  global.fileDir = (path = '') => join(dirname(process.execPath) + '\\data\\file\\', path);
  global.tempDir = (path = '') => join(dirname(process.execPath) + '\\data\\temp\\', path);
  global.dbDir = (path = '') => join(dirname(process.execPath) + '\\data\\db\\', path);
  global.pluginDir = (path = '') => join(dirname(process.execPath) + '\\data\\plugins\\', path);
  global.fileIsExists = (path) => existsSync(path);
}

// 统一管理快捷键
export function handleShortcut() {

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    BrowserWindow.fromId(global.mainId).toggleDevTools()
  })


  globalShortcut.register('Alt+R', () => {
    //判断是否最小化
    if (!BrowserWindow.fromId(global.mainId).isMinimized()) {
      BrowserWindow.fromId(global.mainId).minimize();
      BrowserWindow.fromId(global.mainId).hide();
    } else {
      BrowserWindow.fromId(global.mainId).restore();
    }
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



