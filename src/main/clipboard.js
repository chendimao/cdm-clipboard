import {clipboard, ipcMain, BrowserWindow, BrowserView} from 'electron';
import {
  downloadFileToFolder,
  downloadFileToFolderNode,
  getDownLoadUrl,
  getFileHash,
  getRandomHash
} from '../utils/index';
import fs from "fs";
import {join} from "path";
const clipboardListener = require('clipboard-event');
const db = require('better-sqlite3')('foobar.db');
const { betterClipboard } = require('better-clipboard')


 // import {app} from '@electron/remote';





clipboardListener.startListening();
clipboardListener.on('change', () => {
  getClipboardFiles();
});


// 获取剪切板上文件路径
export function getClipboardFiles () {

  let params = {text: '', html: '', file: [], rtf: '', img: ''};

  // 判断剪切板类型

  clipboard.availableFormats().forEach(item => {
    console.log(item);

    if (item == 'text/plain') {
      params.text = clipboard.readText()
    } else if (item == 'text/html') {
      params.html = clipboard.readHTML()
    }else if (item == 'text/rtf') {
      params.rtf =  clipboard.readRTF()
    }else if (item == 'image/png') {
      const img = clipboard.readImage().toPNG();
      params.img = getDownLoadUrl(getFileHash(img), 'png', img);

      console.log(params.img);
    }else if (item == 'text/uri-list') {
     // params.file = betterClipboard.readFilePathList()
      params.file = clipboard.readBuffer('FileNameW').toString('ucs2').replace(RegExp(String.fromCharCode(0), 'g'), '')
    }

  })

  console.log(betterClipboard.readFilePathList());

  BrowserWindow.fromId(global.mainId).webContents.send('setClipboard', params)

 return params;
 //return getClipboard();
}


function downFile() {
  downloadFileToFolderNode();
}









