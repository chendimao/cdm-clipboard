import {clipboard, ipcMain, BrowserWindow, BrowserView, shell, app} from 'electron';
import {
  copyFileToCache,
  downloadFileToFolder,
  downloadFileToFolderNode,
  getDownLoadUrl,
  getFileHash, getHash,
  getRandomHash
} from '../utils/index';
import fs from "fs";
import {join, basename} from "path";
import {
  deleteDB,
  execQuerySql,
  execSql,
  execUpdateSql,
  getDB,
  getDbList,
  initDB,
  insertCache,
  insertDB,
  updateDB
} from "../utils/database";
import logger from '../utils/logs.js';
const clipboardListener = require('clipboard-event');

const { betterClipboard } = require('better-clipboard')

let params =  {text: '', html: '', file: '', rtf: '', img: '', cache: ''};

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
  params.cache = '';

  // 判断剪切板类型
  let hash = '';

  for (const item of  clipboard.availableFormats()) {
    console.log(item, 44);
    if (item === 'text/plain') {
      params.text = clipboard.readText()
      hash = getHash(params.text);
    } else if (item === 'text/html') {
      params.html = clipboard.readHTML()
    }else if (item === 'text/rtf') {
      params.rtf =  clipboard.readRTF()
    }else if (item === 'image/png') {
      const img = clipboard.readImage().toPNG();
      hash = getFileHash(img);
      params.img = getDownLoadUrl(hash, 'png', img);
      params.cache = params.img;
      //数据写入缓存表
      insertOrUpdateCache({hash, img: params.img,  cache: params.cache, drive: global.driveId, syncTime: '', syncStatus: 0, time: new Date().getTime()})

      break;
    }else if (item === 'text/uri-list') {
      //文件列表转为字符串存入数据库
      params.file = betterClipboard.readFilePathList().join(',')
      hash = getHash(params.file);

      // 将文件写入缓存
      let cacheList = []
      betterClipboard.readFilePathList().forEach(item => {
          copyFileToCache(item, app.getPath('userData') + '\\data\\file\\' + basename(item))
          cacheList.push(app.getPath('userData') + '\\data\\file\\' + basename(item));
      })
      params.cache = cacheList.join(',');
      //数据写入缓存表
      insertOrUpdateCache({hash,file: params.file, cache: params.cache, drive: global.driveId, syncTime: '', syncStatus: 0, time: new Date().getTime()})
      // params.file = clipboard.readBuffer('FileNameW').toString('ucs2').replace(RegExp(String.fromCharCode(0), 'g'), '')
    }



  }



 // console.log(clipboard.availableFormats(), betterClipboard.readFilePathList(), params, 62);


  //判断文件或文本hash是否已存在


  // 如果不存在则插入数据
  if (!getDB('Clipboard', hash)) {
    const res = insertDB( {...params, hash, syncTime: new Date().getTime(), syncStatus: 0,  time: new Date().getTime()})
    BrowserWindow.fromId(global.mainId).webContents.send('setClipboard', params)
  } else {
    const update = updateDB('Clipboard', {time: new Date().getTime()}, hash);
      params = getDB('Clipboard', hash);
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
  console.log(hash, 141);
  const update = updateDB('Clipboard', {time: new Date().getTime()}, hash);
  console.log(update, 142);
  if (update.changes > 0) {
    const  data = getDB('Clipboard', hash);
    console.log(data.text);

    clipboard.write({
      text: data.text,
      html: data.html,
      rtf: data.rtf,
      image: data.img
    })
    return data;
  }
  return false;

}

// 删除剪切板
export function deleteClipboard(event, hash) {
  console.log(getDB('Clipboard', hash),hash, 153);
  if(getDB('Clipboard', hash)) {
    deleteDB('Clipboard', hash);
    return true;
  }
}


function downFile() {
  downloadFileToFolderNode();
}


//写入或更新缓存
function insertOrUpdateCache(data) {
  //根据hash和drive字段查询cache表
 const res =  execQuerySql(`select * from Cache where hash = '${data.hash}' and drive = '${data.drive}'`);
  console.log(res, 163);
  if (res.length === 0) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(item => `'${item}'`);
    const updateRes = execUpdateSql(`INSERT INTO Cache(${keys}) VALUES(${values})`);
    console.log(updateRes);
  } else {
    const updateCache = updateDB('Cache', {time: new Date().getTime()}, data.hash);
    console.log(updateCache);
  }


  //execSql('INSERT OR REPLACE INTO Cache(hash, data) VALUES(?, ?)', [data.hash, JSON.stringify()]);
  //insertCache(data)
}









