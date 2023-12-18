import {clipboard, shell} from 'electron';
import fs from "fs";
import {join, basename, dirname} from "path";
import {exec} from 'child_process';
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


export function openQuickLook(event, url) {
  const isExist = fs.existsSync(url)
  if (isExist) {

    console.log(`${join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'QuickLook.exe')} ${url}`);
    exec( `${join(dirname(process.execPath), '\\data\\plugins\\quickLook\\', 'QuickLook.exe')} ${url}`, {})
  } else {
    console.log('wenjianbucuznai');
  }
}
