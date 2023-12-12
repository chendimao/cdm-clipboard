import {clipboard, ipcMain, BrowserWindow, BrowserView, shell} from 'electron';
import {
  downloadFileToFolder,
  downloadFileToFolderNode,
  getDownLoadUrl,
  getFileHash, getHash,
  getRandomHash
} from '../utils/index';
import fs from "fs";
import {join} from "path";
import {getDB, getDbList, initDB, insertDB, updateDB} from "../utils/database";
import logger from '../utils/logs.js';
const clipboardListener = require('clipboard-event');

const { betterClipboard } = require('better-clipboard')

let params =  {text: '', html: '', file: '', rtf: '', img: ''};

 // import {app} from '@electron/remote';

initDB();



clipboardListener.startListening();
clipboardListener.on('change', () => {
  getClipboardFiles();
});


// 获取剪切板上文件路径
export function getClipboardFiles () {

  params.text = '';
  params.html = '';
  params.file =  '';
  params.rtf = '';
  params.img = '';

  // 判断剪切板类型
  let hash = '';

  for (const item of  clipboard.availableFormats()) {
    console.log(item, 44);
    if (item == 'text/plain') {
      params.text = clipboard.readText()
      hash = getHash(params.text);
    } else if (item == 'text/html') {
      params.html = clipboard.readHTML()
    }else if (item == 'text/rtf') {
      params.rtf =  clipboard.readRTF()
    }else if (item == 'image/png') {
      const img = clipboard.readImage().toPNG();
      hash = getFileHash(img);
      params.img = getDownLoadUrl(hash, 'png', img);
      break;
    }else if (item == 'text/uri-list') {
      //文件列表转为字符串存入数据库
      params.file = betterClipboard.readFilePathList().join(',')
      hash = getHash(params.file);
      // params.file = clipboard.readBuffer('FileNameW').toString('ucs2').replace(RegExp(String.fromCharCode(0), 'g'), '')
    }
  }



  console.log(clipboard.availableFormats(), betterClipboard.readFilePathList(), params, 62);


  //判断文件或文本hash是否已存在


  // 如果不存在则插入数据
  if (!getDB('Clipboard', hash)) {
    const res = insertDB('Clipboard', {...params, hash, syncTime: new Date().getTime(), syncStatus: 0, time: new Date().getTime()})
    BrowserWindow.fromId(global.mainId).webContents.send('setClipboard', params)
  } else {
    const update = updateDB('Clipboard', {time: new Date().getTime()}, hash);
    console.log(update);
    if (update.changes > 0) {
      params = getDB('Clipboard', hash);
    }




    BrowserWindow.fromId(global.mainId).webContents.send('updateData', params)
   // console.log(params, 81);
  }
 return params;
 //return getClipboard();
}



// 打开文件
export function openFile (event, arg){
  console.log(arg);
  shell.openPath(arg);
}

// 获取剪切板列表
export function getClipboardList(event, params) {
  return getDbList('Clipboard', params);
}

// 设置双击项为当前剪切项
export function setCurrentClipboard(event, hash) {



  const update = updateDB('Clipboard', {time: new Date().getTime()}, hash);
  console.log(update);
  if (update.changes > 0) {
    const  data = getDB('Clipboard', hash);
    console.log(data.text);

    clipboard.write({
      text: data.text,
      html: data.html,
      rtf: data.rtf,
      image: data.img
    })



    console.log(clipboard.readText(), 129)
  }
}


function downFile() {
  downloadFileToFolderNode();
}









